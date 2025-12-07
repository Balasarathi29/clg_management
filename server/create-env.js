const fs = require("fs");
const path = require("path");

const envContent = `PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/clg_management
JWT_SECRET=college-management-super-secret-key-2024-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development`;

const envPath = path.join(__dirname, ".env");

try {
  fs.writeFileSync(envPath, envContent, { encoding: "utf8", flag: "w" });
  console.log("✅ .env file created successfully!");
  console.log("📁 Location:", envPath);
  console.log("\n📄 Content:");
  console.log("─".repeat(60));
  console.log(envContent);
  console.log("─".repeat(60));

  // Verify file was created
  if (fs.existsSync(envPath)) {
    const readContent = fs.readFileSync(envPath, "utf8");
    console.log("\n✓ File verified - content matches!");
  }

  console.log("\n✨ Now restart your server: npm run dev");
} catch (error) {
  console.error("❌ Error creating .env file:", error.message);
}
