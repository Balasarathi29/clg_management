import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiActivity,
  FiEye,
  FiMapPin,
} from "react-icons/fi";
import API_URL from "../../config/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalParticipations: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [eventsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const events = eventsRes.data;
      const now = new Date();

      setStats({
        totalUsers: usersRes.data.length,
        totalEvents: events.length,
        upcomingEvents: events.filter((e) => new Date(e.date) >= now).length,
        completedEvents: events.filter((e) => new Date(e.date) < now).length,
        totalParticipations: events.reduce(
          (sum, e) => sum + (e.participants || 0),
          0
        ),
      });

      setRecentEvents(events.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <FiUsers className="text-blue-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.totalUsers}
            </h3>
            <p className="text-blue-300 text-sm">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <FiCalendar className="text-purple-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                All
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.totalEvents}
            </h3>
            <p className="text-purple-300 text-sm">Total Events</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <FiTrendingUp className="text-teal-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full">
                Upcoming
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.upcomingEvents}
            </h3>
            <p className="text-teal-300 text-sm">Upcoming Events</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <FiAward className="text-amber-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.totalParticipations}
            </h3>
            <p className="text-amber-300 text-sm">Participations</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiActivity className="text-teal-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Recent Events</h2>
              </div>
              <button
                onClick={() => navigate("/events")}
                className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
              >
                View All Events →
              </button>
            </div>
          </div>

          <div className="p-6">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="text-gray-600 text-5xl mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No events yet</p>
                <button
                  onClick={() => navigate("/events/new")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                >
                  <FiCalendar />
                  Create First Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <div
                    key={event._id || index}
                    onClick={() => handleViewEvent(event._id)}
                    className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-teal-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-2 group-hover:text-teal-400 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <FiCalendar className="text-teal-400 flex-shrink-0" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {event.location && (
                            <span className="text-gray-400 flex items-center gap-1">
                              <FiMapPin className="text-teal-400 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </span>
                          )}
                          {event.Department && (
                            <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-semibold">
                              {event.Department}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            new Date(event.date) >= new Date()
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          {new Date(event.date) >= new Date()
                            ? "Upcoming"
                            : "Completed"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(event._id);
                          }}
                          className="p-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
