import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiMapPin, FiClock } from "react-icons/fi";

const MyEventsPage = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/participation/student/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch my events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (participationId) => {
    if (!window.confirm("Are you sure you want to unregister from this event?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/participation/${participationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Successfully unregistered!");
      fetchMyEvents(); // Refresh list
    } catch (err) {
      console.error("Failed to unregister", err);
      alert("Failed to unregister");
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">My Registered Events</h1>

      {myEvents.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            You haven't registered for any events yet
          </p>
          <button
            onClick={() => navigate("/events")}
            className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map((participation) => (
            <div
              key={participation._id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">
                  {participation.eventTitle}
                </h3>
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
              </div>

              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-teal-400" />
                  Registered:{" "}
                  {new Date(participation.registeredAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/events/${participation.eventId}`)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  View Details
                </button>
                {participation.status === "Registered" && (
                  <button
                    onClick={() => handleUnregister(participation._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Unregister
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
