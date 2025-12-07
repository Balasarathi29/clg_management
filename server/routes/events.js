const express = require("express");
const router = express.Router();

let Event;
try {
  Event = require("../models/Event");
} catch (err) {
  console.error("Failed to load Event model:", err.message);
}

// @route   GET /api/events
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/events called");

    if (!Event) {
      console.log("Event model not available, returning empty array");
      return res.status(200).json([]);
    }

    const events = await Event.find().sort({ createdAt: -1 });
    console.log(`Found ${events.length} events`);
    res.status(200).json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/events
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/events called with:", req.body);

    if (!Event) {
      console.log("Event model not available, returning mock response");
      return res.status(201).json({ _id: Date.now(), ...req.body });
    }

    const event = await Event.create(req.body);
    console.log("Event created:", event.title);

    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/events/:id
router.get("/:id", async (req, res) => {
  try {
    if (!Event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/events/:id
router.put("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Event updated:", event);
    res.status(200).json(event);
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/events/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!Event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Event deleted:", event.title);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
