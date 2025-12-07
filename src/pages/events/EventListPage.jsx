import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiCalendar, FiMapPin, FiUsers, FiEye, FiFilter } from "react-icons/fi";

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, events]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = res.data || [];

      // Filter events based on user role
      let filteredEvents = allEvents;

      if (user.role === "faculty") {
        // Faculty only sees their own events
        filteredEvents = allEvents.filter(
          (e) =>
            e.createdBy === user.id ||
            e.createdByName?.includes(`${user.First_name} ${user.Last_name}`)
        );
      }

      setEvents(filteredEvents);
      setFilteredEvents(filteredEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filters.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          e.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Events</h1>
        {(user.role === "faculty" || user.role === "admin") && (
          <Link
            to="/create-event"
            className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center"
          >
            <FiCalendar /> Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-teal-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Search events..."
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No events found
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
              onClick={() => navigate(`/events/${event._id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    event.status === "Approved"
                      ? "bg-green-900/50 text-green-300"
                      : event.status === "Pending"
                      ? "bg-yellow-900/50 text-yellow-300"
                      : event.status === "Completed"
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-red-900/50 text-red-300"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="font-semibold">Date:</span>{" "}
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "TBD"}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Venue:</span> {event.venue}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Participants:</span>{" "}
                  {event.currentParticipants || 0} / {event.maxParticipants}
                </p>
              </div>

              <button
                className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/events/${event._id}`);
                }}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventListPage;
