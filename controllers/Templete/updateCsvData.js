const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const updateCsvData = async (req, res, next) => {
  const { data, index } = req.body;
  const fileId = req.params.id;

  try {
    // Retrieve the original file data from the database
    const fileData = await Files.findOne({ where: { id: fileId } });
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileName = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", fileName);

    // Load existing CSV file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the worksheet to an array of rows
    const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Update the specific row in the array
    csvData[index] = Object.values(data);

    // Create a new worksheet with the updated data
    const updatedWorksheet = XLSX.utils.aoa_to_sheet(csvData);

    // Create a new workbook and add the updated worksheet
    const updatedWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(updatedWorkbook, updatedWorksheet, sheetName);

    // Write the updated workbook to the file
    XLSX.writeFile(updatedWorkbook, filePath);

    // Respond with success message
    res.status(200).json({ message: "File Updated Successfully" });
  } catch (error) {
    console.error("Error updating CSV file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateCsvData;
