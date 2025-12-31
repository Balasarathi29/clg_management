import React, { useState } from "react";
import axios from "axios";
import { FiUserPlus, FiArrowLeft } from "react-icons/fi";

const CreateFacultyPage = () => {
  const [formData, setFormData] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.Password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.Password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/users/create-faculty",
        {
          First_name: formData.First_name,
          Last_name: formData.Last_name,
          Email: formData.Email,
          Password: formData.Password,
          Department: user.Department,
          hodId: user.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(`Faculty account created successfully for ${formData.Email}`);
      setFormData({
        First_name: "",
        Last_name: "",
        Email: "",
        Password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create faculty account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="text-teal-400 hover:text-teal-300 flex items-center gap-2"
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <FiUserPlus className="text-teal-400 w-8 h-8" />
          <h1 className="text-3xl font-bold text-white">
            Create Faculty Account
          </h1>
        </div>

        <p className="text-gray-400 mb-6">
          Create a new faculty account for the{" "}
          <strong className="text-teal-400">{user.Department}</strong>{" "}
          department.
        </p>

        {message && (
          <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
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
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
              required
              placeholder="faculty@college.edu"
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="mb-6">
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
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center disabled:opacity-50"
          >
            <FiUserPlus /> {loading ? "Creating..." : "Create Faculty Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFacultyPage;
