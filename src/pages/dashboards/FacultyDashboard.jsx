import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
} from "react-icons/fi";

const FacultyDashboard = () => {
  const [stats, setStats] = useState({
    myEvents: 0,
    totalParticipants: 0,
    pendingTasks: 0,
    completedEvents: 0,
  });
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Fetch events created by this faculty
      const eventsRes = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allEvents = eventsRes.data || [];

      // Filter events created by current faculty user
      const myEventsFiltered = allEvents.filter(
        (e) =>
          e.createdBy === user.id ||
          e.createdByName?.includes(`${user.First_name} ${user.Last_name}`)
      );

      // Fetch tasks for stats
      const tasksRes = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allTasks = tasksRes.data || [];
      const myTasks = allTasks.filter((t) =>
        myEventsFiltered.some((e) => e._id === t.eventId)
      );

      setMyEvents(myEventsFiltered);

      // Calculate real stats
      setStats({
        myEvents: myEventsFiltered.length,
        totalParticipants: myEventsFiltered.reduce(
          (sum, e) => sum + (e.currentParticipants || 0),
          0
        ),
        pendingTasks: myTasks.filter((t) => t.status === "Pending").length,
        completedEvents: myEventsFiltered.filter(
          (e) => e.status === "Completed"
        ).length,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setMyEvents([]);
      setStats({
        myEvents: 0,
        totalParticipants: 0,
        pendingTasks: 0,
        completedEvents: 0,
      });
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your events, tasks, and attendance
          </p>
        </div>
        <Link
          to="/create-event"
          className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition text-center whitespace-nowrap"
        >
          + Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={FiCalendar}
          title="My Events"
          value={stats.myEvents}
          color="text-blue-400"
        />
        <StatCard
          icon={FiUsers}
          title="Total Participants"
          value={stats.totalParticipants}
          color="text-green-400"
        />
        <StatCard
          icon={FiBriefcase}
          title="Pending Tasks"
          value={stats.pendingTasks}
          color="text-yellow-400"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Completed Events"
          value={stats.completedEvents}
          color="text-purple-400"
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">My Events</h2>
          <Link
            to="/events"
            className="text-teal-400 hover:text-teal-300 text-sm font-semibold"
          >
            View All Events →
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No events created yet</p>
            <Link
              to="/create-event"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
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
                    Status
                  </th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => (
                  <tr
                    key={event._id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <td className="py-4 px-4 text-white font-medium">
                      {event.title}
                    </td>
                    <td className="py-4 px-4 text-gray-400 hidden sm:table-cell">
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "TBD"}
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
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
                    <td className="py-4 px-4">
                      <Link
                        to={`/events/${event._id}`}
                        className="text-teal-400 hover:text-teal-300 text-sm font-semibold transition"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
