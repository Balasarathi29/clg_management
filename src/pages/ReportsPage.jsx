import React from "react";
import { FiBarChart2, FiDownload } from "react-icons/fi";

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Reports</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <FiBarChart2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Reports Module
        </h2>
        <p className="text-gray-400">
          Generate comprehensive reports for events, attendance, and user
          activities.
        </p>
        <button className="mt-6 bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 mx-auto">
          <FiDownload /> Generate Report
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;
