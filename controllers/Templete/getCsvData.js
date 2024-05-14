const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Files = require("../../models/TempleteModel/files");

const getCsvData = async (req, res, next) => {
  try {
    const fileId = req.body?.taskData?.fileId;
    if (!fileId) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findOne({ where: { id: fileId } });
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    let workbook, worksheet;
    try {
      workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
    } catch (readError) {
      console.error("Error reading CSV file:", readError);
      return res.status(500).json({ error: "Error reading CSV file" });
    }

    const { min, max, conditions } = req.body?.taskData || {};
    const minIndex = parseInt(min);
    const maxIndex = parseInt(max);

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (
      isNaN(minIndex) ||
      isNaN(maxIndex) ||
      minIndex < 0 ||
      minIndex >= jsonData.length ||
      maxIndex < 0 ||
      maxIndex >= jsonData.length ||
      maxIndex < minIndex
    ) {
      return res.status(400).json({ error: "Invalid min or max value" });
    }

    const minToMaxData = jsonData.slice(minIndex, maxIndex + 1);

    function isBlankOrSpecial(obj, conditions) {
      const blankCount = conditions.Blank || 0;
      const includeStar = conditions["*"] || false;
      const includeAllData = conditions.AllData || false;

      const blankAndSpaceCount = Object.values(obj).reduce(
        (count, value) => {
          if (typeof value === "string") {
            if (value.trim() === "" || value === "BLANK") {
              count.blank += 1;
            }
            if (value.includes(" ")) {
              count.space += 1;
            }
          }
          return count;
        },
        { blank: 0, space: 0 }
      );

      const totalOccurrences =
        blankAndSpaceCount.blank + blankAndSpaceCount.space;

      if (includeAllData) {
        return Object.values(obj).some(
          (value) =>
            typeof value === "string" &&
            (value.trim() === "" || value === "BLANK" || value.includes("*"))
        );
      }

      if (includeStar) {
        const hasStar = Object.values(obj).some(
          (value) => typeof value === "string" && value.includes("*")
        );

        if (blankCount > 0) {
          return hasStar || totalOccurrences >= blankCount;
        }
        return hasStar;
      }

      if (blankCount > 0) {
        return totalOccurrences >= blankCount;
      }

      return false;
    }

    const filteredData = [];
    minToMaxData.forEach((obj, index) => {
      const conditionCheck = isBlankOrSpecial(obj, conditions);
      if (conditionCheck) {
        // Attach rowIndex to the object and add it to filteredData
        filteredData.push({ ...obj, rowIndex: index });
      }
    });

    if (filteredData.length === 0) {
      return res.status(404).json({ error: "No data matching the conditions" });
    }

    filteredData.unshift(jsonData[0]);

    res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error handling data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getCsvData;
