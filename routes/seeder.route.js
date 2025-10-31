const express = require('express');
const router = express.Router();
const seederController = require('../controllers/seeder.controller');
const isAuth = require('../middleware/is_auth');


// Seed activities and hits for an employee
router.post('/seed-employee', seederController.seedEmployeeData);

module.exports = router;
