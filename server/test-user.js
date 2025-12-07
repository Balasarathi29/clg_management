require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const testUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clg_management"
    );
    console.log("✅ Connected to MongoDB");

    // Create test user
    const testData = {
      First_name: "Test",
      Last_name: "User",
      Email: "test@example.com",
      Password: "password123",
      Program: "CS",
      role: "student",
    };

    console.log("\n📝 Creating test user...");
    const user = await User.create(testData);
    console.log("✅ User created:", {
      id: user._id,
      name: `${user.First_name} ${user.Last_name}`,
      email: user.Email,
      role: user.role,
    });

    // Test password matching
    const userWithPassword = await User.findById(user._id).select("+Password");
    const isMatch = await userWithPassword.matchPassword("password123");
    console.log("✅ Password match test:", isMatch ? "PASSED" : "FAILED");

    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log("✅ Test user deleted\n");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

testUser();
