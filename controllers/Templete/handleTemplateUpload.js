const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ImageDataPath = require("../../models/TempleteModel/templeteImages");
const Template = require("../../models/TempleteModel/templete");

// Define the base folder where images will be stored
const baseFolder = path.join(__dirname, "../", "../", "TempleteImages");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationFolder = path.join(baseFolder);

    // Ensure the destination folder exists
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const timestamp = Math.floor(Date.now() / 1000);
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

// Filter to only allow specific image file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/tiff"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPEG, and TIF files are allowed."
      ),
      false
    );
  }
};

// Configure multer to accept multiple images
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).array("images", 10); // Adjust the field name and maxCount as needed

// Promisify the multer middleware
const uploadPromise = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Define the controller function to handle the file upload
const handleTemplateUpload = async (req, res, next) => {
  const templeteId = req.params.id;

  // Ensure templateId is provided
  if (!templeteId) {
    return res.status(400).json({ message: "Template ID is required" });
  }

  try {
    // Verify the template exists
    const template = await Template.findByPk(templeteId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    await uploadPromise(req, res);

    const imagePaths = req.files.map((file) => ({
      imagePath: path.relative(process.cwd(), file.path), // Ensure the path is relative
      templeteId: templeteId,
    }));

    // Save image paths to the database
    await ImageDataPath.bulkCreate(imagePaths);
    console.log("Files Uploaded successfully and paths saved to database");
    res.status(200).json({
      message: "Files Uploaded successfully ",
    });
  } catch (error) {
    console.error("Error handling upload:", error);
    res.status(500).send(error.message);
  }
};

module.exports = handleTemplateUpload;
