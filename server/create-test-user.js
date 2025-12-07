const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function createTestUser() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/clg_management");
    console.log("✅ Connected to MongoDB\n");

    const UserSchema = new mongoose.Schema({
      First_name: String,
      Last_name: String,
      Email: { type: String, unique: true, lowercase: true },
      Password: String,
      role: { type: String, default: "student" },
      Program: String,
    });

    const User = mongoose.model("User", UserSchema);

    // Delete existing test user
    await User.deleteMany({ Email: "test@test.com" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Create test user
    const user = await User.create({
      First_name: "Test",
      Last_name: "User",
      Email: "test@test.com",
      Password: hashedPassword,
      role: "student",
      Program: "CS",
    });

    console.log("✅ Test user created successfully!");
    console.log("\n📧 Email:", user.Email);
    console.log("🔑 Password: password123");
    console.log("👤 Role:", user.role);
    console.log("\n🎯 Use these credentials to login\n");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTestUser();
