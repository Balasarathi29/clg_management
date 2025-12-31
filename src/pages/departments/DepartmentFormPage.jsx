import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiUsers } from "react-icons/fi";
import API_URL from "../../config/api";

const DepartmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    hodId: "",
  });
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHODUsers();
    if (isEdit) {
      fetchDepartment();
    }
  }, [id]);

  const fetchHODUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/users?role=hod`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHods(res.data);
    } catch (err) {
      console.error("Failed to fetch HOD users", err);
    }
  };

  const fetchDepartment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch department", err);
      setError("Failed to load department data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `${API_URL}/api/departments/${id}`
        : `${API_URL}/api/departments`;
      const method = isEdit ? "put" : "post";

      const res = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert(
        res.data.message ||
          `Department ${isEdit ? "updated" : "created"} successfully!`
      );
      navigate("/departments");
    } catch (err) {
      console.error("Save department error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save department";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/departments")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Departments</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
              <FiUsers className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEdit ? "Edit Department" : "Create New Department"}
              </h1>
              <p className="text-gray-400 mt-1">
                {isEdit
                  ? "Update department information"
                  : "Add a new department with HOD assignment"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-b border-blue-500/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-blue-300 text-sm">
                Each department must have a Head of Department (HOD) assigned.
              </p>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-900/30 border border-red-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  placeholder="e.g., CS"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all uppercase"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Brief description of the department..."
                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* HOD Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Head of Department (HOD) <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.hodId}
                onChange={(e) =>
                  setFormData({ ...formData, hodId: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Select Head of Department --</option>
                {hods.map((hod) => (
                  <option key={hod._id} value={hod._id}>
                    {hod.First_name} {hod.Last_name} • {hod.Email}
                  </option>
                ))}
              </select>
              {hods.length === 0 && (
                <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>
                    No HODs available. Please create HOD accounts first.
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="text-lg" />
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update Department"
                  : "Create Department"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/departments")}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentFormPage;
