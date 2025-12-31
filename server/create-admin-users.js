const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const User = require("./models/User");

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdminUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Create Admin Account
    console.log("Creating Admin account...");
    const adminExists = await User.findOne({ Email: "admin@college.edu" });

    if (!adminExists) {
      const admin = await User.create({
        First_name: "Admin",
        Last_name: "User",
        Email: "admin@college.edu",
        Password: "admin123",
        role: "admin",
        Department: "Administration",
        DOB: "1990-01-01",
      });
      console.log("✅ Admin created:", admin.Email);
    } else {
      console.log("⚠️  Admin already exists:", adminExists.Email);
    }

    // 2. Create HOD Accounts for each department
    const departments = [
      "Computer Science",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Information Technology",
      "Electronics & Communication",
    ];

    console.log("\nCreating HOD accounts...");
    for (const dept of departments) {
      const hodEmail = `hod.${dept
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/&/g, "")}@college.edu`;
      const hodExists = await User.findOne({ Email: hodEmail });

      if (!hodExists) {
        const hod = await User.create({
          First_name: "HOD",
          Last_name: dept,
          Email: hodEmail,
          Password: "hod123",
          role: "hod",
          Department: dept,
          DOB: "1985-01-01",
        });
        console.log(`✅ HOD created: ${hod.Email} (${dept})`);
      } else {
        console.log(`⚠️  HOD already exists: ${hodEmail}`);
      }
    }

    // 3. Create Sample Faculty Accounts
    console.log("\nCreating Faculty accounts...");
    const faculties = [
      { name: "John", dept: "Computer Science" },
      { name: "Sarah", dept: "Electrical Engineering" },
      { name: "Michael", dept: "Mechanical Engineering" },
    ];

    for (const faculty of faculties) {
      const facultyEmail = `${faculty.name.toLowerCase()}.faculty@college.edu`;
      const facultyExists = await User.findOne({ Email: facultyEmail });

      if (!facultyExists) {
        const fac = await User.create({
          First_name: faculty.name,
          Last_name: "Faculty",
          Email: facultyEmail,
          Password: "faculty123",
          role: "faculty",
          Department: faculty.dept,
          DOB: "1988-01-01",
        });
        console.log(`✅ Faculty created: ${fac.Email} (${faculty.dept})`);
      } else {
        console.log(`⚠️  Faculty already exists: ${facultyEmail}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✨ Setup Complete! Here are the login credentials:\n");

    console.log("📌 ADMIN ACCOUNT:");
    console.log("   Email: admin@college.edu");
    console.log("   Password: admin123\n");

    console.log("📌 HOD ACCOUNTS:");
    departments.forEach((dept) => {
      const email = `hod.${dept
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/&/g, "")}@college.edu`;
      console.log(`   ${dept}:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: hod123\n`);
    });

    console.log("📌 FACULTY ACCOUNTS:");
    faculties.forEach((faculty) => {
      const email = `${faculty.name.toLowerCase()}.faculty@college.edu`;
      console.log(`   ${faculty.name} (${faculty.dept}):`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: faculty123\n`);
    });

    console.log("=".repeat(60));
    console.log("\n🎉 You can now login with these accounts!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  }
}

createAdminUsers();
