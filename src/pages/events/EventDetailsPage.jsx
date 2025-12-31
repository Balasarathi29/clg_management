import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiClock,
} from "react-icons/fi";
import API_URL from "../../config/api";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(res.data);
    } catch (err) {
      console.error("Failed to fetch event details", err);
      alert("Failed to load event details");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event deleted successfully!");
      navigate("/events");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) return null;

  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Events</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    isUpcoming
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {isUpcoming ? "Upcoming Event" : "Past Event"}
                </span>
                {event.Department && (
                  <span className="px-4 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl text-sm font-semibold">
                    {event.Department}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {event.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/events/edit/${id}`)}
                className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all"
              >
                <FiEdit2 className="text-xl" />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all"
              >
                <FiTrash2 className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Event Details Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <FiCalendar className="text-teal-400 text-2xl" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-semibold">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {event.time && (
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <FiClock className="text-purple-400 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Time</p>
                  <p className="text-white font-semibold">{event.time}</p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <FiMapPin className="text-blue-400 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold">{event.location}</p>
                </div>
              </div>
            )}

            {event.participants !== undefined && (
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                <div className="bg-amber-500/20 p-3 rounded-xl">
                  <FiUsers className="text-amber-400 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Participants</p>
                  <p className="text-white font-semibold">
                    {event.participants || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Additional Info */}
          {(event.createdAt || event.updatedAt) && (
            <div className="p-6 bg-gray-900/30 border-t border-gray-700/50">
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                {event.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                )}
                {event.updatedAt && (
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {new Date(event.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
