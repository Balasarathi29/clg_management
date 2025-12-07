import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft } from "react-icons/fi";

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
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://clg-managemt-backend.onrender.com/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFormData({ ...res.data, Password: "" });
    } catch (err) {
      console.error("Failed to fetch user", err);
      setError("Failed to load user data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const userData = {
        First_name: formData.First_name,
        Last_name: formData.Last_name,
        Email: formData.Email,
        Password: formData.Password,
        Department: formData.Department,
      };

      console.log("Creating HOD account:", userData);

      const res = await axios.post(
        "https://clg-managemt-backend.onrender.com/api/users/create",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("HOD created successfully:", res.data);
      alert(res.data.message || "HOD account created successfully!");
      navigate("/users");
    } catch (err) {
      console.error("Create HOD error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create HOD account";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          {isEdit ? "Edit User" : "Create HOD Account"}
        </h1>

        <div className="bg-blue-900/30 border border-blue-500 p-4 rounded-lg mb-6">
          <p className="text-blue-300 text-sm">
            ℹ️ Admin can only create HOD accounts. Students register themselves
            via signup page.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.First_name}
                onChange={(e) =>
                  setFormData({ ...formData, First_name: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.Last_name}
                onChange={(e) =>
                  setFormData({ ...formData, Last_name: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
              required
              placeholder="hod.dept@college.edu"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Department *
            </label>
            <select
              value={formData.Department}
              onChange={(e) =>
                setFormData({ ...formData, Department: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
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
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Role *
            </label>
            <div className="w-full px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-lg">
              HOD (Head of Department)
            </div>
            <input type="hidden" value="hod" />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Password *
            </label>
            <input
              type="password"
              value={formData.Password}
              onChange={(e) =>
                setFormData({ ...formData, Password: e.target.value })
              }
              required
              minLength={6}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create HOD Account"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/users")}
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

export default UserFormPage;
