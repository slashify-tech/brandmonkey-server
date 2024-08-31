const fs = require("fs");
const path = require("path");
const { json2csv } = require("json-2-csv");
const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

exports.generateAndDownloadCSV = async (data, filename, fields, res) => {
    try {
      const csvData = json2csv(data, { fields });
      const folderPath = path.join(__dirname, "..", "csv_exports");
  
      if (!fs.existsSync(folderPath)) {
        await mkdirAsync(folderPath);
      }
  
      const filePath = path.join(folderPath, filename);
  
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
  
      await writeFileAsync(filePath, csvData);
  
      res.download(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  