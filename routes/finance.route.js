const express = require("express");
const router = express.Router();

const financeController = require('../controllers/finance.controller');
const clientFeedbackController = require('../controllers/clientFeedback.controller');
const { isAuth, isAdmin } = require('../middleware/is_auth');

// Finance routes
router.post('/create-finance', isAdmin, financeController.createOrUpdateFinance);
router.get('/get-finance/:clientId', isAdmin, financeController.getFinanceByClient);
router.get('/cost-breakdown/:clientId', isAdmin, financeController.getCostBreakdown);
// router.get('/get-all-finance', financeController.getAllFinance);
// router.get('/get-profit-analytics', financeController.getProfitAnalytics);
// router.delete('/delete-finance/:id', financeController.deleteFinance);

// Client Feedback routes
router.post('/create-feedback', isAdmin, clientFeedbackController.createFeedback);
router.get('/get-feedback/:clientId', isAdmin, clientFeedbackController.getFeedbackByClient);
// router.get('/get-all-feedback', clientFeedbackController.getAllFeedback);
// router.put('/update-feedback/:id', clientFeedbackController.updateFeedback);
// router.delete('/delete-feedback/:id', clientFeedbackController.deleteFeedback);

module.exports = router;
