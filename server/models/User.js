const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  First_name: { type: String, required: true },
  Last_name: { type: String, required: true },
  Email: { type: String, required: true, unique: true, lowercase: true },
  Password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "hod", "faculty", "student"],
    default: "student",
  },
  Department: { type: String },
  DOB: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    console.log("✅ Password hashed for user:", this.Email);
    next();
  } catch (error) {
    console.error("❌ Error hashing password:", error);
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords...");
    const result = await bcrypt.compare(candidatePassword, this.Password);
    console.log("Password comparison result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error comparing passwords:", error);
    throw new Error(error);
  }
};

module.exports = mongoose.model("User", UserSchema);
