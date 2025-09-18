const mongoose = require("mongoose");

const employeeAllocationSchema = mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employees",
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  contributionPercentage: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  clientAllocations: [{
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients"
    },
    clientName: {
      type: String,
      required: true
    },
    hoursAllocated: {
      type: Number,
      default: 0
    },
    costForClient: {
      type: Number,
      default: 0
    }
  }],
  monthlyData: [{
    month: {
      type: String,
      required: true
    },
    hoursWorked: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    clientBreakdown: [{
      clientName: String,
      hours: Number,
      cost: Number
    }]
  }],
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const EmployeeAllocation = mongoose.model("employeeAllocation", employeeAllocationSchema);
module.exports = EmployeeAllocation;

