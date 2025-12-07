const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Hardcoded Admin Credentials
const ADMIN_EMAIL = "admin@college.edu";
const ADMIN_PASSWORD = "Admin@123"; // Change this in production

// Hardcoded HOD Credentials per Department
const HOD_CREDENTIALS = {
  "Computer Science": { email: "hod.cs@college.edu", password: "HOD@CS123" },
  "Electrical Engineering": {
    email: "hod.ee@college.edu",
    password: "HOD@EE123",
  },
  "Mechanical Engineering": {
    email: "hod.me@college.edu",
    password: "HOD@ME123",
  },
  "Civil Engineering": { email: "hod.ce@college.edu", password: "HOD@CE123" },
  "Information Technology": {
    email: "hod.it@college.edu",
    password: "HOD@IT123",
  },
  "Electronics & Communication": {
    email: "hod.ec@college.edu",
    password: "HOD@EC123",
  },
};

// @route   POST /signup
// @desc    Register STUDENT only
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { First_name, Last_name, Email, Password, Department, DOB } =
      req.body;

    console.log("Signup request for:", Email);

    // Validate required fields
    if (!First_name || !Last_name || !Email || !Password || !Department) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ Email: Email.toLowerCase() });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Force role to be student for public signup
    const user = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: "student", // Always student for public signup
      Department,
      DOB,
    });

    const token = generateToken(user._id);

    console.log("Student created successfully:", user.Email);

    res.status(201).json({
      message: "Student account registered successfully",
      token,
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
    console.error("Signup error:", error.message);
    res.status(500).json({
      message: error.message || "Server error during signup",
    });
  }
});

// @route   POST /login
// @desc    Login user (Admin/HOD/Faculty/Student)
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    console.log("Login attempt for:", Email);

    if (!Email || !Password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const emailLower = Email.toLowerCase();

    // Check if Admin login
    if (emailLower === ADMIN_EMAIL.toLowerCase()) {
      if (Password === ADMIN_PASSWORD) {
        const token = jwt.sign(
          { id: "admin", role: "admin" },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE,
          }
        );

        console.log("Admin login successful");

        return res.status(200).json({
          message: "Admin login successful",
          token,
          user: {
            id: "admin",
            First_name: "System",
            Last_name: "Administrator",
            Email: ADMIN_EMAIL,
            role: "admin",
            Department: "Administration",
          },
        });
      } else {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
    }

    // Check if HOD login
    for (const [department, credentials] of Object.entries(HOD_CREDENTIALS)) {
      if (emailLower === credentials.email.toLowerCase()) {
        if (Password === credentials.password) {
          const token = jwt.sign(
            {
              id: `hod_${department.replace(/\s+/g, "_")}`,
              role: "hod",
              department,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRE,
            }
          );

          console.log("HOD login successful:", department);

          return res.status(200).json({
            message: "HOD login successful",
            token,
            user: {
              id: `hod_${department.replace(/\s+/g, "_")}`,
              First_name: "HOD",
              Last_name: department,
              Email: credentials.email,
              role: "hod",
              Department: department,
            },
          });
        } else {
          return res.status(401).json({ message: "Invalid HOD credentials" });
        }
      }
    }

    // Check for Faculty/Student in database
    const user = await User.findOne({ Email: emailLower }).select("+Password");

    if (!user) {
      console.log("User not found:", Email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(Password);

    if (!isPasswordCorrect) {
      console.log("Invalid password for user:", Email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    console.log("Login successful for:", user.Email, "Role:", user.role);

    res.status(200).json({
      message: "Login successful",
      token,
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
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Server error during login",
    });
  }
});

// @route   POST /forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { Email } = req.body;

    if (!Email) {
      return res
        .status(400)
        .json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ Email: Email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    // Generate reset token
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire time (30 minutes)
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Email HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
            color: #00d9a3; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .content { 
            padding: 40px 30px;
            background: white;
          }
          .content p {
            margin-bottom: 20px;
            color: #555;
            font-size: 16px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button { 
            display: inline-block; 
            padding: 15px 40px; 
            background: #00d9a3; 
            color: #1a1a2e; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            font-size: 16px;
            transition: background 0.3s;
          }
          .button:hover {
            background: #00b894;
          }
          .link-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 14px;
            color: #00d9a3;
            border: 1px dashed #ddd;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning strong {
            color: #856404;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            background: #f8f9fa;
            color: #666; 
            font-size: 13px;
            border-top: 1px solid #eee;
          }
          .footer p {
            margin: 5px 0;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🔐</div>
            <h1>Password Reset Request</h1>
            <p style="color: #00d9a3; margin: 0;">Co-Nexus College Management System</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.First_name} ${user.Last_name}</strong>,</p>
            
            <p>We received a request to reset your password for your Co-Nexus account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-box">${resetUrl}</div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This link will expire in 30 minutes for security reasons.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged. Your account is still secure.</p>
            
            <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
          </div>
          
          <div class="footer">
            <p><strong>Co-Nexus College Management System</strong></p>
            <p>© 2024 All rights reserved</p>
            <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
            <p style="color: #999; font-size: 11px; margin-top: 10px;">
              If you need help, contact your system administrator
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Try to send email
    try {
      await sendEmail({
        email: user.Email,
        subject: "🔐 Password Reset Request - Co-Nexus",
        html,
      });

      console.log("✅ Password reset email sent to:", user.Email);

      res.status(200).json({
        message:
          "Password reset link has been sent to your email. Please check your inbox and spam folder.",
      });
    } catch (emailError) {
      console.error("❌ Email send failed:", emailError.message);

      // Reset token and expiry if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // If email fails, return the link in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("\n===========================================");
        console.log("⚠️  EMAIL FAILED - DEVELOPMENT MODE");
        console.log("===========================================");
        console.log("User:", user.Email);
        console.log("Reset URL:", resetUrl);
        console.log("===========================================\n");

        return res.status(200).json({
          message:
            "Email service unavailable. Reset link generated (development mode only).",
          resetUrl: resetUrl, // Only in development
        });
      }

      return res.status(500).json({
        message:
          "Email could not be sent. Please try again later or contact support.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash token from URL
    const crypto = require("crypto");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    // Set new password
    user.Password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log("Password reset successful for:", user.Email);

    res.status(200).json({
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/users/create
// @desc    Admin creates HOD account
// @access  Private (Admin only)
router.post("/api/users/create", async (req, res) => {
  try {
    const { First_name, Last_name, Email, Password, Department } = req.body;

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

    // Create HOD account (Admin can only create HOD)
    const hod = await User.create({
      First_name,
      Last_name,
      Email: Email.toLowerCase(),
      Password,
      role: "hod", // Force role to HOD
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

// @route   GET /api/users
// @desc    Get users (filtered by role if provided)
// @access  Private
router.get("/api/users", async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select("-Password");
    console.log(
      `Users fetched: ${users.length} users (role: ${role || "all"})`
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of Admin accounts only
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Cannot delete Admin accounts",
      });
    }

    // Allow deletion of HOD, Faculty, and Student accounts
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

module.exports = router;
