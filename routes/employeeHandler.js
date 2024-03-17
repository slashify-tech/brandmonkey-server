const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');
const superAdminController = require('../controllers/superAdmin');
const employeeWorkController = require('../controllers/employeeWorkUpdation');
const taskController = require('../controllers/taskController');

const { fileMulter } = require('../multer/multerFile');
const { isSuperAdmin, isAdmin } = require("../middleware/is_auth");

router.post('/csvEmployees',fileMulter, adminController.uploadEmployeeBulk);
router.post('/addEmployee',isSuperAdmin, superAdminController.addEmployee); //completed
router.post('/createTask', taskController.createTask);

router.put('/updateProgress/:id', employeeWorkController.updateProgress);
router.put('/updateWork/:id', employeeWorkController.updateWork);

router.get('/getTaskForEmployee', taskController.getActivityByEmployeeIdAndDate);
router.get('/getEmployees',isAdmin, employeeController.getEmployee); //completed
router.get('/getOneEmployee/:id', employeeController.getOneEmployee);
router.get('/getclientemployeedistribution/:id' , employeeController.getClientEmployeeRel);
router.get('/getclientWork/:id' , employeeController.getClientWork);

module.exports = router;