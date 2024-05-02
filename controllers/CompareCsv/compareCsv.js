const path = require("path");
const fs = require("fs");
const csvToJson = require("../../services/csvExtractor");
const { parse } = require('json2csv');

const compareCsv = async (req, res) => {

    // Access other form data parameters
    const { firstInputFileName, secondInputFileName, primaryKey, skippingKey, imageColName, zipfileName } = req.body;
    const firstCSVFile = req.uploadedFiles.firstInputCsvFile
    const secondCSVFile = req.uploadedFiles.secondInputCsvFile
    const firstFilePath = path.join(__dirname, "../", "../", "multipleCsvCompare", firstInputFileName);
    const secondFilePath = path.join(__dirname, "../", "../", "multipleCsvCompare", secondInputFileName);
    console.log(firstInputFileName, secondInputFileName, primaryKey, skippingKey, imageColName)
    const f1 = await csvToJson(firstFilePath)
    const f2 = await csvToJson(secondFilePath)

    const diff = [];

    for (let i = 0; i < f1.length; i++) {
        for (let j = 0; j < f2.length; j++) {
            const pkLength = f1[i][primaryKey].length;
            const str = " ".repeat(pkLength);

            if (f1[i][primaryKey] === f2[j][primaryKey] && f1[i][primaryKey] !== str && f2[i][primaryKey] !== str) {
                for (let [key, value] of Object.entries(f1[i])) {
                    if (value !== f2[j][key]) {
                        const val1 = value;
                        const val2 = f2[j][key];
                        const imgPathArr = f1[i][imageColName]?.split("\\");
                        const imgName = imgPathArr[imgPathArr.length - 1]

                        if (!skippingKey.includes(key)) {

                            const obj = {
                                "PRIMARY": ` ${f1[i][primaryKey]}`,
                                "COLUMN_NAME": key,
                                "FILE_1_DATA": val1,
                                "FILE_2_DATA": val2,
                                "IMAGE_NAME": imgName
                            }
                            diff.push(obj);
                        }
                    }
                }
            } else if (f1[i][primaryKey] === str && f2[i][primaryKey] !== str && i === j) {
                for (let [key, value] of Object.entries(f1[i])) {
                    if (value !== f2[j][key]) {
                        const val1 = value;
                        const val2 = f2[j][key];
                        const imgPathArr = f1[i][imageColName].split("\\");
                        const imgName = imgPathArr[imgPathArr.length - 1]

                        if (!skippingKey.includes(key)) {

                            const obj = {
                                "PRIMARY": f1[i][primaryKey],
                                "COLUMN_NAME": key,
                                "FILE_1_DATA": val1,
                                "FILE_2_DATA": val2,
                                "IMAGE_NAME": imgName
                            }
                            diff.push(obj);
                        }
                    }
                }
            }
        }

    }



    const csvData = parse(diff);

    const directoryPath = path.join(__dirname, "../", "../", 'ErrorCsv');
    // Create directory if it doesn't exist
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Specify the file path within the directory
    const filePath = path.join(directoryPath, 'output.csv');

    fs.writeFile(filePath, csvData, (err) => {
        if (err) {
            console.error('Error writing CSV file:', err);
        } else {
            console.log('CSV file saved successfully.');
        }
    });
    // Set the content type to CSV
    res.set('Content-Type', 'text/csv');

    // Set the content disposition header to trigger download
    res.set('Content-Disposition', 'attachment; filename="data.csv"');
console.log(diff.length)
    // Send the CSV data as the response
    res.status(200).send({
        csvFile: f1,
        data: diff
    });
}

module.exports = compareCsv;

