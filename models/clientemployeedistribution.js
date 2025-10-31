const mongoose = require("mongoose");

const employeeClientAssignmentSchema = mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },
    assignedEmployeeId: {
      type: String,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: false,
    },
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
    toEnd: {
      type: String,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strict: false }
);

const EmployeeClientAssignment = mongoose.model(
  "employeeClientAssignment",
  employeeClientAssignmentSchema
);

module.exports = EmployeeClientAssignment;