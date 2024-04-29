const express = require("express");
const addTemplete = require("../controllers/Templete/addTemplete");
const getTemplete = require("../controllers/Templete/getTemplete");
const getTempleteData = require("../controllers/Templete/getTempleteData");
const handleUpload = require("../controllers/Templete/upload");
const getHeaderData = require("../controllers/Templete/getHeaderData");
const handleData = require("../controllers/Templete/handleData");
const getCsvData = require("../controllers/Templete/getCsvData");
const getImage = require("../controllers/Templete/getImage");
const updateCsvData = require("../controllers/Templete/updateCsvData");
const assignUser = require("../controllers/Templete/assignUser");
const getAllTask = require("../controllers/Templete/getAllTask");
const getTask = require("../controllers/Templete/getTask");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get/templetes", getTemplete);
router.get("/get/templetedata/:id", getTempleteData); //templeteId
router.get("/get/headerdata/:id", getHeaderData); //fileId
router.get("/get/alltasks", getAllTask); //admin
router.get("/get/task/:id", getTask); //user

router.post("/get/csvdata",authMiddleware, getCsvData);
router.post("/get/image",authMiddleware, getImage);
router.post("/add/templete",authMiddleware, addTemplete);
router.post("/upload/:id", handleUpload); //templeteId
router.post("/data", handleData);
router.post("/updatecsvdata/:id", updateCsvData); // fileId
router.post("/assign/user", assignUser);

module.exports = router;
