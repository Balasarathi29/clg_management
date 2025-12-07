const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  First_name: {
    type: String,
    required: [true, "Please provide first name"],
    trim: true,
  },
  Last_name: {
    type: String,
    required: [true, "Please provide last name"],
    trim: true,
  },
  Email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  Password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["student", "faculty", "hod", "admin"],
    default: "student",
  },
  Department: {
    type: String,
    trim: true,
  },
  DOB: {
    type: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    return next();
  }

  try {
    console.log("Hashing password for:", this.Email);
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.Password);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

// Generate password reset token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
