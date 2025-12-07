import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft } from "react-icons/fi";

const TaskFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventId: "",
    assignedTo: "",
    dueDate: "",
    status: "Pending",
  });
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchVolunteers();
    if (isEdit) {
      fetchTask();
    }
  }, [id]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data || []);
      console.log("Events loaded:", res.data?.length || 0);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/users?role=student",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVolunteers(res.data || []);
      console.log("Volunteers loaded:", res.data?.length || 0);
    } catch (err) {
      console.error("Failed to fetch volunteers", err);
      setVolunteers([]);
    }
  };

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const taskData = res.data;
      setFormData({
        title: taskData.title || "",
        description: taskData.description || "",
        eventId: taskData.eventId || "",
        assignedTo: taskData.assignedTo || "",
        dueDate: taskData.dueDate?.split("T")[0] || "",
        status: taskData.status || "Pending",
      });
    } catch (err) {
      console.error("Failed to fetch task", err);
      setError("Failed to load task data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.eventId ||
      !formData.assignedTo ||
      !formData.dueDate
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `http://localhost:5000/api/tasks/${id}`
        : "http://localhost:5000/api/tasks";
      const method = isEdit ? "put" : "post";

      console.log("Submitting task:", formData);

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Task saved:", response.data);
      navigate("/tasks");
    } catch (err) {
      console.error("Task save error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to save task";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/tasks")}
          className="text-teal-400 hover:text-teal-300 flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Tasks
        </button>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">
          {isEdit ? "Edit Task" : "Create New Task"}
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
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="e.g., Setup Registration Desk"
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
                placeholder="Detailed description of the task..."
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Event *
              </label>
              <select
                value={formData.eventId}
                onChange={(e) =>
                  setFormData({ ...formData, eventId: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
              {events.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  No events found. Please create an event first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Assign To *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              >
                <option value="">Select Volunteer</option>
                {volunteers.map((volunteer) => (
                  <option key={volunteer._id} value={volunteer._id}>
                    {volunteer.First_name} {volunteer.Last_name} (
                    {volunteer.Email})
                  </option>
                ))}
              </select>
              {volunteers.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  No students found. Students need to register first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={
                loading || events.length === 0 || volunteers.length === 0
              }
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave />{" "}
              {loading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormPage;
