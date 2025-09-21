const express = require("express");
const router = express.Router();

const financeController = require('../controllers/finance.controller');
const clientFeedbackController = require('../controllers/clientFeedback.controller');

// Finance routes
router.post('/create-finance', financeController.createOrUpdateFinance);
router.get('/get-finance/:clientId', financeController.getFinanceByClient);
// router.get('/get-all-finance', financeController.getAllFinance);
// router.get('/get-profit-analytics', financeController.getProfitAnalytics);
// router.delete('/delete-finance/:id', financeController.deleteFinance);

// Client Feedback routes
// router.post('/create-feedback', clientFeedbackController.createFeedback);
// router.get('/get-feedback/:clientId', clientFeedbackController.getFeedbackByClient);
// router.get('/get-all-feedback', clientFeedbackController.getAllFeedback);
// router.put('/update-feedback/:id', clientFeedbackController.updateFeedback);
// router.delete('/delete-feedback/:id', clientFeedbackController.deleteFeedback);
// router.get('/get-client-health-analytics', clientFeedbackController.getClientHealthAnalytics);

module.exports = router;
