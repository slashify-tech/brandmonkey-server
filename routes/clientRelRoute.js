const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');
const { fileMulter } = require('../multer/multerFile');

router.post('/csvClients',fileMulter, adminController.uploadClientBulk);
// router.post('/csvClientsAndEmployee',fileMulter, adminController.uploadClientandEmployeeBulk);
router.post('/addClient', employeeController.addClient);
router.post('/submitTicket', adminController.assignTicket);
router.post('/acknowledgeTicket', adminController.acknowlegdeTicketResolve);
router.post('/addmom/:id', adminController.createMomEntry);

router.put('/addservicefield', adminController.addFieldsToClients);
router.put('/editservicefield', adminController.editFieldsInClients);
router.put('/deleteservicefield', adminController.deleteFieldsFromClients);
router.put("/editClient/:id", employeeController.editClient);
router.put("/editEmployee/:id", employeeController.editEmployee);
router.put("/clientAllocation/:id", adminController.storeClientDistributionData);
router.put('/clienttype/:id', adminController.updateClientType);
router.put('/addReview', adminController.addEmployeeReview);


router.get('/getClientCSV', adminController.downloadCsvClients);
router.get('/getEmployeesCSV', adminController.downloadCsvEmployees);
router.get('/getClients', employeeController.getClient);
router.get('/getmom/:id', adminController.getMomEntriesByClientId);
router.get('/getOneClient/:id', employeeController.getOneClient);
router.get('/getTicket', employeeController.getTicket);
router.get('/employeelistOneTimeforadmin', adminController.getOneTimeEmployees);
router.get('/employeelistRegularforadmin', adminController.getRegularEmployees);
router.get('/employeeReviews', adminController.getEmployeeReviews);
router.get('/employeeReviewsShow/:id', adminController.getEmployeeReviewsArray);
router.get('/getOneClientTickets/:id', adminController.getTicketsForClient);
router.get('/getEmployeeTickets/:id', employeeController.getEmployeeTicket);
router.get('/getResolvedEmployeeTickets', adminController.getResolvedEmployeeTickets);
router.get('/getOneTicket/:id', employeeController.getOneTicket);
router.get('/getDashboardAdmin', adminController.getDashBoardAdmin);
router.get('/getDashboardEmployee/:id', employeeController.getDashBoardEmployee);

router.delete('/acknowlegdeTicketResolve/:id', employeeController.dissolveTicket);
router.delete('/deleteEmployee/:id', adminController.deleteEmployeeData);
router.delete('/deleteClient/:id', adminController.deleteClientData);
router.delete('/deleteReviews/:id', adminController.deleteReviewData);

module.exports = router;