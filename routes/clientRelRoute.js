const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/employee');
const adminController = require('../controllers/admin');
const superAdminController = require('../controllers/superAdmin');

const { fileMulter } = require('../multer/multerFile');
const { isSuperAdmin, isAdmin } = require("../middleware/is_auth");

router.post('/csvClients',fileMulter, adminController.uploadClientBulk);
router.post('/addClient',isSuperAdmin, superAdminController.addClient); //completed
router.post('/submitTicket', adminController.assignTicket);
router.post('/acknowledgeTicket', adminController.acknowlegdeTicketResolve);
router.post('/addmom/:id', adminController.createMomEntry);

router.put('/addservicefield',isSuperAdmin, superAdminController.addFieldsToClients); //completed
router.put('/editservicefield',isSuperAdmin, superAdminController.editFieldsInClients); //completed
router.put('/deleteservicefield',isSuperAdmin, superAdminController.deleteFieldsFromClients); //completed
router.put("/editClient/:id",isSuperAdmin, superAdminController.editClient); //completed
router.put("/editEmployee/:id",isSuperAdmin, superAdminController.editEmployee); //completed
router.put("/clientAllocation/:id",isSuperAdmin, superAdminController.storeClientDistributionData); //completed
router.put('/clienttype/:id',isSuperAdmin, superAdminController.updateClientType); //completed
router.put('/addReview', adminController.addEmployeeReview);

router.get('/getClientCSV', adminController.downloadCsvClients);
router.get('/getEmployeesCSV', adminController.downloadCsvEmployees);
router.get('/getClients', isAdmin, employeeController.getClient); //completeld authorized
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
router.delete('/deleteEmployee/:id', isSuperAdmin, superAdminController.deleteEmployeeData); //completed
router.delete('/deleteClient/:id', isSuperAdmin, superAdminController.deleteClientData); //completed
router.delete('/deleteReviews/:id', adminController.deleteReviewData);
router.delete('/deleteClientAllot/:id', isSuperAdmin,superAdminController.deleteClientAllot); //completed
router.delete('/deleteMOM/:id', adminController.deleteMOM);

module.exports = router;