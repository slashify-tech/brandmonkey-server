const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const moment = require("moment");

const {
  deleteTasksForMonth,
  sendEmailToAdmin,
  sendEmailToAdmin15Days,
} = require("./controllers/taskController");

const apiRoute = require("./routes/clientRelRoute");
const userRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employeeHandler");
const noteRoutes = require("./routes/noteRoute");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan("common"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const port = process.env.PORT || 8800;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

cron.schedule(
  "59 23 15 1-12 *",
  async () => {
    // Here, you can perform any task you want to run one day before the deletion cron job
    console.log("Sending reminder email...");
    sendEmailToAdmin15Days(); // Send email reminder
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Specify your timezone here, e.g., 'America/New_York'
  }
);

cron.schedule(
  "59 23 26-29 1-12 *",
  async () => {
    // Here, you can perform any task you want to run one day before the deletion cron job
    console.log("Sending reminder email...");
    sendEmailToAdmin(); // Send email reminder
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Specify your timezone here, e.g., 'America/New_York'
  }
);

// cron.schedule("59 23 L * *", () => {
//   const currentTime = moment().format("MMMM Do YYYY, h:mm:ss a");
//   console.log(`This delete job ran at ${currentTime}`);

//   // Call the deleteTasksForMonth function
//   deleteTasksForMonth();
// });

cron.schedule("59 23 30 */6 *", () => {
  const currentTime = moment().format("MMMM Do YYYY, h:mm:ss a");
  console.log(`This delete job ran at ${currentTime}`);

  // Call the deleteTasksForEveryThreeMonth function
  deleteTasksForMonth();
});

// Routes
app.use(userRoutes);
app.use(apiRoute);
app.use(employeeRoutes);
app.use(noteRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json("API Connected");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});
