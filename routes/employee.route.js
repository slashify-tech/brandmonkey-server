const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const employeeWorkController = require('../controllers/employeeWorkUpdation');
const activityController = require('../controllers/activity.controller');

//everthing related to employees
router.get('/getDashboardEmployee/:id', employeeController.getDashBoardEmployee);
router.post('/createTask', activityController.createTask);
router.post('/createExtraTask', activityController.createAdditionalTask);

router.put('/updateProgress/:id', employeeWorkController.updateProgress);
router.put('/updateWork/:id', employeeWorkController.updateWork);

router.get('/getTaskForEmployee', activityController.getActivityByEmployeeIdAndDate);
router.get('/getExtraTaskForEmployee', activityController.getExtraActivityByEmployeeIdAndDate);
router.get("/gethitemployee/:id", activityController.getHitsByEmployees);
router.get('/getOneEmployee/:id', employeeController.getOneEmployee);
router.get('/getclientemployeedistribution/:id' , employeeController.getClientEmployeeRel);
router.get('/getclientWork/:id' , employeeController.getClientWork);
router.get('/getclientName' , employeeController.getClientName);

module.exports = router;