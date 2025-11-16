// Replace with your user model import
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");
const Employees = require("../models/employee");
const { getSignedUrlFromS3 } = require("../utils/s3Utils");
const { DEFAULT_EMPLOYEE_IMAGE } = require("../utils/constants");

dotenv.config();

function simpleEncrypt(data, key) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const encrypted = [];

  for (let i = 0; i < data.length; i++) {
    const char = data[i].toLowerCase();
    const isUpperCase = data[i] === data[i].toUpperCase();

    if (alphabet.includes(char)) {
      const newIndex = (alphabet.indexOf(char) + key) % 26;
      const encryptedChar = isUpperCase
        ? alphabet[newIndex].toUpperCase()
        : alphabet[newIndex];

      encrypted.push(encryptedChar);
    } else {
      encrypted.push(data[i]);
    }
  }

  return encrypted.join("");
}

function simpleDecrypt(encryptedData, key) {
  return simpleEncrypt(encryptedData, 26 - key);
}

exports.login = async (req, res) => {
  if (req.body.googleAccessToken) {
    // gogole-auth
    const { googleAccessToken } = req.body;

    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      })
      .then(async (response) => {
        const name = response.data.given_name + " " + response.data.family_name;
        const email = response.data.email;
        const picture = response.data.picture;
        console.log(name, email);

        const employee = await Employees.findOne({email: { $regex: new RegExp(email, "i") } , isDeleted: false });
        console.log(employee);

        if (!employee)
          return res.status(404).json({ message: "Employee don't exist!" });

        const token = jwt.sign(
          {
            email: employee.email,
            id: employee._id,
          },
          process.env.SECRET_KEY,
          { expiresIn: "48h" }
        );

        res.status(200).json({ employee, token });
      })
      .catch((err) => {
        res.status(400).json({ message: "Invalid access token!" });
      });
  } else {
    const { email, password } = req.body;

    try {
      // Fetch user from the database based on the provided email
      const employee = await Employees.findOne({email: { $regex: new RegExp(email, "i") }, isDeleted: false });

      // Check if the employee exists
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Decrypt the stored encrypted password from the database
      const decryptedPassword = simpleDecrypt(employee.password, 5);

      // Compare the decrypted password with the provided password
      if (password === decryptedPassword) {
        const token = jwt.sign(
          {
            email: employee.email,
            id: employee._id,
          },
          process.env.SECRET_KEY,
          { expiresIn: "48h" }
        );

        res.status(200).json({ employee, token });
      } else {
        // Passwords do not match, login failed
        return res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      console.error(error);
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const employee = await Employees.findById(req.query.userId);
    if (!employee) {
      const error = new Error("Employee not found.");
      error.statusCode = 404;
      console.log(error);
    }
    employee.imageUrl = await getSignedUrlFromS3(DEFAULT_EMPLOYEE_IMAGE);
    res.status(200).json({ employee });
  } catch (err) {
    console.log(err);
  }
};
