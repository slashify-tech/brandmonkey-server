const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');
const { fileMulter } = require('../multer/multerFile');

router.post('/csvEmployee',fileMulter, adminController.uploadEmployeeBulk);
router.post('/addEmployee', employeeController.addEmployee);

router.put('/updateProgress/:id', employeeController.updateProgress);
router.put('/updateWork/:id', employeeController.updateWork);

router.get('/getEmployees', employeeController.getEmployee);
router.get('/getOneEmployee/:id', employeeController.getOneEmployee);
router.get('/getclientemployeedistribution/:id' , employeeController.getClientEmployeeRel);

module.exports = router;