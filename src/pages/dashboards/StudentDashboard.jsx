import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiBriefcase,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    registeredEvents: 0,
    completedTasks: 0,
    certificates: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();

    // Listen for registration changes
    const handleStorageChange = () => {
      console.log("Event registration changed, refreshing dashboard...");
      fetchDashboardData();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also refresh when window gains focus (user returns from another page)
    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch registered events
      const participationRes = await axios.get(
        `http://localhost:5000/api/participation/student/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const registrations = participationRes.data || [];

      // Fetch full event details for registered events
      const eventsRes = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = eventsRes.data || [];

      // Filter to get only events the student is registered for
      const myEventIds = registrations.map((r) => r.eventId);
      const myFullEvents = allEvents.filter((e) => myEventIds.includes(e._id));

      // Count upcoming events (future events that are approved and registered)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = myFullEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today && event.status === "Approved";
      });

      // Fetch my tasks
      const tasksRes = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allTasks = tasksRes.data || [];
      const myTasks = allTasks.filter(
        (task) =>
          task.assignedTo === user.id ||
          task.assignedToName?.includes(`${user.First_name} ${user.Last_name}`)
      );

      setStats({
        registeredEvents: registrations.length,
        upcomingEvents: upcomingEvents.length,
        myTasks: myTasks.length,
        completedTasks: myTasks.filter((t) => t.status === "Completed").length,
      });

      setRecentEvents(registrations.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: IconComponent, title, value, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <IconComponent className={`w-12 h-12 ${color}`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
        Student Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={FiCalendar}
          title="Registered Events"
          value={stats.registeredEvents}
          color="text-teal-400"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Upcoming Events"
          value={stats.upcomingEvents}
          color="text-blue-400"
        />
        <StatCard
          icon={FiBriefcase}
          title="My Tasks"
          value={stats.myTasks}
          color="text-purple-400"
        />
        <StatCard
          icon={FiUsers}
          title="Completed Tasks"
          value={stats.completedTasks}
          color="text-green-400"
        />
      </div>

      {/* My Registered Events */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">My Registered Events</h2>
          <Link
            to="/my-events"
            className="text-teal-400 hover:text-teal-300 text-sm"
          >
            View All →
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              You haven't registered for any events yet
            </p>
            <Link
              to="/events"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((participation) => (
              <div
                key={participation._id}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-white font-semibold">
                    {participation.eventTitle}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Registered:{" "}
                    {new Date(participation.registeredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      participation.status === "Attended"
                        ? "bg-green-900/50 text-green-300"
                        : participation.status === "Registered"
                        ? "bg-blue-900/50 text-blue-300"
                        : "bg-red-900/50 text-red-300"
                    }`}
                  >
                    {participation.status}
                  </span>
                  <Link
                    to={`/events/${participation.eventId}`}
                    className="text-teal-400 hover:text-teal-300 text-sm font-semibold"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
