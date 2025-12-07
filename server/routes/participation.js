const express = require("express");
const router = express.Router();

let Participation, Event, User;
try {
  Participation = require("../models/Participation");
  Event = require("../models/Event");
  User = require("../models/User");
} catch (err) {
  console.error("Failed to load models:", err.message);
}

// @route   POST /api/participation/register
// @desc    Register student for event
router.post("/register", async (req, res) => {
  try {
    const { eventId, studentId } = req.body;

    if (!Participation || !Event || !User) {
      return res.status(500).json({ message: "Models not available" });
    }

    // Check if already registered
    const existing = await Participation.findOne({ eventId, studentId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create participation
    const participation = await Participation.create({
      eventId,
      eventTitle: event.title,
      studentId,
      studentName: `${student.First_name} ${student.Last_name}`,
      studentEmail: student.Email,
      status: "Registered",
    });

    // Update event participant count
    event.currentParticipants = (event.currentParticipants || 0) + 1;
    await event.save();

    console.log(
      "Student registered for event:",
      student.Email,
      "->",
      event.title
    );
    res.status(201).json(participation);
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Failed to register", error: error.message });
  }
});

// @route   GET /api/participation/student/:studentId
// @desc    Get all participations for a student
router.get("/student/:studentId", async (req, res) => {
  try {
    if (!Participation) {
      return res.status(200).json([]);
    }

    const participations = await Participation.find({
      studentId: req.params.studentId,
    }).sort({ registeredAt: -1 });

    res.status(200).json(participations);
  } catch (error) {
    console.error("Get participations error:", error);
    res.status(500).json({ message: "Failed to fetch participations" });
  }
});

// @route   GET /api/participation/event/:eventId
// @desc    Get all participants for an event
router.get("/event/:eventId", async (req, res) => {
  try {
    if (!Participation) {
      return res.status(200).json([]);
    }

    const participants = await Participation.find({
      eventId: req.params.eventId,
    }).sort({ registeredAt: -1 });

    res.status(200).json(participants);
  } catch (error) {
    console.error("Get participants error:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

// @route   DELETE /api/participation/:id
// @desc    Cancel participation
router.delete("/:id", async (req, res) => {
  try {
    if (!Participation || !Event) {
      return res.status(404).json({ message: "Models not available" });
    }

    const participation = await Participation.findById(req.params.id);
    if (!participation) {
      return res.status(404).json({ message: "Participation not found" });
    }

    // Update event participant count
    const event = await Event.findById(participation.eventId);
    if (event) {
      event.currentParticipants = Math.max(
        0,
        (event.currentParticipants || 0) - 1
      );
      await event.save();
    }

    await Participation.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Registration cancelled" });
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({ message: "Failed to cancel registration" });
  }
});

module.exports = router;
