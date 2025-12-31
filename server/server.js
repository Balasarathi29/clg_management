const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Fallback to environment values
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

// Auto-seed database on startup - Only create admin
const seedDatabase = async () => {
  try {
    let retries = 0;
    while (mongoose.connection.readyState !== 1 && retries < 10) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries++;
    }

    if (mongoose.connection.readyState !== 1) {
      console.error("❌ Database not connected, skipping seed");
      return;
    }

    const User = require("./models/User");
    const Department = require("./models/Department");

    // Check if admin exists
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("📦 Creating default admin account...");

      await User.create({
        First_name: "Admin",
        Last_name: "User",
        Email: "admin@college.edu",
        Password: "admin123",
        role: "admin",
        Department: "Administration",
        DOB: "1990-01-01",
      });

      console.log("\n✅ Admin account created!");
      console.log("=".repeat(50));
      console.log("ADMIN LOGIN CREDENTIALS:");
      console.log("Email: admin@college.edu");
      console.log("Password: admin123");
      console.log("=".repeat(50) + "\n");
    } else {
      console.log(`✅ Admin account already exists: ${adminExists.Email}`);
    }

    // Seed default departments if none exist
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log("📦 Creating default departments...");

      const defaultDepartments = [
        {
          name: "Computer Science",
          code: "CS",
          description: "Department of Computer Science",
        },
        {
          name: "Electrical Engineering",
          code: "EE",
          description: "Department of Electrical Engineering",
        },
        {
          name: "Mechanical Engineering",
          code: "ME",
          description: "Department of Mechanical Engineering",
        },
        {
          name: "Civil Engineering",
          code: "CE",
          description: "Department of Civil Engineering",
        },
        {
          name: "Information Technology",
          code: "IT",
          description: "Department of Information Technology",
        },
        {
          name: "Electronics & Communication",
          code: "EC",
          description: "Department of Electronics & Communication",
        },
      ];

      await Department.insertMany(defaultDepartments);
      console.log("✅ Default departments created!");
    }

    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    console.log(
      `📊 Total departments in database: ${await Department.countDocuments()}`
    );
  } catch (error) {
    console.error("❌ Seed error:", error.message);
  }
};

// Connect to database
connectDB().then(() => {
  setTimeout(seedDatabase, 2000);
});

mongoose.connection.once("open", async () => {
  console.log("✅ MongoDB connected successfully");
  console.log("📊 Database:", mongoose.connection.name);
});

const app = express();

// --- FIX: Allow all headers and handle OPTIONS preflight ---
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"], // Allow all headers
  })
);

// Log all incoming headers for debugging
app.use((req, res, next) => {
  console.log("[DEBUG] Incoming headers:", req.headers);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Check MongoDB connection before processing requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "Database connection not established. Please ensure MongoDB is running on localhost:27017",
    });
  }
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/participation", require("./routes/participation"));

// User management routes - IMPORTANT: Specific routes BEFORE parameterized routes

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const User = require("./models/User");
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-Password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

// Create HOD
app.post("/api/users/create-hod", async (req, res) => {
  try {
    const User = require("./models/User");
    const { First_name, Last_name, Email, Password, Department, adminId } =
      req.body;

    // Verify admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can create HOD accounts" });
    }

    if (!First_name || !Last_name || !Email || !Password || !Department) {
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

    const hod = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: "hod",
      Department,
      createdBy: adminId,
    });

    console.log("✅ HOD created by Admin:", hod.Email);

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
    res
      .status(500)
      .json({ message: error.message || "Server error creating HOD" });
  }
});

// Create Faculty
app.post("/api/users/create-faculty", async (req, res) => {
  try {
    const User = require("./models/User");
    const { First_name, Last_name, Email, Password, Department, hodId } =
      req.body;

    // Verify HOD
    const hod = await User.findById(hodId);
    if (!hod || hod.role !== "hod") {
      return res
        .status(403)
        .json({ message: "Only HOD can create faculty accounts" });
    }

    // HOD can only create faculty in their department
    if (hod.Department !== Department) {
      return res
        .status(403)
        .json({ message: "HOD can only create faculty in their department" });
    }

    if (!First_name || !Last_name || !Email || !Password || !Department) {
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

    const faculty = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: "faculty",
      Department,
      createdBy: hodId,
    });

    console.log("✅ Faculty created by HOD:", faculty.Email);

    res.status(201).json({
      message: "Faculty account created successfully",
      user: {
        id: faculty._id,
        First_name: faculty.First_name,
        Last_name: faculty.Last_name,
        Email: faculty.Email,
        role: faculty.role,
        Department: faculty.Department,
      },
    });
  } catch (error) {
    console.error("Create faculty error:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error creating faculty" });
  }
});

