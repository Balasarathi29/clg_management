import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiUserPlus } from "react-icons/fi";
import API_URL from "../../config/api";

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Program: "",
    DOB: "",
    role: "student",
    Password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      // Check authentication first
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      console.log("Token exists:", !!token);
      console.log("User exists:", !!user);
      console.log("Is Edit mode:", isEdit);
      console.log("User ID:", id);

      if (!token || !user) {
        console.log("No token or user found, redirecting to login");
        alert("Please login first");
        navigate("/login");
        return;
      }

      // Parse user and check role
      try {
        const userData = JSON.parse(user);
        console.log("User role:", userData.role);

        if (userData.role !== "admin") {
          alert("Only admin can access this page");
          navigate("/dashboard");
          return;
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
        navigate("/login");
        return;
      }

      if (isEdit && id) {
        await fetchUser();
      }
    };

    checkAuthAndFetchUser();
  }, [id, isEdit, navigate]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      console.log("Fetching user with ID:", id);
      console.log("Using API URL:", `${API_URL}/api/users/${id}`);

      const res = await axios.get(`${API_URL}/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("User data received:", res.data);

      setFormData({
        First_name: res.data.First_name || "",
        Last_name: res.data.Last_name || "",
        Email: res.data.Email || "",
        Department: res.data.Department || "",
        role: res.data.role || "hod",
        Password: "",
      });

      setError("");
    } catch (err) {
      console.error("Failed to fetch user:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("User not found");
        setTimeout(() => navigate("/users"), 2000);
      } else {
        setError(
          "Failed to load user data: " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const adminId = tokenData.id;

      let userData = {
        First_name: formData.First_name,
        Last_name: formData.Last_name,
        Email: formData.Email,
        Department: formData.Department,
        adminId: adminId,
      };
      // Only include password if it's provided
      if (formData.Password && formData.Password.trim() !== "") {
        userData.Password = formData.Password;
      }

      let res;
      if (isEdit) {
        // For editing, allow role to be updated
        userData.role = formData.role;
        res = await axios.put(`${API_URL}/api/users/${id}`, userData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // For HOD creation, use correct endpoint and do not send role
        res = await axios.post(`${API_URL}/api/users/create-hod`, userData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      console.log(isEdit ? "User updated:" : "HOD created:", res.data);
      alert(
        res.data.message ||
          `User ${isEdit ? "updated" : "created"} successfully!`
      );
      navigate("/users");
    } catch (err) {
      console.error(isEdit ? "Update error:" : "Create HOD error:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          `Failed to ${isEdit ? "update user" : "create HOD account"}`;
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/users")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Users</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
              <FiUserPlus className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEdit ? "Edit User" : "Create HOD Account"}
              </h1>
              <p className="text-gray-400 mt-1">
                Head of Department manages faculty in their department
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
                Admin can create HOD accounts. HODs can then create faculty
                accounts in their department.
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.First_name}
                  onChange={(e) =>
                    setFormData({ ...formData, First_name: e.target.value })
                  }
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, Last_name: e.target.value })
                  }
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                required
                placeholder="hod.dept@college.edu"
                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department <span className="text-red-400">*</span>
              </label>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <div className="w-full px-4 py-3 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-xl font-semibold">
                HOD (Head of Department)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password {!isEdit && <span className="text-red-400">*</span>}
              </label>
              <input
                type="password"
                value={formData.Password}
                onChange={(e) =>
                  setFormData({ ...formData, Password: e.target.value })
                }
                required={!isEdit}
                minLength={6}
                placeholder={
                  isEdit
                    ? "Leave blank to keep current password"
                    : "Minimum 6 characters"
                }
                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isEdit
                  ? "Leave blank to keep current password"
                  : "Minimum 6 characters required"}
              </p>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="text-lg" />
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update User"
                  : "Create HOD Account"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/users")}
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

export default UserFormPage;
