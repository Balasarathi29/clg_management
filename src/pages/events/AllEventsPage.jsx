import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiClock,
  FiCheck,
  FiX,
} from "react-icons/fi";

const AllEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = res.data || [];

      // Filter by department
      const departmentEvents = allEvents.filter(
        (e) =>
          e.departmentId === user.Department ||
          e.departmentName === user.Department ||
          e.Department === user.Department
      );

      setEvents(departmentEvents);
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
      fetchAllEvents();
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
      fetchAllEvents();
    } catch (err) {
      console.error("Failed to reject event", err);
      alert("Failed to reject event");
    } finally {
      setProcessing(false);
    }
  };

  const filteredEvents =
    filterStatus === "all"
      ? events
      : events.filter((e) => e.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          All Events Management
        </h1>
      </div>

      {/* Filter Buttons - Responsive */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
            filterStatus === "all"
              ? "bg-teal-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          All ({events.length})
        </button>
        <button
          onClick={() => setFilterStatus("Pending")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
            filterStatus === "Pending"
              ? "bg-yellow-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Pending ({events.filter((e) => e.status === "Pending").length})
        </button>
        <button
          onClick={() => setFilterStatus("Approved")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
            filterStatus === "Approved"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Approved ({events.filter((e) => e.status === "Approved").length})
        </button>
        <button
          onClick={() => setFilterStatus("Rejected")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
            filterStatus === "Rejected"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Rejected ({events.filter((e) => e.status === "Rejected").length})
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No events found</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-gray-800 p-4 rounded-lg shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white flex-1">
                    {event.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
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

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiCalendar className="text-teal-400 w-4 h-4" />
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiUsers className="text-teal-400 w-4 h-4" />
                    <span>
                      {event.currentParticipants || 0} / {event.maxParticipants}{" "}
                      participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiMapPin className="text-teal-400 w-4 h-4" />
                    <span className="truncate">
                      {event.venue || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {(event.status === "Pending" ||
                    event.status === "Rejected") && (
                    <button
                      onClick={() => handleApprove(event._id)}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold transition disabled:opacity-50"
                    >
                      <FiCheck className="inline mr-1" /> Approve
                    </button>
                  )}
                  {(event.status === "Pending" ||
                    event.status === "Approved") && (
                    <button
                      onClick={() => handleReject(event._id)}
                      disabled={processing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition disabled:opacity-50"
                    >
                      <FiX className="inline mr-1" /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900">
                    <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                      Event Name
                    </th>
                    <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                      Date
                    </th>
                    <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                      Participants
                    </th>
                    <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event._id}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                    >
                      <td className="py-4 px-6 text-white font-medium">
                        {event.title}
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : "TBD"}
                      </td>
                      <td className="py-4 px-6">
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
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {event.currentParticipants || 0} /{" "}
                        {event.maxParticipants}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {(event.status === "Pending" ||
                            event.status === "Rejected") && (
                            <button
                              onClick={() => handleApprove(event._id)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {(event.status === "Pending" ||
                            event.status === "Approved") && (
                            <button
                              onClick={() => handleReject(event._id)}
                              disabled={processing}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEventsPage;
