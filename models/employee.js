const mongoose = require("mongoose");

const clientElementSchema = mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    progressValue: {
      type: String,
      default: "0-10",
    },
    logo: {
      type: String,
      default: "",
    },
    clientLogo: {
      type: String,
      default: "",
    },
    clientType: {
      type: String,
      default: "Regular",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    toEnd: {
      type: String,
      default: false,
    },
  },
  { strict: false }
);

const employeeSchema = mongoose.Schema({
  team: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  image : {
    type: String,
    default: "",
  },
  employeeId: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    // required: true,
  },
  DateOfBirth: {
    type: String,
    // required: true,
  },
  DateOfJoining: {
    type: String,
    // required: true,
  },
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  services: {
    type: String,
    required: true,
  },
  clients: [clientElementSchema],
  progressPercentage: {
    type: String,
    default: 0,
  },
  totalTicketsIssued: {
    type: Number,
    default: 0,
  },
  totalTicketsResolved: {
    type: Number,
    default: 0,
  },
  // Allocation tracking fields
  allocationMetrics: {
    hourlyRate: { type: Number, default: 0 },
    currentHoursWorked: { type: Number, default: 0 },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    totalCostCurrentPeriod: { type: Number, default: 0 },
    contributionPercentage: { type: Number, default: 0 }
  },
  // Performance tracking
  performanceMetrics: {
    averageTaskCompletionTime: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    lastPerformanceReview: { type: Date },
    overallRating: { type: Number, min: 1, max: 5, default: 0 }
  }
});

const Employees = mongoose.model("employees", employeeSchema);
module.exports = Employees;
