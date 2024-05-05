const Assigndata = require("../../models/TempleteModel/assigndata");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

function readCSVAndConvertToJSON(filePath) {
  return new Promise((resolve, reject) => {
    const jsonArray = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        jsonArray.push(row);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        resolve(jsonArray);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
exports.userData = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Assigndata.findOne({ where: { id: taskId } });
    const {
      max,
      min,
      errorFilePath,
      correctedCsvFilePath,
      imageDirectoryPath,
      currentIndex,
    } = task;
    const { currindex } = req.headers;

    const errorJsonFile = await readCSVAndConvertToJSON(errorFilePath);
    // console.log(errorJsonFile.length);
    // const accessibleErrorJsonFile = errorJsonFile.splice(min-1,max);
    const sendFile = errorJsonFile[currindex - 1];
    // const sendFileData = sendFile[0];
    const imageName = sendFile.IMAGE_NAME;

    const image = path.join(imageDirectoryPath, imageName);
    // Read the image file and convert it to base64
    fs.readFile(image, { encoding: "base64" }, (err, data) => {
      if (err) {
        console.error("Error reading image:", err);

        return res.status(500).send({ message: "Error reading image" });
      }
      // Construct the base64 URL
      const base64URL = `data:image/jpeg;base64,${data}`;

      // Send the response with the base64 URL
      res.status(201).send({
        message: "Task found succesfully",
        data: sendFile,
        currentIndex: currentIndex,
        imageURL: base64URL,
        min: min,
        max: max,
      });
    });
  } catch (err) {
    console.error(err);
  }
};

exports.saveData = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { column_name, corrected_value } = req.body;
    const task = await Assigndata.findOne({ where: { id: taskId } });
    const { errorFilePath, correctedCsvFilePath, currentIndex, primary_key } =
      task;

    // Read the original CSV file
    const originalCSVContent = fs.readFileSync(errorFilePath, "utf8");

    // Parse CSV content to JSON or manipulate it directly
    const errorJsonFile = await readCSVAndConvertToJSON(errorFilePath);
    const errorFile = errorJsonFile[currentIndex - 1];

    // Update the necessary fields
    errorFile["CORRECTED"] = [
      ...errorFile["CORRECTED"],
      { [column_name]: corrected_value },
    ];

    // Convert JSON back to CSV format
    const updatedCSVContent = convertJSONToCSV(errorJsonFile);

    // Write the updated content back to the original file
    fs.writeFileSync(errorFilePath, updatedCSVContent, "utf8");

    const correctedCsvJsonFile = await readCSVAndConvertToJSON(
      correctedCsvFilePath
    );
    for (let i = 0; i < correctedCsvJsonFile.length; i++) {
      if (correctedCsvJsonFile[i][primary_key] === primary_key) {
        correctedCsvJsonFile[i][column_name] = corrected_value;
        correctedCsvJsonFile[i] = {
          ...correctedCsvJsonFile[i],
          CORRECTED_BY: "GAURAV",
          "CORRECTION COLUMN": [column_name],
        };
        break;
      }
    }
    // Convert JSON back to CSV format
    const updatedCorrectedCSVContent = convertJSONToCSV(correctedCsvJsonFile);
    fs.writeFileSync(correctedCsvFilePath, updatedCorrectedCSVContent, "utf8");
  } catch (err) {}
};

// module.exports = userData;
