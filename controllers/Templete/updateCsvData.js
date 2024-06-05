const Files = require("../../models/TempleteModel/files");
const Assigndata = require("../../models/TempleteModel/assigndata");
const UpdatedData = require("../../models/TempleteModel/updatedData");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const jsonToCsv = require("../../services/json_to_csv");

const updateCsvData = async (req, res, next) => {
  const { updatedData, index, updatedColumn } = req.body;

  if (updatedColumn === null) {
    return res.status(300).json({ message: "Nothing to Update" });
  }

  const fileId = req.params.id;
  const updatedIndex = updatedData.rowIndex;
  delete updatedData.rowIndex;

  try {
    const fileData = await Files.findOne({ where: { id: fileId } });
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const assignData = await Assigndata.findOne({
      where: { userId: req.userId },
    });

    const { min, max } = assignData;
    const minIndex = parseInt(min);
    const fileName = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", fileName);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const checkAndAddColumn = (columnName, index) => {
      if (index === -1) {
        csvData[0].push(columnName);
        return csvData[0].length - 1;
      }
      return index;
    };

    const userDetailsIndex = checkAndAddColumn(
      "User Details",
      csvData[0].indexOf("User Details")
    );
    const previousValueIndex = checkAndAddColumn(
      "Previous Values",
      csvData[0].indexOf("Previous Values")
    );
    const updatedValueIndex = checkAndAddColumn(
      "Updated Values",
      csvData[0].indexOf("Updated Values")
    );
    const updatedColIndex = checkAndAddColumn(
      "Updated Col. Name",
      csvData[0].indexOf("Updated Col. Name")
    );

    csvData.forEach((row, i) => {
      if (i === 0) return; // Skip headers row
      row[userDetailsIndex] = row[userDetailsIndex] || "No change";
      row[previousValueIndex] = row[previousValueIndex] || "No change";
      row[updatedValueIndex] = row[updatedValueIndex] || "No change";
      row[updatedColIndex] = row[updatedColIndex] || "No change";
    });

    csvData[index + minIndex - 1] = Object.values(updatedData);
    const updatedColumns = Object.keys(updatedColumn);
    csvData[index + minIndex - 1][userDetailsIndex] = `${req.userId}`;
    csvData[index + minIndex - 1][previousValueIndex] = updatedColumns
      .map((key) => updatedColumn[key][1])
      .join(",");
    csvData[index + minIndex - 1][updatedValueIndex] = updatedColumns
      .map((key) => updatedColumn[key][0])
      .join(",");
    csvData[index + minIndex - 1][updatedColIndex] = updatedColumns.join(",");

    await UpdatedData.create({
      updatedColumn: updatedColumns.join(","),
      previousData: updatedColumns
        .map((key) => updatedColumn[key][1])
        .join(","),
      currentData: updatedColumns.map((key) => updatedColumn[key][0]).join(","),
      fileId: fileId,
      rowIndex: updatedIndex,
      userId: req.userId,
    });

    const headers = csvData[0];
    const jsonArray = csvData.slice(1).map((row) => {
      return headers.reduce((acc, header, j) => {
        acc[header] = row[j];
        return acc;
      }, {});
    });

    const updatedCSVContent = jsonToCsv(jsonArray);
    if (!updatedCSVContent) {
      throw new Error("Error converting updated JSON to CSV");
    }

    fs.writeFileSync(filePath, updatedCSVContent, { encoding: "utf8" });

    res.status(200).json({ message: "File Updated Successfully" });
  } catch (error) {
    console.error("Error Updating CSV file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateCsvData;
