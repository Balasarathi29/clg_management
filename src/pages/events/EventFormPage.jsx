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

  useEffect(() => {
    fetchDepartments();
    if (isEdit) {
      fetchEvent();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/departments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const res = await axios.get(
        `https://clg-managemt-backend.onrender.com/api/events/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const eventData = res.data;
      setFormData({
        ...eventData,
        date: eventData.date?.split("T")[0] || "",
        time: eventData.time || "",
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

    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time ||
      !formData.venue ||
      !formData.maxParticipants ||
      !formData.departmentId
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Find department name from departments array
      const selectedDept = departments.find(
        (d) => d.id === formData.departmentId
      );

      const eventData = {
        ...formData,
        createdBy: user.id,
        createdByName: `${user.First_name} ${user.Last_name}`,
        departmentName: selectedDept?.name || formData.departmentId,
        Department: selectedDept?.name || formData.departmentId, // Add this field too
      };

      console.log("Submitting event with data:", eventData);

      const url = isEdit
        ? `https://clg-managemt-backend.onrender.com/api/events/${id}`
        : "https://clg-managemt-backend.onrender.com/api/events";

      const method = isEdit ? "put" : "post";

      const response = await axios[method](url, eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Event saved:", response.data);
      navigate("/events");
    } catch (err) {
      console.error("Event save error:", err);
      console.error("Error response:", err.response?.data);
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

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Department *
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
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
