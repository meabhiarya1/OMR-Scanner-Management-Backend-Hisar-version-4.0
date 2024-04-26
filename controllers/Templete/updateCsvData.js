const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const updateCsvData = async (req, res, next) => {
  const data = req.body;
  const id = req.params.id;

  try {
    // Retrieve the original file data from the database
    const fileData = await Files.findOne({ where: { id: id } });
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileName = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", fileName);

    // Convert incoming data to CSV format
    const csvData = XLSX.utils.json_to_sheet(data);

    // Remove the original file
    fs.unlinkSync(filePath);

    // Write the updated CSV data to the file
    XLSX.writeFile(
      { SheetNames: [fileName], Sheets: { [fileName]: csvData } },
      filePath
    );

    const updatedData = XLSX.utils.sheet_to_json(csvData);
    console.log(updatedData);

    // Respond with success message
    res.status(200).json({ message: "File Updated Successfully", updatedData });
  } catch (error) {
    console.error("Error updating CSV file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateCsvData;
