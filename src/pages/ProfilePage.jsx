import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiBriefcase,
  FiSave,
} from "react-icons/fi";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Department: "",
    DOB: "",
    role: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []); // Empty dependency array - only run once on mount

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        // Ensure DOB is properly formatted
        if (user.DOB) {
          user.DOB = user.DOB.split("T")[0]; // Remove time part if exists
        }
        setProfile(user);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        setMessage("❌ User session not found. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      // Check if user is HOD or Admin (hardcoded users)
      if (user.role === "hod" || user.role === "admin") {
        // HOD and Admin profiles are hardcoded, just update localStorage
        const updatedUser = {
          ...user,
          First_name: profile.First_name,
          Last_name: profile.Last_name,
          Department: profile.Department,
          DOB: profile.DOB, // Keep DOB
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfile(updatedUser);

        setMessage("✅ Profile updated successfully!");
        setEditing(false);
        setTimeout(() => setMessage(""), 3000);
        setLoading(false);
        return;
      }

      // For regular users (students/faculty), update in database
      const updateData = {
        First_name: profile.First_name,
        Last_name: profile.Last_name,
        Department: profile.Department,
        DOB: profile.DOB, // Include DOB in update
      };

      const token = localStorage.getItem("token");

      console.log("Updating profile for user:", user.id);
      console.log("Update data:", updateData);

      const response = await axios.put(
        "http://localhost:5000/api/profile",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": user.id,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile update response:", response.data);

      // Update localStorage with all fields including DOB
      const updatedUser = {
        ...user,
        First_name: profile.First_name,
        Last_name: profile.Last_name,
        Department: profile.Department,
        DOB: profile.DOB,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfile(updatedUser);

      setMessage("✅ Profile updated successfully!");
      setEditing(false);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(false);
    fetchProfile(); // Reset to original values
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 p-8 md:p-12">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-800 rounded-full flex items-center justify-center shadow-xl border-4 border-teal-400 flex-shrink-0">
              <FiUser className="w-12 h-12 md:w-16 md:h-16 text-teal-400" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile.First_name} {profile.Last_name}
              </h1>
              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 text-teal-200">
                <span className="px-4 py-1.5 bg-teal-900/50 rounded-full text-sm font-semibold uppercase tracking-wider">
                  {profile.role}
                </span>
                <span className="hidden sm:block text-teal-300">•</span>
                <span className="flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  {profile.Department}
                </span>
                {profile.DOB && (
                  <>
                    <span className="hidden sm:block text-teal-300">•</span>
                    <span className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      DOB: {new Date(profile.DOB).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 bg-gray-900">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 ${
                message.includes("✅")
                  ? "bg-green-900/30 border-green-500 text-green-300"
                  : "bg-red-900/30 border-red-500 text-red-300"
              } animate-pulse`}
            >
              <p className="font-semibold text-center">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-semibold">
                  <FiUser className="mr-2 text-teal-400" />
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.First_name}
                  onChange={(e) =>
                    setProfile({ ...profile, First_name: e.target.value })
                  }
                  disabled={!editing}
                  className="w-full px-4 py-3.5 bg-gray-800 text-white border-2 border-gray-700 rounded-xl focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-semibold">
                  <FiUser className="mr-2 text-teal-400" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.Last_name}
                  onChange={(e) =>
                    setProfile({ ...profile, Last_name: e.target.value })
                  }
                  disabled={!editing}
                  className="w-full px-4 py-3.5 bg-gray-800 text-white border-2 border-gray-700 rounded-xl focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-semibold">
                  <FiMail className="mr-2 text-gray-500" />
                  Email Address
                  <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
                    Read Only
                  </span>
                </label>
                <input
                  type="email"
                  value={profile.Email}
                  disabled
                  className="w-full px-4 py-3.5 bg-gray-700 text-gray-400 border-2 border-gray-600 rounded-xl cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 ml-1">
                  🔒 Email cannot be changed for security reasons
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-semibold">
                  <FiBriefcase className="mr-2 text-teal-400" />
                  Department
                </label>
                <input
                  type="text"
                  value={profile.Department}
                  onChange={(e) =>
                    setProfile({ ...profile, Department: e.target.value })
                  }
                  disabled={!editing}
                  className="w-full px-4 py-3.5 bg-gray-800 text-white border-2 border-gray-700 rounded-xl focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-semibold">
                  <FiCalendar className="mr-2 text-teal-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.DOB ? profile.DOB.split("T")[0] : ""}
                  onChange={(e) =>
                    setProfile({ ...profile, DOB: e.target.value })
                  }
                  disabled={!editing}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3.5 bg-gray-800 text-white border-2 border-gray-700 rounded-xl focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              {!editing ? (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-gray-900 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-gray-900 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-5 h-5" />{" "}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    disabled={loading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
