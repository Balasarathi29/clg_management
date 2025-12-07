import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiCheckSquare,
  FiBriefcase,
  FiX,
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingApprovals: 0,
    departments: 6,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [hodActivities, setHodActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch events
      const eventsRes = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const events = eventsRes.data || [];

      // Fetch users
      const usersRes = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const users = usersRes.data || [];

      setStats({
        totalUsers: users.length,
        totalEvents: events.length,
        pendingApprovals: events.filter((e) => e.status === "Pending").length,
        departments: 6,
      });

      setRecentEvents(events.slice(0, 5));

      // Generate HOD activity log
      const hodActivityLog = events
        .filter((e) => e.status === "Approved" || e.status === "Rejected")
        .map((event) => ({
          id: event._id,
          action:
            event.status === "Approved" ? "Approved Event" : "Rejected Event",
          eventTitle: event.title,
          department: event.departmentName || event.departmentId,
          timestamp: event.updatedAt || event.createdAt,
          status: event.status,
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      setHodActivities(hodActivityLog);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={stats.totalUsers}
          color="text-blue-400"
        />
        <StatCard
          icon={FiCalendar}
          title="Total Events"
          value={stats.totalEvents}
          color="text-teal-400"
        />
        <StatCard
          icon={FiCheckSquare}
          title="Pending Approvals"
          value={stats.pendingApprovals}
          color="text-yellow-400"
        />
        <StatCard
          icon={FiBriefcase}
          title="Departments"
          value={stats.departments}
          color="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Events</h2>
            <Link
              to="/events"
              className="text-teal-400 hover:text-teal-300 text-sm"
            >
              View All →
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No events yet</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event._id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{event.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
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
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{event.departmentName || event.departmentId}</span>
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent HOD Activities */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">HOD Activities</h2>
            <span className="text-gray-400 text-sm">Recent Approvals</span>
          </div>

          {hodActivities.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No HOD activity yet
            </p>
          ) : (
            <div className="space-y-3">
              {hodActivities.map((activity) => (
                <div key={activity.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {activity.status === "Approved" ? (
                        <FiCheckSquare className="text-green-400 w-4 h-4 flex-shrink-0" />
                      ) : (
                        <FiX className="text-red-400 w-4 h-4 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          activity.status === "Approved"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {activity.action}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1 ml-6">
                    {activity.eventTitle}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400 ml-6">
                    <span>{activity.department}</span>
                    <span>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
