const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Files = require("../../models/TempleteModel/files");

const getCsvData = async (req, res, next) => {
  console.log(req.params.id)
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "File not provided" });
    }
    Files.findOne({ where: { id: req.params.id } }).then((fileData) => {
      // console.log(fileData)
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }

      const filename = fileData.csvFile;
      const filePath = path.join(__dirname, "../../csvFile", filename);
      // console.log(filePath)

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: "BLANK" });

      // fs.unlinkSync(filePath);
      // console.log(data)
      res.status(200).json(data);
    });
  } catch (error) {
    console.error("Error handling data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getCsvData;
