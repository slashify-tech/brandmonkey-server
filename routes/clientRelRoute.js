const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');
const { fileMulter } = require('../multer/multerFile');
const { isSuperAdmin, isAdmin } = require("../middleware/is_auth");

router.post('/csvClients',fileMulter, adminController.uploadClientBulk);
router.post('/addClient',isSuperAdmin, employeeController.addClient); //completed
router.post('/submitTicket', adminController.assignTicket);
router.post('/acknowledgeTicket', adminController.acknowlegdeTicketResolve);
router.post('/addmom/:id', adminController.createMomEntry);

router.put('/addservicefield',isSuperAdmin, adminController.addFieldsToClients); //completed
router.put('/editservicefield',isSuperAdmin, adminController.editFieldsInClients); //completed
router.put('/deleteservicefield',isSuperAdmin, adminController.deleteFieldsFromClients); //completed
router.put("/editClient/:id",isSuperAdmin, employeeController.editClient); //completed
router.put("/editEmployee/:id",isSuperAdmin, employeeController.editEmployee); //completed
router.put("/clientAllocation/:id",isSuperAdmin, adminController.storeClientDistributionData); //completed
router.put('/clienttype/:id',isSuperAdmin, adminController.updateClientType); //completed
router.put('/addReview', adminController.addEmployeeReview);

router.get('/getClientCSV', adminController.downloadCsvClients);
router.get('/getEmployeesCSV', adminController.downloadCsvEmployees);
router.get('/getClients', isAdmin, employeeController.getClient); //completed
router.get('/getmom/:id', adminController.getMomEntriesByClientId);
router.get('/getOneClient/:id', employeeController.getOneClient);
router.get('/getTicket', employeeController.getTicket);
router.get('/employeeReviews', adminController.getEmployeeReviews);
router.get('/employeeReviewsShow/:id', adminController.getEmployeeReviewsArray);
router.get('/getOneClientTickets/:id', adminController.getTicketsForClient);
router.get('/getEmployeeTickets/:id', employeeController.getEmployeeTicket);
router.get('/getResolvedEmployeeTickets', adminController.getResolvedEmployeeTickets);
router.get('/getOneTicket/:id', employeeController.getOneTicket);
router.get('/getDashboardAdmin', adminController.getDashBoardAdmin);
router.get('/getDashboardEmployee/:id', employeeController.getDashBoardEmployee);

router.delete('/acknowlegdeTicketResolve/:id', employeeController.dissolveTicket);
router.delete('/deleteEmployee/:id', isSuperAdmin, adminController.deleteEmployeeData); //completed
router.delete('/deleteClient/:id', isSuperAdmin, adminController.deleteClientData); //completed
router.delete('/deleteReviews/:id', adminController.deleteReviewData);
router.delete('/deleteClientAllot/:id', isSuperAdmin,adminController.deleteClientAllot); //completed
router.delete('/deleteMOM/:id', adminController.deleteMOM);

module.exports = router;