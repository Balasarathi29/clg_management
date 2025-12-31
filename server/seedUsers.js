require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/clg_management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Clear existing users (optional)
    // await User.deleteMany({});

    // Create admin user
    const admin = await User.create({
      First_name: "Admin",
      Last_name: "User",
      Email: "admin@college.edu",
      Password: "admin123",
      role: "admin",
      Department: "Administration",
      DOB: "1990-01-01",
    });

    // Create HOD user
    const hod = await User.create({
      First_name: "John",
      Last_name: "Doe",
      Email: "hod.cs@college.edu",
      Password: "hod123",
      role: "hod",
      Department: "Computer Science",
      DOB: "1985-05-15",
    });

    // Create Faculty user
    const faculty = await User.create({
      First_name: "Jane",
      Last_name: "Smith",
      Email: "faculty.cs@college.edu",
      Password: "faculty123",
      role: "faculty",
      Department: "Computer Science",
      DOB: "1988-08-20",
    });

    console.log("\n✅ Users created successfully!\n");
    console.log("=".repeat(50));
    console.log("LOGIN CREDENTIALS:");
    console.log("=".repeat(50));
    console.log("\n👤 ADMIN:");
    console.log("   Email: admin@college.edu");
    console.log("   Password: admin123\n");
    console.log("👤 HOD:");
    console.log("   Email: hod.cs@college.edu");
    console.log("   Password: hod123\n");
    console.log("👤 FACULTY:");
    console.log("   Email: faculty.cs@college.edu");
    console.log("   Password: faculty123\n");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
