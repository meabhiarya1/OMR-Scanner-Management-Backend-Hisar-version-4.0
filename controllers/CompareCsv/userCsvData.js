const Assigndata = require("../../models/TempleteModel/assigndata")
const csv = require('csv-parser');
const fs = require("fs");

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
    const { max, min, errorFilePath, correctedCsvFilePath } = task;
    // console.log(max, min, errorFilePath, correctedCsvFilePath);

    const errorJsonFile = await readCSVAndConvertToJSON(errorFilePath);
    const sendFile = errorJsonFile.splice(min - 1, max);
    console.log(sendFile)
}

module.exports = userData;