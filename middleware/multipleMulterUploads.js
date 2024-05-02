const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destinationFolder = "multipleCsvCompare/";
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder);
        }
        cb(null, destinationFolder); // Destination folder
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname); // Use original filename
    },
});

// Set up multer storage
const upload = multer({ storage: storage }).fields([
    { name: "firstInputCsvFile", maxCount: 1 },
    { name: "secondInputCsvFile", maxCount: 1 },
]);
const uploadCsv = (req, res, next) => {
    const userPermissions=req.permissions

    if(!userPermissions.csvCompare){
        return res.status(500).json({message:"you dont have access for performing this action"})
    }
  
    upload(req, res, (err) => {
        if (err) {
            // Multer error occurred
            console.error("Multer error:", err);
            return res.status(400).json({ error: "Failed to upload file" });
        }

        // Access uploaded files using req.files
        const firstInputCsvFile = req.files["firstInputCsvFile"] ? req.files["firstInputCsvFile"][0] : null;
        const secondInputCsvFile = req.files["secondInputCsvFile"] ? req.files["secondInputCsvFile"][0] : null;

        // Call next middleware (csvUpload function) after upload is complete

        req.uploadedFiles = {
            firstInputCsvFile,
            secondInputCsvFile
        };
        next();
    });
};

module.exports = uploadCsv;


