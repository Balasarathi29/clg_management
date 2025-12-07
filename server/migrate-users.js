require("dotenv").config();
const mongoose = require("mongoose");

async function migrateUsers() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clg_management"
    );
    console.log("✅ Connected to MongoDB\n");

    // Update Program field to Department field
    const result = await mongoose.connection.db.collection("users").updateMany(
      { Program: { $exists: true } },
      {
        $rename: { Program: "Department" },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
    console.log("✅ Migration complete\n");

    // Show all users with their roles
    const users = await mongoose.connection.db
      .collection("users")
      .find({})
      .toArray();
    console.log("Current users:");
    users.forEach((u) => {
      console.log(
        `- ${u.Email}: ${u.role} (${u.Department || "No Department"})`
      );
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

migrateUsers();
