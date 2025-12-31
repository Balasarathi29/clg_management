import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import API_URL from "../../config/api";

const UserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let usersList = res.data || [];

      // HOD only sees faculty and students from their department (no HOD or Admin)
      if (currentUser.role === "hod") {
        usersList = usersList.filter(
          (u) =>
            u.Department === currentUser.Department &&
            (u.role === "faculty" || u.role === "student")
        );
      }

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.First_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.Last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${userEmail}?`))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      hod: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      faculty: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      student: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return badges[role] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <FiUsers className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  User Management
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage HODs, Faculty, and Students
                </p>
              </div>
            </div>
            {currentUser.role === "admin" && (
              <button
                onClick={() => navigate("/users/create")}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <FiPlus className="text-xl" />
                Create HOD
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <p className="text-purple-300 text-sm font-medium">Total Users</p>
            <p className="text-white text-3xl font-bold mt-1">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
            <p className="text-blue-300 text-sm font-medium">HODs</p>
            <p className="text-white text-3xl font-bold mt-1">
              {users.filter((u) => u.role === "hod").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
            <p className="text-cyan-300 text-sm font-medium">Faculty</p>
            <p className="text-white text-3xl font-bold mt-1">
              {users.filter((u) => u.role === "faculty").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <p className="text-green-300 text-sm font-medium">Students</p>
            <p className="text-white text-3xl font-bold mt-1">
              {users.filter((u) => u.role === "student").length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">All Roles</option>
                <option value="hod">HODs</option>
                <option value="faculty">Faculty</option>
                <option value="student">Students</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <FiUsers className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Department
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                            {user.First_name?.[0]}
                            {user.Last_name?.[0]}
                          </div>
                          <span className="text-white font-medium">
                            {user.First_name} {user.Last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.Email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user.Department || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              console.log("Edit clicked for user:", user._id);
                              navigate(`/users/edit/${user._id}`);
                            }}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.Email)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;
