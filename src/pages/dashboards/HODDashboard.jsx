import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiCheckSquare,
  FiUserCheck,
} from "react-icons/fi";

const StatCard = ({ icon: IconComponent, title, value, color }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between mb-2">
      <IconComponent className={`w-8 h-8 ${color}`} />
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
    <p className="text-gray-400 text-sm">{title}</p>
  </div>
);

const HODDashboard = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalEvents: 0,
    facultyCount: 0,
    studentCount: 0,
  });
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Fetch events
      const eventsRes = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = eventsRes.data || [];
      const departmentEvents = allEvents.filter(
        (e) =>
          e.departmentId === user.Department ||
          e.departmentName === user.Department ||
          e.Department === user.Department
      );

      // Only show PENDING events in dashboard (first-time review)
      const pendingForReview = departmentEvents.filter(
        (e) => e.status === "Pending"
      );

      // Fetch users
      const usersRes = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = usersRes.data || [];
      const departmentUsers = allUsers.filter(
        (u) => u.Department === user.Department
      );

      setStats({
        pendingApprovals: pendingForReview.length, // Only pending events count
        totalEvents: departmentEvents.length,
        facultyCount: departmentUsers.filter((u) => u.role === "faculty")
          .length,
        studentCount: departmentUsers.filter((u) => u.role === "student")
          .length,
      });

      // Only show pending events in dashboard list
      setPendingEvents(pendingForReview.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
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
      fetchDashboardData(); // Refresh
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
      fetchDashboardData(); // Refresh
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
      <h1 className="text-3xl font-bold text-white mb-6">HOD Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiCheckSquare}
          title="Pending Events"
          value={stats.pendingApprovals}
          color="text-yellow-400"
        />
        <StatCard
          icon={FiCalendar}
          title="Total Events"
          value={stats.totalEvents}
          color="text-blue-400"
        />
        <StatCard
          icon={FiUserCheck}
          title="Faculty Count"
          value={stats.facultyCount}
          color="text-green-400"
        />
        <StatCard
          icon={FiUsers}
          title="Student Count"
          value={stats.studentCount}
          color="text-purple-400"
        />
      </div>

      {/* Only show pending events section if there are pending events */}
      {stats.pendingApprovals > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Pending Events</h2>
            <Link
              to="/event-approvals"
              className="text-teal-400 hover:text-teal-300 text-sm"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300 font-semibold">
                    Event Name
                  </th>
                  <th className="py-3 px-4 text-gray-300 font-semibold hidden sm:table-cell">
                    Date
                  </th>
                  <th className="py-3 px-4 text-gray-300 font-semibold hidden md:table-cell">
                    Created By
                  </th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.map((event) => (
                  <tr
                    key={event._id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-4 text-white">{event.title}</td>
                    <td className="py-4 px-4 text-gray-400 hidden sm:table-cell">
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "TBD"}
                    </td>
                    <td className="py-4 px-4 text-gray-400 hidden md:table-cell">
                      {event.createdByName || "Unknown"}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-teal-400 hover:text-teal-300 text-sm font-semibold"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Show message when no pending events */}
      {stats.pendingApprovals === 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <FiCheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-400">
            No events are waiting for approval at the moment.
          </p>
          <Link
            to="/event-approvals"
            className="inline-block mt-4 text-teal-400 hover:text-teal-300 text-sm font-semibold"
          >
            View All Events →
          </Link>
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
                <button
                  onClick={() => handleApprove(selectedEvent._id)}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {processing ? "Processing..." : "✓ Approve"}
                </button>
                <button
                  onClick={() => handleReject(selectedEvent._id)}
                  disabled={processing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {processing ? "Processing..." : "✗ Reject"}
                </button>
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

export default HODDashboard;
