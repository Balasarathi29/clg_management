import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const DepartmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hodUsers, setHodUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    hodId: "",
  });

  useEffect(() => {
    fetchHODUsers();
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const fetchHODUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/users?role=hod",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHodUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch HOD users", err);
    }
  };

  const fetchDepartment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://clg-managemt-backend.onrender.com/api/departments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch department", err);
      setError("Failed to load department details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (id) {
        // Update existing department
        await axios.put(
          `https://clg-managemt-backend.onrender.com/api/departments/${id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Department updated successfully!");
      } else {
        // Create new department
        await axios.post(
          "https://clg-managemt-backend.onrender.com/api/departments",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Department created successfully!");
      }

      navigate("/departments");
    } catch (err) {
      console.error("Save department error:", err);
      setError(err.response?.data?.message || "Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          {id ? "Edit Department" : "Create Department"}
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-blue-900/30 border border-blue-500 p-4 rounded-lg mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ You must assign a HOD to create a department.{" "}
            {id ? "You can change the HOD assignment here." : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Department Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Department Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
              placeholder="e.g., CS"
              maxLength={10}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Assign HOD *
            </label>
            <select
              value={formData.hodId}
              onChange={(e) =>
                setFormData({ ...formData, hodId: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="">Select HOD</option>
              {hodUsers.map((hod) => (
                <option key={hod._id} value={hod._id}>
                  {hod.First_name} {hod.Last_name} ({hod.Email})
                </option>
              ))}
            </select>
            {hodUsers.length === 0 && (
              <p className="text-yellow-300 text-xs mt-1">
                No HOD accounts available. Create HOD accounts first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Brief description of the department"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || hodUsers.length === 0}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : id
                ? "Update Department"
                : "Create Department"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/departments")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentFormPage;
