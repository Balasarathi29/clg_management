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

const DepartmentListPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [searchTerm, filterStatus, departments]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
      setFilteredDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (dept) =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.hodName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === "with-hod") {
      filtered = filtered.filter((dept) => dept.hodId);
    } else if (filterStatus === "without-hod") {
      filtered = filtered.filter((dept) => !dept.hodId);
    }

    setFilteredDepartments(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Department deleted successfully!");
      fetchDepartments();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <FiUsers className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Departments</h1>
                <p className="text-gray-400 mt-1">
                  Manage all departments and their HODs
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/departments/new")}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FiPlus className="text-xl" />
              Create Department
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">
                  Total Departments
                </p>
                <p className="text-white text-3xl font-bold mt-1">
                  {departments.length}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <FiUsers className="text-blue-400 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">With HOD</p>
                <p className="text-white text-3xl font-bold mt-1">
                  {departments.filter((d) => d.hodId).length}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <svg
                  className="w-7 h-7 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-sm font-medium">
                  Without HOD
                </p>
                <p className="text-white text-3xl font-bold mt-1">
                  {departments.filter((d) => !d.hodId).length}
                </p>
              </div>
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <svg
                  className="w-7 h-7 text-amber-400"
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
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by name, code, or HOD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-900/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">All Departments</option>
                <option value="with-hod">With HOD</option>
                <option value="without-hod">Without HOD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        {filteredDepartments.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <div className="bg-gray-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No departments found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Get started by creating your first department"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => navigate("/departments/new")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
              >
                <FiPlus />
                Create First Department
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-teal-500/50 transition-all group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-teal-500/20 px-3 py-1 rounded-lg">
                      <span className="text-teal-400 font-mono font-semibold">
                        {dept.code}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/departments/edit/${dept.id}`)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                    {dept.name}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {dept.description || "No description available"}
                  </p>

                  {/* HOD Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                    <div className="bg-teal-500/20 p-2 rounded-lg">
                      <FiUsers className="text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">
                        Head of Department
                      </p>
                      <p className="text-white font-semibold truncate">
                        {dept.hodName || "Not Assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentListPage;
