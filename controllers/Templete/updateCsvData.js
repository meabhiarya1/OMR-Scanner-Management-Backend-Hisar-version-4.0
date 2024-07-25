const Files = require("../../models/TempleteModel/files");
const Assigndata = require("../../models/TempleteModel/assigndata");
const UpdatedData = require("../../models/TempleteModel/updatedData");
const UserDetails = require("../../models/User");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const jsonToCsv = require("../../services/json_to_csv");
const { LRUCache } = require("lru-cache");

// Configure the LRU cache
const cache = new LRUCache({
  max: 1000, // Increase max number of items if needed
  maxSize: 100 * 1024 * 1024, // Increase maximum cache size to 100 MB
  sizeCalculation: (value, key) => {
    return JSON.stringify(value.csvData).length;
  },
  ttl: 1000 * 60 * 60 * 2, // Increase TTL to 2 hours if needed
});

const checkAndAddColumn = (csvData, columnName, index) => {
  if (index === -1) {
    csvData[0].push(columnName);
    return csvData[0].length - 1;
  }
  return index;
};

const updateCsvData = async (req, res, next) => {
  const { updatedData, index, updatedColumn } = req.body;

  if (updatedColumn === null) {
    return res.status(300).json({ message: "Nothing to Update" });
  }

  const fileId = req.params.id;
  const updatedIndex = updatedData.rowIndex;
  delete updatedData.rowIndex;

  try {
    // Check if file data is already in cache
    if (!cache.has(fileId)) {
      const fileData = await Files.findOne({ where: { id: fileId } });
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileName = fileData.csvFile;
      const filePath = path.join(__dirname, "../../csvFile", fileName);

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Check and add necessary columns
      const userDetailsIndex = checkAndAddColumn(
        csvData,
        "User Details",
        csvData[0].indexOf("User Details")
      );
      const previousValueIndex = checkAndAddColumn(
        csvData,
        "Previous Values",
        csvData[0].indexOf("Previous Values")
      );
      const updatedValueIndex = checkAndAddColumn(
        csvData,
        "Updated Values",
        csvData[0].indexOf("Updated Values")
      );
      const updatedColIndex = checkAndAddColumn(
        csvData,
        "Updated Col. Name",
        csvData[0].indexOf("Updated Col. Name")
      );

      // Store in cache along with column indices
      cache.set(fileId, {
        csvData,
        filePath,
        userDetailsIndex,
        previousValueIndex,
        updatedValueIndex,
        updatedColIndex,
      });
    }

    const {
      csvData,
      filePath,
      userDetailsIndex,
      previousValueIndex,
      updatedValueIndex,
      updatedColIndex,
    } = cache.get(fileId);

    const assignData = await Assigndata.findOne({
      where: { userId: req.userId },
    });

    const userDetails = await UserDetails.findOne({
      where: { id: req.userId },
    });

    const { min } = assignData;
    const minIndex = parseInt(min);

    // Directly update the specific row using updatedIndex
    csvData[updatedIndex + minIndex] = Object.values(updatedData);
    const updatedColumns = Object.keys(updatedColumn);
    csvData[updatedIndex + minIndex][
      userDetailsIndex
    ] = `${userDetails.userName}:${userDetails.email}`;
    csvData[updatedIndex + minIndex][previousValueIndex] = updatedColumns
      .map((key) => updatedColumn[key][1])
      .join(",");
    csvData[updatedIndex + minIndex][updatedValueIndex] = updatedColumns
      .map((key) => updatedColumn[key][0])
      .join(",");
    csvData[updatedIndex + minIndex][updatedColIndex] =
      updatedColumns.join(",");

    await UpdatedData.create({
      updatedColumn: updatedColumns.join(","),
      previousData: updatedColumns
        .map((key) => updatedColumn[key][1])
        .join(","),
      currentData: updatedColumns.map((key) => updatedColumn[key][0]).join(","),
      fileId: fileId,
      rowIndex: updatedIndex,
      userId: req.userId,
    });

    const headers = csvData[0];
    const jsonArray = csvData.slice(1).map((row) => {
      return headers.reduce((acc, header, j) => {
        acc[header] = row[j];
        return acc;
      }, {});
    });

    const updatedCSVContent = jsonToCsv(jsonArray);
    if (!updatedCSVContent) {
      throw new Error("Error converting updated JSON to CSV");
    }

    fs.writeFileSync(filePath, updatedCSVContent, { encoding: "utf8" });

    // Update cache with new data
    cache.set(fileId, {
      csvData,
      filePath,
      userDetailsIndex,
      previousValueIndex,
      updatedValueIndex,
      updatedColIndex,
    });

    res.status(200).json({ message: "File Updated Successfully" });
  } catch (error) {
    console.error("Error Updating CSV file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateCsvData;
