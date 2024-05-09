const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const duplicateRemoval = async (req, res, next) => {
  const { colName, fileID } = req.body;

  try {
    // Check if file ID is provided
    if (!fileID) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    // Find the file data by ID
    const fileData = await Files.findByPk(fileID);
    if (!fileData || !fileData.csvFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get the file path
    const filename = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert worksheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "",
    });

    // Find duplicates
    const duplicates = {};
    data.forEach((row, index) => {
      const value = row[colName];
      if (value) {
        if (duplicates[value]) {
          duplicates[value].push({ index, row });
        } else {
          duplicates[value] = [{ index, row }];
        }
      }
    });

    // Filter out non-duplicate values
    const duplicateValues = Object.keys(duplicates).filter(
      (value) => duplicates[value].length > 1
    );

    if (duplicateValues.length === 0) {
      return res.status(404).json({ message: "No Duplicates Found" });
    }

    // Create an array of duplicate rows with their original data and index
    const duplicateRows = duplicateValues.flatMap((value) => duplicates[value]);

    return res.status(200).json({ duplicates: duplicateRows });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = duplicateRemoval;
