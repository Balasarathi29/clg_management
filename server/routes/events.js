const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }).populate({
      path: "createdBy",
      select: "First_name Last_name Email",
    });
    // Add createdByName and departmentName for frontend
    const eventsWithNames = events.map((event) => {
      const obj = event.toObject();
      if (event.createdBy) {
        if (event.createdBy.First_name && event.createdBy.Last_name) {
          obj.createdByName = `${event.createdBy.First_name} ${event.createdBy.Last_name}`;
        } else if (event.createdBy.Email) {
          obj.createdByName = event.createdBy.Email;
        } else {
          obj.createdByName = "Unknown";
        }
      } else {
        obj.createdByName = "Unknown";
      }
      obj.departmentName =
        event.Department ||
        event.departmentId ||
        obj.Department ||
        obj.departmentId ||
        "";
      return obj;
    });
    res.status(200).json(eventsWithNames);
  } catch (error) {
    console.error("Get events error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch events", error: error.message });
  }
});

// GET single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: "createdBy",
      select: "First_name Last_name Email",
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Add createdByName and departmentName for frontend
    const eventObj = event.toObject();
    if (event.createdBy) {
      if (event.createdBy.First_name && event.createdBy.Last_name) {
        eventObj.createdByName = `${event.createdBy.First_name} ${event.createdBy.Last_name}`;
      } else if (event.createdBy.Email) {
        eventObj.createdByName = event.createdBy.Email;
      } else {
        eventObj.createdByName = "Unknown";
      }
    } else {
      eventObj.createdByName = "Unknown";
    }
    eventObj.departmentName =
      event.Department ||
      event.departmentId ||
      eventObj.Department ||
      eventObj.departmentId ||
      "";
    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Get event error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch event", error: error.message });
  }
});

// CREATE new event
router.post("/", async (req, res) => {
  try {
    // Attach createdBy from user token if available
    let createdBy = req.body.createdBy;
    if (!createdBy && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        createdBy = decoded.id;
      } catch (err) {
        // ignore
      }
    }
    const event = await Event.create({ ...req.body, createdBy });
    console.log("✅ Event created:", event.title);
    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res
      .status(500)
      .json({ message: "Failed to create event", error: error.message });
  }
});

// UPDATE event
router.put("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("✅ Event updated:", event.title);
    res.status(200).json(event);
  } catch (error) {
    console.error("Update event error:", error);
    res
      .status(500)
      .json({ message: "Failed to update event", error: error.message });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("✅ Event deleted:", event.title);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete event", error: error.message });
  }
});

module.exports = router;
