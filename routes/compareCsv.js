const express = require("express");
const uploadCsv = require("../controllers/CompareCsv/uploadCsv")
const multerUpload = require("../middleware/multerUpload");
const compareCsv = require("../controllers/CompareCsv/compareCsv");
const multipleMulterUpload = require("../middleware/multipleMulterUploads");
const router = express.Router();

router.post("/uploadcsv", multerUpload, uploadCsv);
router.post("/compareData", multipleMulterUpload, compareCsv)


module.exports = router;
