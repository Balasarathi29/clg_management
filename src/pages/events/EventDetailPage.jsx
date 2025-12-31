import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiClock,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [participationId, setParticipationId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchEvent();
    if (user.role === "student") {
      checkRegistration();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(res.data);
    } catch (err) {
      console.error("Failed to fetch event", err);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/participation/student/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const participation = res.data.find((p) => p.eventId === id);
      if (participation) {
        setIsRegistered(true);
        setParticipationId(participation._id);
      }
    } catch (err) {
      console.error("Failed to check registration", err);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/participation/register",
        { eventId: id, studentId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Trigger storage event to notify dashboard
      window.dispatchEvent(new Event("storage"));

      alert("Successfully registered for event!");
      setIsRegistered(true);
      fetchEvent();
      checkRegistration();
    } catch (err) {
      console.error("Registration failed", err);
      alert(err.response?.data?.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Are you sure you want to unregister from this event?"))
      return;

    setRegistering(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/participation/${participationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Trigger storage event to notify dashboard
      window.dispatchEvent(new Event("storage"));

      alert("Successfully unregistered from event!");
      setIsRegistered(false);
      setParticipationId(null);
      fetchEvent();
    } catch (err) {
      console.error("Unregistration failed", err);
      alert(err.response?.data?.message || "Failed to unregister");
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event deleted successfully");
      navigate("/events");
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Event not found</div>
      </div>
    );
  }

  const canEdit = user.role === "faculty" || user.role === "admin";
  const isOwner =
    event.createdBy === user._id ||
    event.createdBy === user.id ||
    (event.createdBy && event.createdBy._id === user._id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/events")}
          className="text-teal-400 hover:text-teal-300 flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Events
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {event.title}
              </h1>
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

            {/* Edit/Delete buttons for faculty/admin */}
            {canEdit && isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/events/${id}/attendance`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiUsers /> Attendance
                </button>
                <button
                  onClick={() => navigate(`/events/${id}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <FiTrash2 /> {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3 text-gray-300">
              <FiCalendar className="text-teal-400 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-semibold">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <FiClock className="text-teal-400 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="font-semibold">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <FiMapPin className="text-teal-400 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-400">Venue</p>
                <p className="font-semibold">{event.venue || event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <FiUsers className="text-teal-400 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-400">Participants</p>
                <p className="font-semibold">
                  {typeof event.currentParticipants === "number"
                    ? event.currentParticipants
                    : event.participants || 0}
                  {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
            <p className="text-gray-300">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-400">Department</p>
              <p className="text-white font-semibold">
                {event.departmentName ||
                  event.Department ||
                  event.departmentId ||
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Created By</p>
              <p className="text-white font-semibold">
                {event.createdByName ||
                  (event.createdBy && event.createdBy.First_name
                    ? `${event.createdBy.First_name} ${event.createdBy.Last_name}`
                    : event.createdBy && event.createdBy.Email
                    ? event.createdBy.Email
                    : "Unknown")}
              </p>
            </div>
          </div>

          {/* Student Registration Section */}
          {user.role === "student" && event.status === "Approved" && (
            <div className="border-t border-gray-700 pt-6">
              {!isRegistered ? (
                <div className="bg-teal-900/20 border border-teal-500 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Register for this event
                      </h4>
                      <p className="text-sm text-gray-400">
                        {event.currentParticipants >= event.maxParticipants
                          ? "Event is full"
                          : `${
                              event.maxParticipants - event.currentParticipants
                            } spots remaining`}
                      </p>
                    </div>
                    <button
                      onClick={handleRegister}
                      disabled={
                        registering ||
                        event.currentParticipants >= event.maxParticipants
                      }
                      className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {registering ? "Registering..." : "📝 Register Now"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">
                          You're registered!
                        </h4>
                        <p className="text-sm text-gray-400">
                          You've successfully registered for this event
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleUnregister}
                      disabled={registering}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {registering ? "Processing..." : "Cancel Registration"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message for pending events */}
          {user.role === "student" && event.status === "Pending" && (
            <div className="border-t border-gray-700 pt-6">
              <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⏳ This event is pending approval. Registration will open once
                  approved.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
