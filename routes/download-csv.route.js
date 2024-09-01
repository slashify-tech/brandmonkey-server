const express = require("express");
const router = express.Router();

const downloadController = require('../controllers/dowloadCsv.controller');

//related to csv downloads

router.get('/getClientCSV', downloadController.downloadCsvClients);
router.get('/getEmployeesCSV', downloadController.downloadCsvEmployees);
router.get('/getEmployeesSheet/:id', downloadController.downloadSingleEmployeeSheet);
router.get('/getAllEmployeesSheet', downloadController.downloadAllEmployeeData);
router.get('/getAllEmployeesHit', downloadController.downloadAllEmployeeHit);

module.exports = router;