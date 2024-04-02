const mongoose = require("mongoose");

const hitsSchema = mongoose.Schema({
  clientName: { type: String },
  noOfHits: { type: Number },
});
const ActivitySchema = mongoose.Schema(
  {
    clientName: {
      type: String,
      required:true
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
    countId : {
      type: String,
      required : true,
      default: "",
    }
  },
  { timestamps: true }
);
// Function to format the current date
// function getDateFormatted() {
//   const currentDate = new Date();
//   currentDate.setDate(currentDate.getDate());
//   const dayOfMonth = currentDate.getDate();
//   const year = currentDate.getFullYear();
//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const month = months[currentDate.getMonth()];
//   return `${dayOfMonth} ${month} ${year}`;
// }

const TaskSchema = mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
  activity: [ActivitySchema],
  extraActivity: [ActivitySchema],
  hits: [hitsSchema],
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
