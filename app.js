const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const apiRoute = require("./routes/clientRelRoute");
const userRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employeeHandler");

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

// Routes
app.use(userRoutes);
app.use(apiRoute);
app.use(employeeRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json("API Connected");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});