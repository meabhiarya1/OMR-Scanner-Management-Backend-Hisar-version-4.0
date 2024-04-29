const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Files = require("../../models/TempleteModel/files");

const getCsvData = async (req, res, next) => {
  console.log(req.body.taskData,"-------task")
  const userPermission = req.permissions
  
  if(userPermission.dataEntry !== true){
    return res.status(500).json({message: "user not authorised"})
  }
  try {
    if (!req.body.taskData.fileId) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findOne({ where: { id: req.body.taskData.fileId } });
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "BLANK",
    });

    let { min, max } = req.body.taskData;
   
    min = parseInt(min)
    max = parseInt(max)

    if (min < 0 || min >= data.length || max < 0 || max >= data.length) {
      return res.status(400).json({ error: "Invalid min or max value" });
    }

    if (max < min) {
      return res.status(400).json({ error: "Max must be greater than min" });
    }

    const minToMaxData = data.filter(
      (_, index) => index >= min && index <= max
    );
    minToMaxData.unshift(data[0]);

    res.status(200).json(minToMaxData);
  } catch (error) {
    console.error("Error handling data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getCsvData;
