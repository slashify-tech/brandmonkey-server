const mongoose = require("mongoose");

const clientElementSchema = mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "clients", required: false },
    clientName: {
      type: String,
      required: false,
    },
    progressValue: {
      type: String,
      default: "0-10",
    },
    logo: {
      type: String,
      required: false,
    },
    clientLogo: {
      type: String,
      required: false,
    },
    clientType: {
      type: String,
      required: false,
    },
    services: {
      type: [String],
      required: false,
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
  { strict: false, _id: false }
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
  image: {
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
  yearlyCTC: {
    type: Number,
    default: 0,
    required: false,
  },
  monthlySalary: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Employees = mongoose.model("employees", employeeSchema);
module.exports = Employees;
