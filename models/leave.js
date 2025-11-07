const mongoose = require("mongoose");

const leaveSchema = mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "employees",
    required: true
  },
  leaveDate: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Leave = mongoose.model("leave", leaveSchema);
module.exports = Leave;


