const mongoose = require("mongoose");

const performanceTrackingSchema = mongoose.Schema(
  {
    clientPerformanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientPerformance",
      required: true,
      unique: true
    },
    socialMetrics: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    metaMetrics: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    googleMetrics: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Add index for efficient queries
performanceTrackingSchema.index({ clientPerformanceId: 1 });

const PerformanceTracking = mongoose.model(
  "performanceTracking",
  performanceTrackingSchema
);

module.exports = PerformanceTracking;
