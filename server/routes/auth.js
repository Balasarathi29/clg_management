const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Login route
router.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    console.log("Login attempt for:", Email);
    console.log("Request body:", { Email, Password: "***" });

    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ Email: Email.toLowerCase() });

    if (!user) {
      console.log("❌ User not found:", Email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("✅ User found:", user.Email, "Role:", user.role);

    // Check if comparePassword method exists
    if (typeof user.comparePassword !== "function") {
      console.error("❌ comparePassword method not found on user model");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(Password);

    if (!isMatch) {
      console.log("❌ Password mismatch for:", Email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.Email,
        role: user.role,
      },
      process.env.JWT_SECRET || "college-management-secret-key-2024",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    console.log("✅ Login successful for:", Email, "Role:", user.role);

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        First_name: user.First_name,
        Last_name: user.Last_name,
        Email: user.Email,
        role: user.role,
        Department: user.Department,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Register route - For students only
router.post("/register", async (req, res) => {
  try {
    const { First_name, Last_name, Email, Password, Department, DOB } =
      req.body;

    if (!First_name || !Last_name || !Email || !Password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ Email: Email.toLowerCase() });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Students register themselves
    const user = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: "student",
      Department: Department || "General",
      DOB: DOB || "",
    });

    const token = jwt.sign(
      { id: user._id, email: user.Email, role: user.role },
      process.env.JWT_SECRET || "college-management-secret-key-2024",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    console.log("✅ Student registered:", user.Email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        First_name: user.First_name,
        Last_name: user.Last_name,
        Email: user.Email,
        role: user.role,
        Department: user.Department,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
