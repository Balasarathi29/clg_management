const express = require("express");
const router = express.Router();

// Simple hardcoded departments
const departments = [
  { id: 1, name: "Computer Science", code: "CS" },
  { id: 2, name: "Electrical Engineering", code: "EE" },
  { id: 3, name: "Mechanical Engineering", code: "ME" },
  { id: 4, name: "Civil Engineering", code: "CE" },
  { id: 5, name: "Information Technology", code: "IT" },
  { id: 6, name: "Electronics & Communication", code: "EC" },
  { id: 7, name: "Business Administration", code: "BA" },
  { id: 8, name: "Humanities", code: "HUM" },
];

// @route   GET /api/departments
// @desc    Get all departments
// @access  Public
router.get("/", (req, res) => {
  res.json(departments);
});

module.exports = router;
