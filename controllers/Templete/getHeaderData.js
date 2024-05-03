const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const getHeaderData = (req, res, next) => {
  const userRole = req.role;
  if (userRole != "Admin") {
    return res
      .status(500)
      .json({ message: "you dont have access for performing this action" });
  }

  // console.log(req.params.id); /* want fileid in params */

  try {
    Files.findOne({ where: { id: req.params.id } }).then((fileData) => {
      console.log(fileData);
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }
      const fileName = fileData.csvFile;
      const filePath = path.join(__dirname, "../../csvFile", fileName);
      // console.log(filePath);

      if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
          defval: ""
        });
        if (data[0] == undefined || data[0] == null) {
          return res
            .status(404)
            .json({ error: "No content found in excel sheet" });
        }
        // console.log(data[0])
        // console.log(Object.keys(data[0]));
        res.status(200).json(Object.keys(data[0]));
      } else {
        res.status(404).json({ error: "File not found on given filepath" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getHeaderData;
