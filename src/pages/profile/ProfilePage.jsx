import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiShield,
  FiBriefcase,
} from "react-icons/fi";
import API_URL from "../../config/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Department: "",
    DOB: "",
  });

  // Get user ID from localStorage
  const getUserId = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    // Check for both 'id' and '_id' since MongoDB uses '_id'
    return userData.id || userData._id || null;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = getUserId();

      console.log("Fetching profile for user ID:", userId);

      if (!userId) {
        console.error("No user ID found in localStorage");
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile fetched:", res.data);

      setUser(res.data);
      setFormData({
        First_name: res.data.First_name || "",
        Last_name: res.data.Last_name || "",
        Email: res.data.Email || "",
        Department: res.data.Department || "",
        DOB: res.data.DOB?.split("T")[0] || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const userId = getUserId();

      const url = `${API_URL}/api/profile/${userId}`;
      console.log("=== Profile Update ===");
      console.log("User ID:", userId);
      console.log("API URL:", url);
      console.log("Data:", formData);

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      const res = await axios.put(
        url,
        {
          First_name: formData.First_name,
          Last_name: formData.Last_name,
          DOB: formData.DOB || null,
          Department: formData.Department,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile updated successfully:", res.data);
      setUser(res.data);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
      }
      setError(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FiUser className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-white">My Profile</h1>
          </div>
          <p className="text-slate-400 ml-13">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden sticky top-6 shadow-2xl">
              {/* Avatar Section */}
              <div className="bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/30 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-indigo-500/30 mb-4 relative ring-4 ring-slate-800/50">
                    {user?.First_name?.[0]}
                    {user?.Last_name?.[0]}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-slate-800 shadow-lg"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.First_name} {user?.Last_name}
                  </h2>
                  <p className="text-slate-400 text-sm mb-4">{user?.Email}</p>
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold capitalize">
                    {user?.role} Account
                  </span>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="p-6 space-y-3">
                {user?.Department && (
                  <div className="group flex items-center gap-3 p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/30 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FiBriefcase className="text-blue-400 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">
                        Department
                      </p>
                      <p className="text-white font-semibold text-sm">
                        {user.Department}
                      </p>
                    </div>
                  </div>
                )}

                <div className="group flex items-center gap-3 p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/30 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiShield className="text-purple-400 text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Account Type
                    </p>
                    <p className="text-white font-semibold text-sm capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                    isEditing
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                  }`}
                >
                  {isEditing ? (
                    "Cancel Editing"
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiEdit2 />
                      Edit Profile
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-900/30 via-slate-800/50 to-purple-900/30 px-6 py-5 border-b border-slate-700/50">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiUser className="text-indigo-400" />
                  Personal Information
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Update your account details and information
                </p>
              </div>

              {error && (
                <div className="mx-6 mt-6 bg-rose-900/30 border border-rose-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-rose-400"
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
                    </div>
                    <p className="text-rose-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <FiUser className="text-indigo-400 text-xs" />
                      </div>
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.First_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            First_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter first name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-900/30 text-white border border-slate-700/50 rounded-xl font-medium">
                        {user?.First_name}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <FiUser className="text-indigo-400 text-xs" />
                      </div>
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.Last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            Last_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter last name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-900/30 text-white border border-slate-700/50 rounded-xl font-medium">
                        {user?.Last_name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FiMail className="text-blue-400 text-xs" />
                      </div>
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-slate-900/30 text-slate-400 border border-slate-700/50 rounded-xl flex items-center justify-between">
                      <span className="font-medium">{user?.Email}</span>
                      <span className="text-xs bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">
                        🔒 Locked
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 ml-9">
                      Email cannot be changed for security
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-purple-400 text-xs" />
                      </div>
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.DOB}
                        onChange={(e) =>
                          setFormData({ ...formData, DOB: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-900/30 text-white border border-slate-700/50 rounded-xl font-medium">
                        {user?.DOB
                          ? new Date(user.DOB).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Not set"}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-6 border-t border-slate-700/50">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                    >
                      <FiSave className="text-lg" />
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all"
                    >
                      Discard Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
