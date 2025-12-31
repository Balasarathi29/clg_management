import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiSearch,
  FiMapPin,
  FiEye,
} from "react-icons/fi";
import API_URL from "../../config/api";

const EventListPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const isAdmin = userRole === "admin";

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, events]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Events fetched:", res.data);
      setEvents(res.data || []);
      setFilteredEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.Department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === "upcoming") {
      filtered = filtered.filter((e) => new Date(e.date) >= new Date());
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((e) => new Date(e.date) < new Date());
    }

    setFilteredEvents(filtered);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event deleted successfully!");
      fetchEvents();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const handleViewDetails = (event) => {
    navigate(`/events/${event._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <FiCalendar className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Events Management
                </h1>
                <p className="text-gray-400 mt-1">
                  {isAdmin
                    ? "Create and manage all events"
                    : "View and manage your events"}
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate("/events/new")}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <FiPlus className="text-xl" />
                Create Event
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <p className="text-purple-300 text-sm font-medium">Total Events</p>
            <p className="text-white text-3xl font-bold mt-1">
              {events.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <p className="text-green-300 text-sm font-medium">Upcoming</p>
            <p className="text-white text-3xl font-bold mt-1">
              {events.filter((e) => new Date(e.date) >= new Date()).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
            <p className="text-gray-300 text-sm font-medium">Completed</p>
            <p className="text-white text-3xl font-bold mt-1">
              {events.filter((e) => new Date(e.date) < new Date()).length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all min-w-[200px]"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <FiCalendar className="text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {events.length === 0 ? "No events yet" : "No events found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {events.length === 0
                ? isAdmin
                  ? "Create your first event to get started"
                  : "No events available at the moment"
                : "Try adjusting your search or filter"}
            </p>
            {events.length === 0 && isAdmin && (
              <button
                onClick={() => navigate("/events/new")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
              >
                <FiPlus />
                Create First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-teal-500/50 transition-all group"
              >
                <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 p-6 border-b border-gray-700/50">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        new Date(event.date) >= new Date()
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {new Date(event.date) >= new Date()
                        ? "Upcoming"
                        : "Completed"}
                    </span>

                    {/* Action Buttons based on role */}
                    <div className="flex gap-2">
                      {/* View Details Button - Always shown */}
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="p-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-all"
                        title="View Details"
                      >
                        <FiEye />
                      </button>

                      {/* Edit and Delete - Only for Admin */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/edit/${event._id}`);
                            }}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event._id, event.title);
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3
                    onClick={() => handleViewDetails(event)}
                    className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {event.title}
                  </h3>
                </div>

                <div className="p-6 space-y-3">
                  {event.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiCalendar className="text-teal-400" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiMapPin className="text-teal-400" />
                      <span className="text-sm line-clamp-1">
                        {event.location}
                      </span>
                    </div>
                  )}
                  {event.Department && (
                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-2">
                      <p className="text-teal-400 text-xs font-semibold">
                        {event.Department}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListPage;
