const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');
const { fileMulter } = require('../multer/multerFile');
const { isSuperAdmin, isAdmin } = require("../middleware/is_auth");

router.post('/csvEmployees',fileMulter, adminController.uploadEmployeeBulk);
router.post('/addEmployee',isSuperAdmin, employeeController.addEmployee); //completed

router.put('/updateProgress/:id', employeeController.updateProgress);
router.put('/updateWork/:id', employeeController.updateWork);

router.get('/getEmployees',isAdmin, employeeController.getEmployee); //completed
router.get('/getOneEmployee/:id', employeeController.getOneEmployee);
router.get('/getclientemployeedistribution/:id' , employeeController.getClientEmployeeRel);

module.exports = router;