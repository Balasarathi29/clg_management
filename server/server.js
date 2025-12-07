const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Fallback to hardcoded values if .env not loaded
process.env.PORT = process.env.PORT || "5000";
process.env.MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clg_management";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "college-management-secret-key-2024";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

console.log("=== Environment Check ===");
console.log("Current directory:", __dirname);
console.log(".env path:", path.join(__dirname, ".env"));
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Defined ✓" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Defined ✓" : "MISSING");
console.log("========================");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Don't log sensitive data
  if (
    req.body &&
    typeof req.body === "object" &&
    Object.keys(req.body).length > 0
  ) {
    const sanitizedBody = { ...req.body };

    // Remove sensitive fields from logs
    if (sanitizedBody.Password) sanitizedBody.Password = "***HIDDEN***";
    if (sanitizedBody.password) sanitizedBody.password = "***HIDDEN***";
    if (sanitizedBody.EMAIL_PASSWORD)
      sanitizedBody.EMAIL_PASSWORD = "***HIDDEN***";

    console.log("Body:", JSON.stringify(sanitizedBody, null, 2));
  }
  next();
});

// Routes - Register with error handling
console.log("\n🔗 Registering routes...");

app.use("/", require("./routes/auth"));
console.log("✅ Auth routes registered");

// Admin user creation route
app.post("/api/users/create", async (req, res) => {
  try {
    const User = require("./models/User");
    const { First_name, Last_name, Email, Password, Department } = req.body;

    console.log("Admin creating HOD account:", Email);

    if (!First_name || !Last_name || !Email || !Password || !Department) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ Email: Email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        message: "HOD account already exists with this email",
      });
    }

    // Create HOD account
    const hod = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: "hod",
      Department,
    });

    console.log("HOD created by Admin:", hod.Email, "Department:", Department);

    res.status(201).json({
      message: "HOD account created successfully",
      user: {
        id: hod._id,
        First_name: hod.First_name,
        Last_name: hod.Last_name,
        Email: hod.Email,
        role: hod.role,
        Department: hod.Department,
      },
    });
  } catch (error) {
    console.error("Create HOD error:", error);
    res.status(500).json({
      message: error.message || "Server error creating HOD account",
    });
  }
});

// Delete user route
app.delete("/api/users/:id", async (req, res) => {
  try {
    const User = require("./models/User");
    const userId = req.params.id;

    console.log("Admin deleting user:", userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of system accounts
    if (user.role === "hod" || user.role === "admin") {
      return res.status(403).json({
        message: "Cannot delete system accounts (HOD/Admin)",
      });
    }

    await User.findByIdAndDelete(userId);

    console.log("User deleted:", user.Email, "Role:", user.role);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: error.message || "Server error deleting user",
    });
  }
});

// Events route with error handling
try {
  const eventsRouter = require("./routes/events");
  app.use("/api/events", eventsRouter);
  console.log("✅ Events routes registered at /api/events");
} catch (err) {
  console.error("❌ Failed to register events routes:", err.message);
}

// Tasks route with error handling
try {
  const tasksRouter = require("./routes/tasks");
  app.use("/api/tasks", tasksRouter);
  console.log("✅ Tasks routes registered at /api/tasks");
} catch (err) {
  console.error("❌ Failed to register tasks routes:", err.message);
}

// Profile route with error handling
try {
  const profileRouter = require("./routes/profile");
  app.use("/api/profile", profileRouter);
  console.log("✅ Profile routes registered at /api/profile");
} catch (err) {
  console.error("❌ Failed to register profile routes:", err.message);
}

// Participation route with error handling
try {
  const participationRouter = require("./routes/participation");
  app.use("/api/participation", participationRouter);
  console.log("✅ Participation routes registered at /api/participation");
} catch (err) {
  console.error("❌ Failed to register participation routes:", err.message);
}

// Attendance routes
app.get("/api/events/:eventId/participants", async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log("Fetching participants for event:", eventId);

    const Participation = require("./models/Participation");
    const participants = await Participation.find({
      eventId,
      status: "Registered",
    });

    console.log(`Found ${participants.length} participants`);
    res.status(200).json(participants);
  } catch (error) {
    console.error("Get participants error:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

app.post("/api/events/:eventId/attendance", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendance } = req.body;

    console.log("Saving attendance for event:", eventId);
    console.log("Attendance data:", attendance);

    const Participation = require("./models/Participation");

    // Update each participant's attendance status
    const updates = Object.entries(attendance).map(
      ([participationId, isPresent]) => {
        return Participation.findByIdAndUpdate(
          participationId,
          { status: isPresent ? "Attended" : "Absent" },
          { new: true }
        );
      }
    );

    await Promise.all(updates);

    console.log("Attendance saved successfully");
    res.status(200).json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Save attendance error:", error);
    res.status(500).json({ message: "Failed to save attendance" });
  }
});

