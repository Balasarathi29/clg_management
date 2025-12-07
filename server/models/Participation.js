const mongoose = require("mongoose");

const ParticipationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventTitle: String,
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: String,
    studentEmail: String,
    status: {
      type: String,
      enum: ["Registered", "Attended", "Absent"],
      default: "Registered",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Participation", ParticipationSchema);
