const mongoose = require("mongoose");

const HitsSchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
  clientName: { type: String },
  noOfHits: { type: Number },
});

const TaskSchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
  clientName: {
    type: String,
  },
  activity: {
    type: String,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required : true,
    default: "", // Using default function to set default value
  },
  type : {
    type: String,
    enum: ["activity", "extraActivity"],  // Allowed values are "activity" and "extraActivity"
    required : true,
    default: "activity", // Using default function to set default value
  },
  countId : {
    type: String,
    default: "",
  },
}, {timestamps: true});

const Task = mongoose.model("activity", TaskSchema);
const Hits = mongoose.model("hits", HitsSchema);

module.exports = {Task, Hits};