app.get("/api/events/:eventId/attendance/report", async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log("Generating attendance report for event:", eventId);

    const Event = require("./models/Event");
    const Participation = require("./models/Participation");

    const event = await Event.findById(eventId);
    const participants = await Participation.find({ eventId });

    // Generate CSV
    let csv = "Name,Email,Department,Status,Registered Date\n";

    participants.forEach((p) => {
      csv += `"${p.studentName}","${p.studentEmail}","Department","${
        p.status
      }","${new Date(p.registeredAt).toLocaleDateString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance_${event.title}_${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

// Departments routes
const departments = [
  {
    id: "1",
    name: "Computer Science",
    code: "CS",
    description: "Department of Computer Science and Engineering",
    hodId: "",
    hodName: "",
  },
  {
    id: "2",
    name: "Electrical Engineering",
    code: "EE",
    description: "Department of Electrical Engineering",
    hodId: "",
    hodName: "",
  },
  {
    id: "3",
    name: "Mechanical Engineering",
    code: "ME",
    description: "Department of Mechanical Engineering",
    hodId: "",
    hodName: "",
  },
  {
    id: "4",
    name: "Civil Engineering",
    code: "CE",
    description: "Department of Civil Engineering",
    hodId: "",
    hodName: "",
  },
  {
    id: "5",
    name: "Information Technology",
    code: "IT",
    description: "Department of Information Technology",
    hodId: "",
    hodName: "",
  },
  {
    id: "6",
    name: "Electronics & Communication",
    code: "EC",
    description: "Department of Electronics & Communication",
    hodId: "",
    hodName: "",
  },
];

// DELETE must come before GET to avoid route conflicts
app.delete("/api/departments/:id", (req, res) => {
  try {
    console.log("DELETE /api/departments/:id called for:", req.params.id);
    const index = departments.findIndex((d) => d.id === req.params.id);

    if (index !== -1) {
      const deleted = departments[index];
      departments.splice(index, 1);
      console.log("Department deleted:", deleted.name);
      res.json({ message: "Department deleted successfully" });
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({ message: "Failed to delete department" });
  }
});

app.get("/api/departments/:id", (req, res) => {
  console.log("GET /api/departments/:id called for:", req.params.id);
  const dept = departments.find((d) => d.id === req.params.id);
  if (dept) {
    res.json(dept);
  } else {
    res.status(404).json({ message: "Department not found" });
  }
});

app.get("/api/departments", (req, res) => {
  console.log("GET /api/departments called");
  res.json(departments);
});

app.post("/api/departments", async (req, res) => {
  try {
    console.log("POST /api/departments called with:", req.body);
    const { name, code, description, hodId } = req.body;

    if (!hodId) {
      return res.status(400).json({ message: "HOD assignment is required" });
    }

    // Get HOD details
    const User = require("./models/User");
    const hod = await User.findById(hodId);

    const newDept = {
      id: String(departments.length + 1),
      name,
      code,
      description,
      hodId,
      hodName: hod ? `${hod.First_name} ${hod.Last_name}` : "Unknown",
    };

    departments.push(newDept);
    console.log("Department created:", newDept);
    res.status(201).json(newDept);
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ message: "Failed to create department" });
  }
});

app.put("/api/departments/:id", async (req, res) => {
  try {
    console.log("PUT /api/departments/:id called for:", req.params.id);
    const index = departments.findIndex((d) => d.id === req.params.id);

    if (index !== -1) {
      const { name, code, description, hodId } = req.body;

      // Get HOD details if hodId is provided
      let hodName = departments[index].hodName;
      if (hodId) {
        const User = require("./models/User");
        const hod = await User.findById(hodId);
        hodName = hod ? `${hod.First_name} ${hod.Last_name}` : "Unknown";
      }

      departments[index] = {
        ...departments[index],
        name,
        code,
        description,
        hodId: hodId || departments[index].hodId,
        hodName,
      };

      console.log("Department updated:", departments[index]);
      res.json(departments[index]);
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({ message: "Failed to update department" });
  }
});

// Users route
app.get("/api/users", async (req, res) => {
  try {
    console.log("GET /api/users called with query:", req.query);
    const User = require("./models/User");
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-Password");
    console.log(`Found ${users.length} users`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

console.log("✅ All routes registered\n");

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Backend is running!",
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    routes: {
      auth: "/",
      events: "/api/events",
      tasks: "/api/tasks",
      profile: "/api/profile",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("\n=== ERROR ===");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("=============\n");
  res.status(500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`✅ Ready to accept requests\n`);
});
