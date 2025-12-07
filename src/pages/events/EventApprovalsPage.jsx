import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiClock,
  FiCheck,
  FiX,
  FiEye,
} from "react-icons/fi";

const EventApprovalsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = res.data || [];

      // Show ONLY PENDING events (first-time approval)
      const pendingEvents = allEvents.filter((e) => {
        const isPending = e.status === "Pending";
        const isDepartment =
          e.departmentId === user.Department ||
          e.departmentName === user.Department ||
          e.Department === user.Department;

        return isPending && isDepartment;
      });

      console.log("Pending events for approval:", pendingEvents.length);
      setEvents(pendingEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    if (!window.confirm("Are you sure you want to approve this event?")) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/events/${eventId}`,
        { status: "Approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Event approved successfully!");
      setSelectedEvent(null);
      fetchPendingEvents(); // Refresh list
    } catch (err) {
      console.error("Failed to approve event", err);
      alert("Failed to approve event");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (eventId) => {
    if (!window.confirm("Are you sure you want to reject this event?")) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/events/${eventId}`,
        { status: "Rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Event rejected successfully!");
      setSelectedEvent(null);
      fetchPendingEvents(); // Refresh list
    } catch (err) {
      console.error("Failed to reject event", err);
      alert("Failed to reject event");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Event Approvals</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">
            Total:{" "}
            <span className="text-white font-semibold">{events.length}</span>
          </span>
          <span className="text-gray-400">
            Pending:{" "}
            <span className="text-yellow-300 font-semibold">
              {events.filter((e) => e.status === "Pending").length}
            </span>
          </span>
          <span className="text-gray-400">
            Approved:{" "}
            <span className="text-green-300 font-semibold">
              {events.filter((e) => e.status === "Approved").length}
            </span>
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No events pending approval</p>
          <p className="text-gray-500 text-sm mt-2">
            Events for your department will appear here when faculty submit
            them.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            Your department:{" "}
            <span className="text-teal-400">{user.Department}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    event.status === "Approved"
                      ? "bg-green-900/50 text-green-300"
                      : event.status === "Pending"
                      ? "bg-yellow-900/50 text-yellow-300"
                      : "bg-red-900/50 text-red-300"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <FiCalendar className="text-teal-400" />
                  <span>
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiClock className="text-teal-400" />
                  <span>{event.time || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiMapPin className="text-teal-400" />
                  <span>{event.venue || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiUsers className="text-teal-400" />
                  <span>Max {event.maxParticipants || 0} participants</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">
                  Created by:{" "}
                  <span className="text-white">
                    {event.createdByName || "Unknown"}
                  </span>
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition"
                  >
                    <FiEye /> View Details
                  </button>

                  {/* Show Approve button for Pending or Rejected events */}
                  {(event.status === "Pending" ||
                    event.status === "Rejected") && (
                    <button
                      onClick={() => handleApprove(event._id)}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition disabled:opacity-50"
                    >
                      <FiCheck /> Approve
                    </button>
                  )}

                  {/* Show Reject button for Pending or Approved events */}
                  {(event.status === "Pending" ||
                    event.status === "Approved") && (
                    <button
                      onClick={() => handleReject(event._id)}
                      disabled={processing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition disabled:opacity-50"
                    >
                      <FiX /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedEvent.title}
              </h2>
              <span className="px-3 py-1 rounded text-xs font-semibold bg-yellow-900/50 text-yellow-300 inline-block mt-2">
                {selectedEvent.status}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-300">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-white font-semibold">
                    {selectedEvent.date
                      ? new Date(selectedEvent.date).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="text-white font-semibold">
                    {selectedEvent.time || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Venue</p>
                  <p className="text-white font-semibold">
                    {selectedEvent.venue || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Max Participants</p>
                  <p className="text-white font-semibold">
                    {selectedEvent.maxParticipants || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Department</p>
                  <p className="text-white font-semibold">
                    {selectedEvent.departmentName || selectedEvent.departmentId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created By</p>
                  <p className="text-white font-semibold">
                    {selectedEvent.createdByName || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 flex gap-3">
                {/* Show Approve button for Pending or Rejected events */}
                {(selectedEvent.status === "Pending" ||
                  selectedEvent.status === "Rejected") && (
                  <button
                    onClick={() => handleApprove(selectedEvent._id)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 justify-center transition disabled:opacity-50"
                  >
                    <FiCheck /> {processing ? "Processing..." : "Approve Event"}
                  </button>
                )}

                {/* Show Reject button for Pending or Approved events */}
                {(selectedEvent.status === "Pending" ||
                  selectedEvent.status === "Approved") && (
                  <button
                    onClick={() => handleReject(selectedEvent._id)}
                    disabled={processing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 justify-center transition disabled:opacity-50"
                  >
                    <FiX /> {processing ? "Processing..." : "Reject Event"}
                  </button>
                )}

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventApprovalsPage;
