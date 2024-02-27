const jwt = require("jsonwebtoken");
const Employees = require("../models/employee");
const dotenv = require("dotenv");

dotenv.config();

// Middleware function to authenticate the user using JWT
const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader.split(" ")[1]; // Get the token from the request header

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token." });
      }

      // Check if the user associated with the token exists
      const user = await Employees.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Employees not found." });
      }

      // Attach the authenticated user to the request object
      req.user = user;

      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


// Middleware function to check if the user is an admin using JWT
const isAdmin = async (req, res, next) => {
  // console.log(req.get("Authorization"));
    try {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
      }
      const token = authHeader.split(" ")[1]; // Get the token from the request header
  
      if (!token) {
        return res
          .status(401)
          .json({ message: "Access denied. No token provided." });
      }
      // Verify the token
      jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token." });
        }
  
        // Check if the user associated with the token exists
        const user = await Employees.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: "Employees not found." });
        }
        // Check if the user is an admin
        if (user.type === "admin") {
          next(); // If the user is an admin, proceed to the next middleware/controller
        } else {
          res.status(403).json({ message: "Not admin." });
        }
      });
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };


const isSuperAdmin = async (req, res, next) => {
  console.log(req.get("Authorization"));
    try {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
      }
      const token = authHeader.split(" ")[1]; // Get the token from the request header
  console.log(token);
      if (!token) {
        return res
          .status(401)
          .json({ message: "Access denied. No token provided." });
      }
      // Verify the token
      jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token." });
        }
  
        // Check if the user associated with the token exists
        const user = await Employees.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: "Employees not found." });
        }
        // Check if the user is an admin
        if (user.type === "superadmin") {
          next(); // If the user is an admin, proceed to the next middleware/controller
        } else {
          res.status(403).json({ message: "Not superadmin." });
        }
      });
    } catch (error) {
      console.error("SuperAdmin check error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };


module.exports = {isAuth, isAdmin, isSuperAdmin};