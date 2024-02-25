const mongoose = require("mongoose");

const clientElementSchema = mongoose.Schema({
    clientName: {
      type:String,
      required : true
    },
    progressValue: {
      type: String,
      default: "0-10"
    },
    clientType : {
      type:String,
      default : "Regular"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    toEnd : {
      type:String,
      default : false
    }
  },{ strict: false });

const employeeSchema = mongoose.Schema({
  team: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
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
    required: true,
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
});

const Employees = mongoose.model("employees", employeeSchema);
module.exports = Employees;
