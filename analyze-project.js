const fs = require("fs");
const path = require("path");

console.log("🔍 Analyzing Co-Nexus Project Structure\n");

// Check if files exist
const checkFiles = [
  // Frontend - Pages that might be redundant
  {
    path: "src/pages/ForgotPasswordPage.jsx",
    reason: "Forgot password logic is now in LoginForm.jsx",
    action: "DELETE",
  },

  // Test/Development files
  {
    path: "server/test-api.js",
    reason: "Test file for API testing",
    action: "DELETE",
  },
  {
    path: "server/test-user.js",
    reason: "Test file for user creation",
    action: "DELETE",
  },
  {
    path: "server/create-test-user.js",
    reason: "Development helper file",
    action: "DELETE",
  },
  {
    path: "server/check-setup.js",
    reason: "Setup validation file",
    action: "DELETE",
  },
  {
    path: "server/create-env.js",
    reason: "Environment setup helper",
    action: "DELETE",
  },
  {
    path: "server/migrate-users.js",
    reason: "Database migration script",
    action: "DELETE",
  },
  {
    path: "cleanup-project.js",
    reason: "Cleanup script (one-time use)",
    action: "DELETE",
  },
  {
    path: "analyze-project.js",
    reason: "Analysis script (this file)",
    action: "DELETE AFTER USE",
  },
];

console.log("❌ Files to DELETE:\n");
checkFiles.forEach((item) => {
  const filePath = path.join(__dirname, item.path);
  if (fs.existsSync(filePath)) {
    console.log(`  ❌ ${item.path}`);
    console.log(`     Reason: ${item.reason}`);
    console.log(`     Action: ${item.action}\n`);
  }
});

console.log("\n📋 Required Files (Must Keep):\n");
const requiredFiles = [
  "✅ server/server.js - Main backend server",
  "✅ server/.env - Environment configuration",
  "✅ server/package.json - Backend dependencies",
  "✅ server/models/User.js - User model",
  "✅ server/models/Event.js - Event model",
  "✅ server/models/Task.js - Task model",
  "✅ server/routes/auth.js - Authentication routes",
  "✅ server/routes/events.js - Event routes",
  "✅ server/routes/tasks.js - Task routes",
  "✅ server/routes/profile.js - Profile routes",
  "✅ server/utils/sendEmail.js - Email utility",
  "✅ server/config/db.js - Database config",
  "✅ src/App.jsx - Main React app",
  "✅ src/main.jsx - React entry point",
  "✅ src/index.css - Global styles",
  "✅ src/components/ - All components",
  "✅ src/pages/ - All pages (except ForgotPasswordPage)",
  "✅ package.json - Frontend dependencies",
  "✅ vite.config.js - Vite configuration",
  "✅ tailwind.config.js - Tailwind config",
  "✅ postcss.config.js - PostCSS config",
  "✅ index.html - HTML entry point",
];

requiredFiles.forEach((file) => console.log(`  ${file}`));

console.log("\n\n🗑️  Cleanup Commands:\n");
console.log("Run these commands to delete unnecessary files:\n");
console.log(
  'cd "c:\\Users\\Bala Sarathi\\OneDrive\\Desktop\\Projects\\BackendWork Conexus\\clg_management"'
);
console.log("");
console.log("REM Delete frontend redundant files");
console.log("del src\\pages\\ForgotPasswordPage.jsx 2>nul");
console.log("");
console.log("REM Delete backend test/helper files");
console.log("cd server");
console.log("del test-api.js 2>nul");
console.log("del test-user.js 2>nul");
console.log("del create-test-user.js 2>nul");
console.log("del check-setup.js 2>nul");
console.log("del create-env.js 2>nul");
console.log("del migrate-users.js 2>nul");
console.log("cd ..");
console.log("");
console.log("REM Delete analysis scripts");
console.log("del cleanup-project.js 2>nul");
console.log("del analyze-project.js 2>nul");
console.log("");
console.log("echo ✅ Cleanup complete!");
