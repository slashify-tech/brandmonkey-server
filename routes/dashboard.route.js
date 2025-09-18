const express = require("express");
const router = express.Router();

const clientPerformanceController = require('../controllers/clientPerformance.controller');
const employeeAllocationController = require('../controllers/employeeAllocation.controller');
const { seedDashboardData } = require('../utils/seedDashboardData');

// Client Performance Routes
router.get('/client-performance/overview', clientPerformanceController.getClientOverviewDashboard); //complete
router.get('/client-performance', clientPerformanceController.getAllClientPerformance);
router.get('/client-performance/:id', clientPerformanceController.getClientPerformanceById);
router.get('/client-performance/client/:clientId', clientPerformanceController.getClientPerformanceByClientId);
router.put('/client-performance/:clientId/metrics', clientPerformanceController.updateClientMetrics);
router.delete('/client-performance/:id', clientPerformanceController.deleteClientPerformance);

// Performance Metrics Routes (New APIs for the 3 metrics)
router.post('/social-media-metrics', clientPerformanceController.updateSocialMediaMetrics); //complete
router.post('/meta-ads-metrics', clientPerformanceController.updateMetaAdsMetrics); //complete
router.post('/google-ads-metrics', clientPerformanceController.updateGoogleAdsMetrics); //complete

// 4-Week Comparison API
router.get('/four-week-comparison', clientPerformanceController.getFourWeekComparison);

// Employee Allocation Routes
router.post('/employee-allocation', employeeAllocationController.createOrUpdateEmployeeAllocation);
router.get('/employee-allocation', employeeAllocationController.getAllEmployeeAllocations);
router.get('/employee-allocation/dashboard', employeeAllocationController.getEmployeeAllocationDashboard);
router.get('/employee-allocation/hours', employeeAllocationController.getEmployeeHoursAndAllocation);
router.get('/employee-allocation/:id', employeeAllocationController.getEmployeeAllocationById);
router.get('/employee-allocation/employee/:employeeId', employeeAllocationController.getEmployeeAllocationByEmployeeId);
router.put('/employee-allocation/:employeeId/metrics', employeeAllocationController.updateEmployeeAllocationMetrics);
router.delete('/employee-allocation/:id', employeeAllocationController.deleteEmployeeAllocation);

// Data seeding route (for development/testing)
router.post('/seed-data', async (req, res) => {
  try {
    await seedDashboardData();
    res.status(200).json({ message: "Dashboard data seeded successfully" });
  } catch (error) {
    console.error("Error seeding dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
