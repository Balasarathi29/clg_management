const axios = require("axios");

const BASE_URL = "https://clg-managemt-backend.onrender.com";

async function testAPIs() {
  console.log("🧪 Testing College Management APIs\n");

  try {
    // Test 1: Server Health
    console.log("1️⃣ Testing server health...");
    const health = await axios.get(`${BASE_URL}/test`);
    console.log("✅ Server is running:", health.data.message);
    console.log("   MongoDB:", health.data.mongodb);
    console.log("   Routes:", health.data.routes);

    // Test 2: Event Creation
    console.log("\n2️⃣ Testing event creation...");
    const eventData = {
      title: "Test Event",
      description: "This is a test event",
      date: "2024-12-31",
      time: "10:00",
      venue: "Main Hall",
      maxParticipants: 100,
      departmentId: "CS",
    };

    try {
      const event = await axios.post(`${BASE_URL}/api/events`, eventData);
      console.log("✅ Event created:", event.data.title);
    } catch (err) {
      console.log(
        "❌ Event creation failed:",
        err.response?.data?.message || err.message
      );
    }

    // Test 3: Get Events
    console.log("\n3️⃣ Testing get events...");
    try {
      const events = await axios.get(`${BASE_URL}/api/events`);
      console.log("✅ Events fetched:", events.data.length, "events found");
    } catch (err) {
      console.log(
        "❌ Get events failed:",
        err.response?.data?.message || err.message
      );
    }

    // Test 4: Task Creation (will need event and user IDs)
    console.log("\n4️⃣ Testing task creation...");
    console.log("⚠️  Task creation requires valid event and user IDs");

    console.log("\n✨ API Test Complete!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAPIs();
