const multer = require("multer");
const XLSX = require("xlsx");
const Files = require("../../models/TempleteModel/files");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const { createExtractorFromFile } = require("node-unrar-js");
const getAllDirectories = require("../../services/directoryFinder");
const jsonToCsv = require("../../services/json_to_csv");

async function extractArchive(file, destination) {
  try {
    const extractor = await createExtractorFromFile({
      filepath: file,
      targetPath: destination,
    });
    const files = [...extractor.extract().files];
    return { success: true, files };
  } catch (err) {
    console.error("Extraction failed:", err);
    return { success: false, error: err };
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = ["zip", "zipx", "jar", "apk", "ipa", "cbz", "7z", "rar"];
    const destinationFolder = ext.includes(file.originalname.split(".").pop())
      ? "zipFile/"
      : "csvFile/";
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now() / 1000;
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "csvFile" },
  { name: "zipFile" },
]);

async function processCSV(filePath, res, req, createdFile, pathDir) {
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "",
    });
    const colNames = req.query.imageNames.split(",");
    const updatedJson = data.map((obj) => obj);
    const missingCols = colNames.filter(
      (colName) => !updatedJson[0].hasOwnProperty(colName)
    );
    if (missingCols.length > 0) {
      return res.status(400).json({
        error: `Image column name(s) not found: ${missingCols.join(", ")}`,
      });
    }
    colNames.forEach((colName) => {
      const column = colName.replaceAll('"', "");
      updatedJson.forEach((obj) => {
        const imagePath = obj[column];
        const filename = path.basename(imagePath);
        obj[column] = `${pathDir}/${filename}`;
      });
    });
    fs.unlinkSync(filePath);
    const updatedCSVContent = jsonToCsv(updatedJson);
    fs.writeFileSync(filePath, updatedCSVContent, {
      encoding: "utf8",
    });
    res.status(200).json({ fileId: createdFile.id });
    console.log("File processed successfully");
  } else {
    res.status(404).json({ error: "CSV File not found" });
  }
}

const handleUpload = async (req, res, next) => {
  const userRole = req.role;
  if (userRole !== "Admin") {
    return res
      .status(403)
      .json({ message: "You don't have access for performing this action" });
  }
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, async function (err) {
        if (err) {
          console.error("Error uploading files:", err);
          return reject("Error uploading files");
        }
        const { csvFile, zipFile } = req.files;
        const createdFile = await Files.create({
          csvFile: csvFile[0].filename,
          zipFile: zipFile[0].filename,
          templeteId: req.params.id,
        });
        const filePath = path.join(
          __dirname,
          "../../csvFile",
          csvFile[0].filename
        );
        const zipFilePath = path.join(
          __dirname,
          "../../zipFile",
          zipFile[0].filename
        );
        const fileNameArray = zipFile[0].filename.split(".");
        const extension = fileNameArray[fileNameArray.length - 1];
        let destinationFolderPath = path.join(
          __dirname,
          "../../extractedFiles",
          zipFile[0].filename.replace(`.${extension}`, "")
        );

        if (!fs.existsSync(destinationFolderPath)) {
          fs.mkdirSync(destinationFolderPath, { recursive: true });
        }
        let allDirectories;
        if (extension === "rar") {
          try {
            const extractionResult = await extractArchive(
              zipFilePath,
              destinationFolderPath
            );

            if (!extractionResult.success) {
              console.error("Extraction failed:", extractionResult.error);
              return res.status(400).json({ error: "Extraction failed" });
            }
            allDirectories = getAllDirectories(destinationFolderPath);
            const pathDir = `${zipFile[0].filename.replace(
              `.${extension}`,
              ""
            )}/${allDirectories.join("/")}`;

            await processCSV(filePath, res, req, createdFile, pathDir);
          } catch (extractionErr) {
            console.error("Error during extraction:", extractionErr);
            return res.status(400).json({ error: "Extraction failed" });
          }
        } else if (extension === "zip") {
          const extractStream = unzipper.Parse();
          extractStream.on("entry", (entry) => {
            const fileName = entry.path;
            const destinationPath = path.join(destinationFolderPath, fileName);
            const parentDir = path.dirname(destinationPath);
            if (!fs.existsSync(parentDir)) {
              fs.mkdirSync(parentDir, { recursive: true });
            }
            if (fileName.endsWith("/")) {
              fs.mkdirSync(destinationPath, { recursive: true });
            } else {
              entry.pipe(fs.createWriteStream(destinationPath));
            }
          });

          extractStream.on("error", (err) => {
            console.error("Error unzipping file:", err);
            reject(err);
          });

          extractStream.on("finish", async () => {
            allDirectories = getAllDirectories(destinationFolderPath);
            const pathDir = `${zipFile[0].filename.replace(
              `.${extension}`,
              ""
            )}/${allDirectories.join("/")}`;

            await processCSV(filePath, res, req, createdFile, pathDir);
          });

          fs.createReadStream(zipFilePath).pipe(extractStream);
        }
      });
    });
  } catch (error) {
    console.error("Error handling upload:", error);
    return res.status(500).send(error);
  }
};

module.exports = handleUpload;
