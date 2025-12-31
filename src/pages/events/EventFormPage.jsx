import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft } from "react-icons/fi";

const EventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    maxParticipants: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState([
    { id: 1, name: "Computer Science" },
    { id: 2, name: "Electrical Engineering" },
    { id: 3, name: "Mechanical Engineering" },
    { id: 4, name: "Civil Engineering" },
    { id: 5, name: "Information Technology" },
    { id: 6, name: "Electronics & Communication" },
    { id: 7, name: "Business Administration" },
    { id: 8, name: "Humanities" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get user info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const isAdmin = userRole === "admin";
  const userDepartment = user.Department;

  useEffect(() => {
    fetchDepartments();
    if (isEdit) {
      fetchEvent();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
      // Use fallback departments if API fails
      setDepartments([
        { id: 1, name: "Computer Science" },
        { id: 2, name: "Electrical Engineering" },
        { id: 3, name: "Mechanical Engineering" },
        { id: 4, name: "Civil Engineering" },
        { id: 5, name: "Information Technology" },
        { id: 6, name: "Electronics & Communication" },
        { id: 7, name: "Business Administration" },
        { id: 8, name: "Humanities" },
      ]);
    }
  };

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // For faculty, set their department automatically
      setFormData({
        ...res.data,
        Department: isAdmin ? res.data.Department : userDepartment,
      });
    } catch (err) {
      console.error("Failed to fetch event", err);
      setError("Failed to load event data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      // For faculty, always use their department
      const eventData = {
        ...formData,
        Department: isAdmin ? formData.Department : userDepartment,
        location: formData.venue,
        createdBy: user._id,
      };
      const res = isEdit
        ? await axios.put(`http://localhost:5000/api/events/${id}`, eventData, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(`http://localhost:5000/api/events`, eventData, {
            headers: { Authorization: `Bearer ${token}` },
          });
      alert(
        res.data.message ||
          `Event ${isEdit ? "updated" : "created"} successfully!`
      );
      navigate("/events");
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">
          {isEdit ? "Edit Event" : "Create New Event"}
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="e.g., Tech Fest 2024"
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                placeholder="Detailed description of the event..."
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  required
                  placeholder="e.g., Main Auditorium"
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: e.target.value,
                    })
                  }
                  required
                  min="1"
                  placeholder="100"
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Department Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department <span className="text-red-400">*</span>
              </label>
              {isAdmin ? (
                <select
                  value={formData.Department}
                  onChange={(e) =>
                    setFormData({ ...formData, Department: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">
                    Electrical Engineering
                  </option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Electronics & Communication">
                    Electronics & Communication
                  </option>
                </select>
              ) : (
                <div className="w-full px-4 py-3 bg-gray-700/30 text-gray-300 border border-gray-600/50 rounded-xl flex items-center justify-between">
                  <span className="font-medium">{userDepartment}</span>
                  <span className="text-xs bg-gray-600/50 px-3 py-1 rounded-full">
                    Your Department
                  </span>
                </div>
              )}
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Faculty can only create events in their assigned department
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center disabled:opacity-50"
            >
              <FiSave />{" "}
              {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;
