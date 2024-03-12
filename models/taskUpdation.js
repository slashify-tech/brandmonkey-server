const mongoose = require("mongoose");

const hitsSchema = mongoose.Schema({
  clientName: { type: String },
  noOfHits: { type: String },
});
const ActivitySchema = mongoose.Schema(
  {
    cilentname: {
      type: String,
    },

    activityDescription: {
      type: String,
    },
    timeSlot: {
      type: String,
    },
    hours: { type: String },
  },
  { timeStamps: true }
);

const TaskSchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employee" },
  activity: [ActivitySchema],
  hit: [hitsSchema],
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;