const mongoose = require("mongoose");

const clientPerformanceSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Decline", "Growth", "New"],
      default: "Active",
    },
    month: {
      type: String,
      required: true,
      default: () => new Date().toISOString().slice(0, 7), // Returns YYYY-MM format
      validate: {
        validator: function(v) {
          // Validate YYYY-MM format
          const monthRegex = /^\d{4}-\d{2}$/;
          if (!monthRegex.test(v)) {
            return false;
          }
          
          // Validate month is between 01-12
          const monthPart = parseInt(v.split('-')[1]);
          return monthPart >= 1 && monthPart <= 12;
        },
        message: 'Month must be in YYYY-MM format with valid month (01-12)'
      }
    },
    week: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
      validate: {
        validator: function(v) {
          return v >= 1 && v <= 4;
        },
        message: 'Week must be between 1 and 4'
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // Detailed performance metrics for dashboard
    socialMediaMetrics: {
      reach: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      avgEngagement: { type: Number, default: 0 },
      graphicsPost: { type: Number, default: 0 },
      ugc: { type: Number, default: 0 },
      reels: { type: Number, default: 0 },
      maxReels: { type: Number, default: 0 },
      maxGraphicsPost: { type: Number, default: 0 },
      maxUgc: { type: Number, default: 0 },
    },
    metaAdsMetrics: {
      spentAmount: { type: Number, default: 0 },
      roas: { type: Number, default: 0 },
      leads: { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
      costPerLead: { type: Number, default: 0 },
      costPerMessage: { type: Number, default: 0 },
    },
    googleAdsMetrics: {
      spentAmount: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      calls: { type: Number, default: 0 },
      costPerClick: { type: Number, default: 0 },
      costPerConversion: { type: Number, default: 0 },
      costPerCall: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Add compound index to ensure unique clientId + month + week combination
clientPerformanceSchema.index({ clientId: 1, month: 1, week: 1 }, { unique: true });

const ClientPerformance = mongoose.model(
  "clientPerformance",
  clientPerformanceSchema
);
module.exports = ClientPerformance;
