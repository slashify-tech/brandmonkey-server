const express = require("express");
const router = express.Router();

const clientPerformanceController = require('../controllers/clientPerformance.controller');
const { isAuth, isAdmin } = require('../middleware/is_auth');

// Client Performance Routes
router.get('/client-performance/overview', isAuth, clientPerformanceController.getClientOverviewDashboard); //complete
// router.get('/client-performance', clientPerformanceController.getAllClientPerformance);
// router.get('/client-performance/:id', clientPerformanceController.getClientPerformanceById);
// router.get('/client-performance/client/:clientId', clientPerformanceController.getClientPerformanceByClientId);
// router.put('/client-performance/:clientId/metrics', clientPerformanceController.updateClientMetrics);

// Performance Metrics Routes (New APIs for the 3 metrics)
router.post('/social-media-metrics', isAdmin, clientPerformanceController.updateSocialMediaMetrics); //complete
router.post('/meta-ads-metrics', isAdmin, clientPerformanceController.updateMetaAdsMetrics); //complete
router.post('/google-ads-metrics', isAdmin, clientPerformanceController.updateGoogleAdsMetrics); //complete

// GET endpoints for metrics with date and week parameters
router.get('/social-media-metrics', isAdmin, clientPerformanceController.getSocialMediaMetrics); //complete
router.get('/meta-ads-metrics', isAdmin, clientPerformanceController.getMetaAdsMetrics); //complete
router.get('/google-ads-metrics', isAdmin, clientPerformanceController.getGoogleAdsMetrics); //complete

// 4-Week Comparison API
router.get('/four-week-comparison', isAdmin, clientPerformanceController.getFourWeekComparison); //complete

// Get Latest Meta and Google Ads Data
router.get('/latest-ads-data', isAdmin, clientPerformanceController.getLatestAdsData); //complete

module.exports = router;
