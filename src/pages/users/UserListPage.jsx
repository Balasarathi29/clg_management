import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiSearch, FiUserPlus } from "react-icons/fi";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

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
    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.role === filterRole);
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

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete user", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        {currentUser.role === "admin" && (
          <Link
            to="/users/create"
            className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
          >
            + Create HOD Account
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Roles</option>
            {currentUser.role === "hod" ? (
              <>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </>
            ) : (
              <>
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900">
                <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                  Name
                </th>
                <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                  Email
                </th>
                <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                  Role
                </th>
                <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                  Department
                </th>
                {currentUser.role === "admin" && (
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isHOD = user.role === "hod";
                const isAdmin = user.role === "admin";

                return (
                  <tr
                    key={user._id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <td className="py-4 px-6 text-white">
                      <div className="flex items-center gap-2">
                        {user.First_name} {user.Last_name}
                        {isHOD && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold">
                            HOD
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{user.Email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-900/50 text-purple-300"
                            : user.role === "hod"
                            ? "bg-blue-900/50 text-blue-300"
                            : user.role === "faculty"
                            ? "bg-green-900/50 text-green-300"
                            : "bg-gray-900/50 text-gray-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {user.Department}
                    </td>
                    {currentUser.role === "admin" && (
                      <td className="py-4 px-6">
                        <div className="flex gap-2 items-center">
                          {isAdmin ? (
                            <span className="text-gray-500 text-sm italic">
                              System Account
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="text-red-400 hover:text-red-300 transition font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchTerm || filterRole !== "all"
                ? "No users found matching your filters"
                : "No users found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;
