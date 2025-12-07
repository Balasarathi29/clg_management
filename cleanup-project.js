const fs = require("fs");
const path = require("path");

console.log("🧹 Co-Nexus Project Cleanup\n");

// Files/folders that are safe to delete
const unnecessaryItems = [
  // Test/mock files
  "server/test-api.js",
  "server/test-user.js",
  "server/create-test-user.js",
  "server/check-setup.js",
  "server/create-env.js",
  "server/migrate-users.js",

  // Build/cache folders
  "node_modules/.vite",
  "node_modules/.cache",
  "dist",
  ".next",
  "build",

  // Log files
  "*.log",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",

  // OS files
  ".DS_Store",
  "Thumbs.db",
  "desktop.ini",

  // Editor files
  ".vscode/settings.json",
  ".idea",
  "*.swp",
  "*.swo",
  "*~",
];

const safeToDeleteDirs = [
  "server/test",
  "server/tests",
  "src/__tests__",
  "coverage",
];

console.log("Files/folders that can be safely removed:\n");

unnecessaryItems.forEach((item) => {
  console.log(`  ❌ ${item}`);
});

console.log("\nDirectories that can be removed if they exist:\n");
safeToDeleteDirs.forEach((dir) => {
  console.log(`  📁 ${dir}`);
});

console.log("\n⚠️  IMPORTANT: Do NOT delete these:\n");
const keepFiles = [
  "✅ server/server.js",
  "✅ server/models/*",
  "✅ server/routes/*",
  "✅ server/config/*",
  "✅ server/.env",
  "✅ server/package.json",
  "✅ src/*",
  "✅ public/*",
  "✅ package.json",
  "✅ index.html",
  "✅ vite.config.js",
  "✅ tailwind.config.js",
  "✅ postcss.config.js",
];

keepFiles.forEach((file) => console.log(`  ${file}`));

console.log("\n📋 Manual cleanup steps:\n");
console.log("1. Delete test files (test-*.js, create-*.js)");
console.log("2. Clear node_modules/.vite cache");
console.log("3. Remove any .log files");
console.log("4. Delete unused pages (if any)");
console.log("\nRun these commands to clean:\n");
console.log("# Delete test files");
console.log("cd server");
console.log("del test-*.js create-*.js check-*.js migrate-*.js");
console.log("\n# Clear cache");
console.log("cd ..");
console.log("rmdir /s /q node_modules\\.vite");
console.log("\n# Clean server cache");
console.log("cd server");
console.log("rmdir /s /q node_modules\\.cache");
