const Assigndata = require("../../models/TempleteModel/assigndata")
const csv = require('csv-parser');
const fs = require("fs");
const path = require("path");

function readCSVAndConvertToJSON(filePath) {
    return new Promise((resolve, reject) => {
        const jsonArray = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                jsonArray.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve(jsonArray);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}
const userData = async (req, res) => {
    const taskId = req.params.taskId;
    const task = await Assigndata.findOne({ where: { id: taskId } });
    const { max, min, errorFilePath, correctedCsvFilePath, imageDirectoryPath, currentIndex } = task;


    const errorJsonFile = await readCSVAndConvertToJSON(errorFilePath);
    const sendFile = errorJsonFile[min - 1];
    // const sendFileData = sendFile[0];
    const imageName = sendFile.IMAGE_NAME;

    const image = path.join(imageDirectoryPath, imageName);
    // Read the image file and convert it to base64
    fs.readFile(image, { encoding: 'base64' }, (err, data) => {
        if (err) {
            console.error("Error reading image:", err);
            return res.status(500).send({ message: "Error reading image" });
        }
        // Construct the base64 URL
        const base64URL = `data:image/jpeg;base64,${data}`;

        // Send the response with the base64 URL
        res.status(201).send({ message: "Task found succesfully", data: sendFile, currentIndex: currentIndex, imageURL: base64URL, min: min, max: max })

    });
}

module.exports = userData;