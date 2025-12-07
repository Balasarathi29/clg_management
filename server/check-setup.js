const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Backend Setup...\n");

const files = [
  "server.js",
  "routes/auth.js",
  "routes/events.js",
  "routes/tasks.js",
  "routes/profile.js",
  "models/User.js",
  "models/Event.js",
  "models/Task.js",
  "config/db.js",
  ".env",
];

files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} MISSING`);
  }
});

console.log("\n📋 Run this script: node check-setup.js");
