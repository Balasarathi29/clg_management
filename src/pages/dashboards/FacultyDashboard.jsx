import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import API_URL from "../../config/api";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalTasks: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`${API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const events = res.data || [];
      const now = new Date();

      setStats({
        totalEvents: events.length,
        upcomingEvents: events.filter((e) => new Date(e.date) >= now).length,
        completedEvents: events.filter((e) => new Date(e.date) < now).length,
        totalTasks: 0,
      });

      setRecentEvents(events.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: IconComponent, title, value, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <IconComponent className={`w-8 h-8 ${color}`} />
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 max-w-md">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-slate-400">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <FiCalendar className="text-blue-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.totalEvents}
            </h3>
            <p className="text-blue-300 text-sm">Total Events</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <FiClock className="text-teal-400 text-2xl" />
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

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <FiCheckSquare className="text-purple-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                Done
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.completedEvents}
            </h3>
            <p className="text-purple-300 text-sm">Completed Events</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <FiTrendingUp className="text-amber-400 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full">
                Tasks
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.totalTasks}
            </h3>
            <p className="text-amber-300 text-sm">Assigned Tasks</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-900/30 via-slate-800/50 to-purple-900/30 px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white">Recent Events</h2>
            <p className="text-slate-400 text-sm mt-1">
              Your latest event assignments
            </p>
          </div>

          <div className="p-6">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="text-slate-600 text-5xl mx-auto mb-4" />
                <p className="text-slate-400">No events available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-slate-400 flex items-center gap-1">
                            <FiCalendar className="text-indigo-400" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          {event.location && (
                            <span className="text-slate-400">
                              📍 {event.location}
                            </span>
                          )}
                          {event.Department && (
                            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs">
                              {event.Department}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          new Date(event.date) >= new Date()
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {new Date(event.date) >= new Date()
                          ? "Upcoming"
                          : "Completed"}
                      </span>
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

export default FacultyDashboard;
