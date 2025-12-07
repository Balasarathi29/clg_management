import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiBriefcase, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allTasks = res.data || [];
      console.log("All tasks fetched:", allTasks.length);

      // Filter tasks based on user role
      let filteredTasks = allTasks;

      if (user.role === "student") {
        // Students only see tasks assigned to them
        filteredTasks = allTasks.filter(
          (task) =>
            task.assignedTo === user.id ||
            task.assignedToName?.includes(
              `${user.First_name} ${user.Last_name}`
            )
        );
        console.log("Student tasks filtered:", filteredTasks.length);
      }

      setTasks(filteredTasks);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://clg-managemt-backend.onrender.com/api/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Task deleted successfully");
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://clg-managemt-backend.onrender.com/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Failed to update task status", err);
      alert("Failed to update task status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          {user.role === "faculty" ? "Manage Tasks" : "My Tasks"}
        </h1>
        {user.role === "faculty" && (
          <Link
            to="/tasks/create"
            className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FiPlus /> Create New Task
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <FiBriefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No tasks found</p>
          {user.role === "faculty" && (
            <Link
              to="/tasks/create"
              className="inline-block mt-4 bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
            >
              Create First Task
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{task.title}</h3>
                {user.role === "faculty" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/tasks/${task._id}/edit`)}
                      className="text-blue-400 hover:text-blue-300 transition"
                      title="Edit Task"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Delete Task"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {task.description}
              </p>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-gray-300">
                  <span className="font-semibold">Event:</span>{" "}
                  {task.eventTitle || "Not Assigned"}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Assigned to:</span>{" "}
                  {task.assignedToName || "Not Assigned"}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Due Date:</span>{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                    task.status === "Completed"
                      ? "bg-green-900/50 text-green-300"
                      : task.status === "In Progress"
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-yellow-900/50 text-yellow-300"
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskListPage;
