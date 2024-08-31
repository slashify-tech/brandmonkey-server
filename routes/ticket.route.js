const express = require("express");
const router = express.Router();
//related to tickets
const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');

router.get('/getEmployeeTickets/:id', employeeController.getEmployeeTicket);
router.get('/getResolvedEmployeeTickets', adminController.getResolvedEmployeeTickets);
router.get('/getOneTicket/:id', employeeController.getOneTicket);
router.get('/getTicket', employeeController.getTicket);

router.post('/submitTicket', adminController.assignTicket);
router.post('/acknowledgeTicket', adminController.acknowlegdeTicketResolve);

router.delete('/acknowlegdeTicketResolve/:id', employeeController.dissolveTicket);

module.exports = router;