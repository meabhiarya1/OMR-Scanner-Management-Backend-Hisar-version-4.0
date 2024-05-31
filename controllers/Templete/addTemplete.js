const Templete = require("../../models/TempleteModel/templete");
const MetaData = require("../../models/TempleteModel/metadata");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ImageDataPath = require("../../models/TempleteModel/templeteImages");

const baseFolder = path.join(__dirname, "../../TempleteImages");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder, { recursive: true });
    }
    cb(null, baseFolder);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

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

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).array("images", 10);

const uploadPromise = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer errors (e.g., unexpected field)
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({ message: "Invalid request: " + err.message });
      } else if (err) {
        // Other errors
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      resolve();
    });
  });
};

const addTemplete = async (req, res, next) => {
  const userRole = req.role;
  if (userRole != "Admin") {
    return res
      .status(500)
      .json({ message: "You don't have access for performing this action" });
  }
  try {
    await uploadPromise(req, res);

    if (!req.body.data) {
      throw new Error("No data provided");
    }

    const { templateData, metaData } = JSON.parse(req.body.data);

    if (!templateData || !templateData.name || !templateData.pageCount) {
      return res
        .status(400)
        .json({ message: "Template name and page count are required" });
    }

    if (!Array.isArray(metaData) || metaData.length === 0) {
      return res
        .status(400)
        .json({ message: "Meta data is required and should be an array" });
    }

    const templeteResult = await Templete.create({
      name: templateData.name,
      TempleteType: "Data Entry",
      pageCount: templateData.pageCount,
    });

    if (!templeteResult) {
      throw new Error("Failed to create template");
    }

    await Promise.all(
      metaData.map(async (current, index) => {
        await MetaData.create({
          attribute: current.attribute,
          coordinateX: current.coordinateX,
          coordinateY: current.coordinateY,
          width: current.width,
          height: current.height,
          fieldType: current.fieldType,
          pageNo: current.pageNo,
          templeteId: templeteResult.id,
        }).catch((error) => {
          console.error(`Error creating metadata at index ${index}:`, error);
          throw error; // Propagate the error to the outer catch block
        });
      })
    );

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images were uploaded" });
    }

    const imagePaths = req.files.map((file, index) => ({
      imagePath: file.filename,
      templeteId: templeteResult.id,
    }));

    await ImageDataPath.bulkCreate(imagePaths).catch((error) => {
      console.error("Error creating image paths:", error);
      throw error; // Propagate the error to the outer catch block
    });

    res.status(200).json({ message: "Created Successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = addTemplete;
