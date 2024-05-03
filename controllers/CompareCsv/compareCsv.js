const path = require("path");
const fs = require("fs");
const csvToJson = require("../../services/csvExtractor");
const compareCsv = async (req, res) => {

    // Access other form data parameters

    const { firstInputFileName, secondInputFileName, primaryKey, skippingKey, imageColName } = req.body;
    // const firstInputFileName = req.body.firstInputFileName;
    // const secondInputFileName = req.body.secondInputFileName;
    // const primaryKey = req.body.primaryKey;
    // const skippingKey = req.body.skippingKey;
    // const imageColName = req.body.imageColName;


    const firstCSVFile = req.uploadedFiles.firstInputCsvFile
    const secondCSVFile = req.uploadedFiles.secondInputCsvFile
    const firstFilePath = path.join(__dirname, "../", "../", "multipleCsvCompare", firstInputFileName);
    const secondFilePath = path.join(__dirname, "../", "../", "multipleCsvCompare", secondInputFileName);
console.log(firstCSVFile);
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




    // const csvData = csvParser(diff);

    // // Set the content type to CSV
    // res.set('Content-Type', 'text/csv');

    // // Set the content disposition header to trigger download
    // res.set('Content-Disposition', 'attachment; filename="data.csv"');

    // Send the CSV data as the response
    res.status(200).send({
        csvFile: f1,
        data: diff
    });
}

module.exports = compareCsv;

