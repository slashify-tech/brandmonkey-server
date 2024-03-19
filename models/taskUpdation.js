const mongoose = require("mongoose");

const hitsSchema = mongoose.Schema({
  clientName: { type: String },
  noOfHits: { type: String },
});
const ActivitySchema = mongoose.Schema(
  {
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
      default: getDateFormatted, // Using default function to set default value
    },
  },
  { timestamps: true }
);
// Function to format the current date
function getDateFormatted() {
  const currentDate = new Date();
  const dayOfMonth = currentDate.getDate();
  const year = currentDate.getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[currentDate.getMonth()];
  return `${dayOfMonth} ${month} ${year}`;
}

const TaskSchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employee" },
  activity: [ActivitySchema],
  extraActivity: [ActivitySchema],
  hit: [hitsSchema],
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