// Create user (generic)
app.post("/api/users/create", async (req, res) => {
  try {
    const User = require("./models/User");
    const { First_name, Last_name, Email, Password, Department, role } =
      req.body;

    // Get admin ID from authorization header or body
    let adminId = req.body.adminId;

    // If adminId not in body, try to get from token (if you're using auth middleware)
    if (!adminId && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        adminId = decoded.id;
      } catch (err) {
        console.log("Token verification failed:", err.message);
      }
    }

    // If role is not provided, default to "student"
    const userRole = role || "student";

    // For student, Department is optional
    if (!First_name || !Last_name || !Email || !Password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }
    // For non-student, Department is required
    if (userRole !== "student" && !Department) {
      return res.status(400).json({
        message: "Department is required for non-student accounts",
      });
    }

    const userExists = await User.findOne({ Email: Email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: userRole,
      Department: userRole === "student" ? "" : Department,
      createdBy: adminId,
    });

    console.log(`✅ ${userRole.toUpperCase()} created:`, user.Email);

    res.status(201).json({
      message: `${userRole} account created successfully`,
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
    console.error("Create user error:", error);
    res.status(500).json({
      message: error.message || "Server error creating user",
      debug: error, // Add debug info for troubleshooting
    });
  }
});

// Get single user - MUST be before other :id routes
app.get("/api/users/:id", async (req, res) => {
  try {
    const User = require("./models/User");
    const user = await User.findById(req.params.id).select("-Password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const User = require("./models/User");
    const { First_name, Last_name, Email, Department, role, Password } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get admin ID from token
    let adminId = req.body.adminId;
    if (!adminId && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        adminId = decoded.id;
      } catch (err) {
        console.log("Token verification failed:", err.message);
      }
    }

    // Verify admin
    if (adminId) {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Only admin can update users" });
      }
    }

    // Update fields
    user.First_name = First_name || user.First_name;
    user.Last_name = Last_name || user.Last_name;
    user.Email = Email || user.Email;
    user.Department = Department || user.Department;
    user.role = role || user.role;

    // Only update password if provided
    if (Password) {
      user.Password = Password;
    }

    await user.save();

    console.log(`✅ User updated: ${user.Email}`);

    res.status(200).json({
      message: "User updated successfully",
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
    console.error("Update user error:", error);
    res.status(500).json({ message: error.message || "Failed to update user" });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const User = require("./models/User");
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`✅ User deleted: ${user.Email} (${user.role})`);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: error.message || "Server error deleting user",
    });
  }
});

// Profile routes are now defined directly in server.js
app.get("/api/profile/:id", async (req, res) => {
  try {
    const User = require("./models/User");
    const user = await User.findById(req.params.id).select("-Password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: error.message });
  }
});

app.put("/api/profile/:id", async (req, res) => {
  // Debug log for every profile update request
  console.log(`[DEBUG] PUT /api/profile/${req.params.id}`);
  console.log("[DEBUG] Headers:", req.headers);
  console.log("[DEBUG] Body:", req.body);

  try {
    const User = require("./models/User");
    const { First_name, Last_name, DOB, Department } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get current user from token
    let currentUserId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Allow user to update their own profile OR admin to update any profile
    const currentUser = await User.findById(currentUserId);
    const isOwnProfile = currentUserId === req.params.id;
    const isAdmin = currentUser && currentUser.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    // Update allowed fields
    if (First_name) user.First_name = First_name;
    if (Last_name) user.Last_name = Last_name;
    if (DOB) user.DOB = DOB;

    // Only admin or HOD can change department
    if (Department && (isAdmin || currentUser.role === "hod")) {
      user.Department = Department;
    }

    await user.save();

    console.log(
      `✅ Profile updated: ${user.Email} (by ${
        isOwnProfile ? "self" : "admin"
      })`
    );

    // Return updated user without password
    const updatedUser = await User.findById(req.params.id).select("-Password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update profile" });
  }
});

// Attendance routes
app.get("/api/events/:eventId/participants", async (req, res) => {
  try {
    const Participation = require("./models/Participation");
    const participants = await Participation.find({
      eventId: req.params.eventId,
      status: "Registered",
    });
    res.status(200).json(participants);
  } catch (error) {
    console.error("Get participants error:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

app.post("/api/events/:eventId/attendance", async (req, res) => {
  try {
    const { attendance } = req.body;
    const Participation = require("./models/Participation");

    const updates = Object.entries(attendance).map(
      ([participationId, isPresent]) =>
        Participation.findByIdAndUpdate(
          participationId,
          { status: isPresent ? "Attended" : "Absent" },
          { new: true }
        )
    );

    await Promise.all(updates);
    res.status(200).json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Save attendance error:", error);
    res.status(500).json({ message: "Failed to save attendance" });
  }
});

app.get("/api/events/:eventId/attendance/report", async (req, res) => {
  try {
    // ...existing code for attendance report...
    // (You may want to implement the actual attendance report logic here)
    res
      .status(200)
      .json({ message: "Attendance report endpoint (to be implemented)" });
  } catch (error) {
    console.error("Attendance report error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to get attendance report" });
  }
});

app.delete("/api/departments/:id", async (req, res) => {
  try {
    const Department = require("./models/Department");
    const User = require("./models/User");

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if department has HOD assigned
    if (department.hodId) {
      const hod = await User.findById(department.hodId);
      if (hod) {
        hod.Department = null;
        await hod.save();
      }
    }

    // TODO: Check if department has faculty or students before deleting
    await Department.findByIdAndDelete(req.params.id);

    console.log("✅ Department deleted:", department.name);

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete department error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to delete department" });
  }
});

// Reports endpoint
app.get("/api/reports", async (req, res) => {
  try {
    const Event = require("./models/Event");
    const User = require("./models/User");
    const Participation = require("./models/Participation");

    // Get statistics
    const [totalEvents, totalUsers, totalParticipations] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments({ role: { $ne: "admin" } }),
      Participation.countDocuments(),
    ]);

    // Get events by status
    const now = new Date();
    const upcomingEvents = await Event.countDocuments({ date: { $gte: now } });
    const completedEvents = await Event.countDocuments({ date: { $lt: now } });

    // Get users by role
    const usersByRole = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Get events by department
    const eventsByDepartment = await Event.aggregate([
      { $group: { _id: "$Department", count: { $sum: 1 } } },
    ]);

    // Get recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title date location Department");

    // Get participation stats
    const participationStats = await Participation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      summary: {
        totalEvents,
        totalUsers,
        totalParticipations,
        upcomingEvents,
        completedEvents,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      eventsByDepartment: eventsByDepartment.map((item) => ({
        department: item._id || "General",
        count: item.count,
      })),
      recentEvents,
      participationStats: participationStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      message: "Failed to fetch report data",
      error: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "running",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
