import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const DepartmentListPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://clg-managemt-backend.onrender.com/api/departments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://clg-managemt-backend.onrender.com/api/departments/${deptId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department", err);
      alert("Failed to delete department");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Departments
        </h1>
        <Link
          to="/departments/create"
          className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center"
        >
          <FiPlus /> Add Department
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No departments found
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                  <span className="text-teal-400 text-sm font-semibold">
                    {dept.code}
                  </span>
                  {dept.hodName && (
                    <p className="text-gray-400 text-xs mt-1">
                      HOD: {dept.hodName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/departments/${dept.id}/edit`}
                    className="text-blue-400 hover:text-blue-300 transition"
                    title="Edit Department & Change HOD"
                  >
                    <FiEdit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-400 hover:text-red-300 transition"
                    title="Delete Department"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {dept.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentListPage;
