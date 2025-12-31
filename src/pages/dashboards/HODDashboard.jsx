import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import API_URL from "../../config/api";

const HODDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalEvents: 0,
  });
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const department = user.Department;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all users and filter faculty in HOD's department
      const usersRes = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const departmentFaculty = usersRes.data.filter(
        (u) => u.role === "faculty" && u.Department === department
      );

      setFaculty(departmentFaculty);
      setStats({
        totalFaculty: departmentFaculty.length,
        totalEvents: 0, // Can be fetched from events API
      });
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/users/create-faculty`,
        {
          First_name: formData.First_name,
          Last_name: formData.Last_name,
          Email: formData.Email,
          Password: formData.Password,
          Department: department,
          hodId: user.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Faculty created successfully!");
      setShowCreateForm(false);
      setFormData({ First_name: "", Last_name: "", Email: "", Password: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create faculty");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaculty = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Faculty deleted successfully!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete faculty");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">HOD Dashboard</h1>
          <p className="text-slate-400">Manage faculty in {department}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <FiUsers className="text-blue-400 text-3xl" />
              <span className="text-3xl font-bold text-white">
                {stats.totalFaculty}
              </span>
            </div>
            <p className="text-blue-300 mt-2">Total Faculty</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <FiCalendar className="text-purple-400 text-3xl" />
              <span className="text-3xl font-bold text-white">
                {stats.totalEvents}
              </span>
            </div>
            <p className="text-purple-300 mt-2">Department Events</p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-2xl p-6 border border-teal-500/30 flex items-center justify-center gap-3 text-white font-semibold transition-all"
          >
            <FiUserPlus className="text-3xl" />
            <span>Create Faculty</span>
          </button>
        </div>

        {/* Create Faculty Form */}
        {showCreateForm && (
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create Faculty Account
            </h2>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateFaculty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.First_name}
                  onChange={(e) =>
                    setFormData({ ...formData, First_name: e.target.value })
                  }
                  required
                  className="px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.Last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, Last_name: e.target.value })
                  }
                  required
                  className="px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={formData.Password}
                onChange={(e) =>
                  setFormData({ ...formData, Password: e.target.value })
                }
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <p className="text-indigo-300 text-sm">
                  Department:{" "}
                  <span className="font-semibold">{department}</span>
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Faculty"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError("");
                    setFormData({
                      First_name: "",
                      Last_name: "",
                      Email: "",
                      Password: "",
                    });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Faculty List */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900/30 via-slate-800/50 to-purple-900/30 px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white">Faculty Members</h2>
          </div>

          <div className="p-6">
            {faculty.length === 0 ? (
              <div className="text-center py-12">
                <FiUsers className="text-slate-600 text-5xl mx-auto mb-4" />
                <p className="text-slate-400">No faculty members yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Create First Faculty
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Department
                      </th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map((f) => (
                      <tr
                        key={f._id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/20"
                      >
                        <td className="py-3 px-4 text-white">
                          {f.First_name} {f.Last_name}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{f.Email}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {f.Department}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteFaculty(
                                f._id,
                                `${f.First_name} ${f.Last_name}`
                              )
                            }
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
