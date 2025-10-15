const mongoose = require("mongoose");

const clientFeedbackSchema = mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  feedbackDate: {
    type: Date,
    required: true,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'feedbackDate must be a valid Date'
    }
  },
  month: {
    type: String,
    required: true,
    default: () => new Date().toISOString().slice(0, 7), // YYYY-MM format
    validate: {
      validator: function(v) {
        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(v)) {
          return false;
        }
        const monthPart = parseInt(v.split('-')[1]);
        return monthPart >= 1 && monthPart <= 12;
      },
      message: 'Month must be in YYYY-MM format with valid month (01-12)'
    }
  },
  feedbackType: {
    type: String,
    enum: ["Good", "Bad", "Average"],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comments: {
    type: String,
    default: ""
  },
  // Additional feedback details
  categories: [{
    category: {
      type: String,
      enum: ["Service Quality", "Communication", "Timeline", "Budget", "Overall Satisfaction"],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comments: String
  }],
  // Status tracking
  status: {
    type: String,
    enum: ["Active", "Resolved", "Archived"],
    default: "Active"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employees"
  }
}, { timestamps: true });

// Pre-save middleware to derive month from feedbackDate
clientFeedbackSchema.pre('save', function(next) {
  if (this.feedbackDate) {
    const date = new Date(this.feedbackDate);
    this.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  next();
});

// Add indexes for efficient querying
clientFeedbackSchema.index({ clientId: 1, month: -1 });
clientFeedbackSchema.index({ clientId: 1, feedbackDate: -1 });
clientFeedbackSchema.index({ feedbackType: 1 });
clientFeedbackSchema.index({ status: 1 });

const ClientFeedback = mongoose.model("clientFeedback", clientFeedbackSchema);
module.exports = ClientFeedback;
