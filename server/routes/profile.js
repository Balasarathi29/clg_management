const express = require("express");
const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"];

    if (!userId) {
      return res.status(401).json({ message: "User ID required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select("-Password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile fetched for:", user.Email);
    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"];

    console.log("Profile update request for userId:", userId);
    console.log("Update data:", req.body);

    if (!userId) {
      return res.status(401).json({ message: "User ID required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const { First_name, Last_name, Department, DOB } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { First_name, Last_name, Department, DOB },
      { new: true, runValidators: true }
    ).select("-Password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile updated successfully for:", user.Email);
    res.status(200).json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

module.exports = router;
