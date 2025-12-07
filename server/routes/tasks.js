const express = require("express");
const router = express.Router();

let Task;
try {
  Task = require("../models/Task");
} catch (err) {
  console.error("Failed to load Task model:", err.message);
}

// @route   GET /api/tasks
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/tasks called");

    if (!Task) {
      console.log("Task model not available, returning empty array");
      return res.status(200).json([]);
    }

    const tasks = await Task.find().sort({ createdAt: -1 });
    console.log(`Found ${tasks.length} tasks`);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/tasks/my-tasks (for students - specific route)
router.get("/my-tasks/:userId", async (req, res) => {
  try {
    console.log("GET /api/tasks/my-tasks called for user:", req.params.userId);

    if (!Task) {
      console.log("Task model not available, returning empty array");
      return res.status(200).json([]);
    }

    const tasks = await Task.find({ assignedTo: req.params.userId }).sort({
      createdAt: -1,
    });
    console.log(`Found ${tasks.length} tasks for user`);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/tasks
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/tasks called with:", req.body);

    if (!Task) {
      console.log("Task model not available, returning mock response");
      return res.status(201).json({ _id: Date.now(), ...req.body });
    }

    const { title, description, eventId, assignedTo, dueDate, status } =
      req.body;

    // Get event and user details
    let eventTitle = "Unknown Event";
    let assignedToName = "Unknown User";

    try {
      const Event = require("../models/Event");
      const event = await Event.findById(eventId);
      if (event) {
        eventTitle = event.title;
      }
    } catch (err) {
      console.error("Error fetching event:", err.message);
    }

    try {
      const User = require("../models/User");
      const user = await User.findById(assignedTo);
      if (user) {
        assignedToName = `${user.First_name} ${user.Last_name}`;
      }
    } catch (err) {
      console.error("Error fetching user:", err.message);
    }

    const task = await Task.create({
      title,
      description,
      eventId,
      eventTitle,
      assignedTo,
      assignedToName,
      dueDate,
      status: status || "Pending",
    });

    console.log(
      "Task created:",
      task.title,
      "Event:",
      eventTitle,
      "Assigned to:",
      assignedToName
    );

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/tasks/:id
router.get("/:id", async (req, res) => {
  try {
    if (!Task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  try {
    if (!Task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task updated:", task.title);
    res.status(200).json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PATCH /api/tasks/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    if (!Task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!Task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task deleted:", task.title);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
