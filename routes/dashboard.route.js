const express = require("express");
const router = express.Router();

const clientPerformanceController = require('../controllers/clientPerformance.controller');

// Client Performance Routes
router.get('/client-performance/overview', clientPerformanceController.getClientOverviewDashboard); //complete
// router.get('/client-performance', clientPerformanceController.getAllClientPerformance);
// router.get('/client-performance/:id', clientPerformanceController.getClientPerformanceById);
// router.get('/client-performance/client/:clientId', clientPerformanceController.getClientPerformanceByClientId);
// router.put('/client-performance/:clientId/metrics', clientPerformanceController.updateClientMetrics);

// Performance Metrics Routes (New APIs for the 3 metrics)
router.post('/social-media-metrics', clientPerformanceController.updateSocialMediaMetrics); //complete
router.post('/meta-ads-metrics', clientPerformanceController.updateMetaAdsMetrics); //complete
router.post('/google-ads-metrics', clientPerformanceController.updateGoogleAdsMetrics); //complete

// 4-Week Comparison API
router.get('/four-week-comparison', clientPerformanceController.getFourWeekComparison); //complete

module.exports = router;
