import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";

const ReportsPage = () => {
  const [reportData, setReportData] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    completedEvents: 0,
    averageAttendance: 0,
    eventsByDepartment: [],
    upcomingEvents: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
        params: dateRange.startDate ? dateRange : {},
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch report data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    setLoading(true);
    fetchReportData();
  };

  const handleDownloadReport = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/reports/download/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: dateRange.startDate ? dateRange : {},
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download report");
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
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        Reports & Analytics
      </h1>

      {/* Filters */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Date Range Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilterApply}
              className="w-full bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiBarChart2 className="text-blue-400 w-8 h-8" />
          </div>
          <p className="text-gray-400 text-sm">Total Events</p>
          <p className="text-3xl font-bold text-white mt-1">
            {reportData.totalEvents}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiPieChart className="text-green-400 w-8 h-8" />
          </div>
          <p className="text-gray-400 text-sm">Total Participants</p>
          <p className="text-3xl font-bold text-white mt-1">
            {reportData.totalParticipants}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="text-purple-400 w-8 h-8" />
          </div>
          <p className="text-gray-400 text-sm">Completed Events</p>
          <p className="text-3xl font-bold text-white mt-1">
            {reportData.completedEvents}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiBarChart2 className="text-yellow-400 w-8 h-8" />
          </div>
          <p className="text-gray-400 text-sm">Avg Attendance</p>
          <p className="text-3xl font-bold text-white mt-1">
            {reportData.averageAttendance}%
          </p>
        </div>
      </div>

      {/* Events by Department */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">
          Events by Department
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-gray-300">Department</th>
                <th className="py-3 px-4 text-gray-300">Total Events</th>
                <th className="py-3 px-4 text-gray-300">Completed</th>
                <th className="py-3 px-4 text-gray-300">Pending</th>
              </tr>
            </thead>
            <tbody>
              {reportData.eventsByDepartment.map((dept, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="py-3 px-4 text-white">{dept.name}</td>
                  <td className="py-3 px-4 text-gray-400">{dept.total}</td>
                  <td className="py-3 px-4 text-green-400">{dept.completed}</td>
                  <td className="py-3 px-4 text-yellow-400">{dept.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Download Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleDownloadReport("events")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center"
          >
            <FiDownload /> Events Report
          </button>
          <button
            onClick={() => handleDownloadReport("attendance")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center"
          >
            <FiDownload /> Attendance Report
          </button>
          <button
            onClick={() => handleDownloadReport("volunteers")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center"
          >
            <FiDownload /> Volunteers Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
