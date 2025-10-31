const multer = require("multer");

const fileStorage1 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "csv/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  

//for storing file - accepts "file", "csv", or "csvFile" as field names
const fileMulter = multer({ 
  storage: fileStorage1,
  fileFilter: (req, file, cb) => {
    // Accept any file
    cb(null, true);
  }
}).any();

module.exports = { fileMulter };