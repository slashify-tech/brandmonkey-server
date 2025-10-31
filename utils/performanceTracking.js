const PerformanceTracking = require('../models/performanceTracking');

const updatePerformanceTracking = async (clientPerformanceId, userId, metricType) => {
  try {
    // Find existing tracking record or create new one
    let trackingRecord = await PerformanceTracking.findOne({ 
      clientPerformanceId 
    });

    if (!trackingRecord) {
      // Create new tracking record
      trackingRecord = new PerformanceTracking({
        clientPerformanceId,
        socialMetrics: [],
        metaMetrics: [],
        googleMetrics: []
      });
    }

    // Add new user to the specified metric type
    const newEntry = {
      userId,
      updatedAt: new Date()
    };

    // Add new entry as the first element (latest first)
    trackingRecord[metricType].unshift(newEntry);

    // Keep only the first 5 entries (remove last element if more than 5)
    if (trackingRecord[metricType].length > 5) {
      trackingRecord[metricType] = trackingRecord[metricType].slice(0, 5);
    }

    // Save the updated record
    await trackingRecord.save();

    console.log(`Performance tracking updated for ${metricType} by user ${userId}`);
  } catch (error) {
    console.error('Error updating performance tracking:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

const getPerformanceTracking = async (clientPerformanceId) => {
  try {
    const trackingRecord = await PerformanceTracking.findOne({ 
      clientPerformanceId 
    }).populate('socialMetrics.userId', 'name email')
      .populate('metaMetrics.userId', 'name email')
      .populate('googleMetrics.userId', 'name email');

    return trackingRecord;
  } catch (error) {
    console.error('Error getting performance tracking:', error);
    return null;
  }
};

module.exports = {
  updatePerformanceTracking,
  getPerformanceTracking
};
