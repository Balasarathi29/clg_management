import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiCheckSquare,
  FiBarChart2,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentRole = role || user.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getNavItems = () => {
    const common = [
      { path: `/dashboard/${currentRole}`, icon: FiHome, label: "Dashboard" },
      { path: "/profile", icon: FiUsers, label: "Profile" },
    ];

    const roleSpecific = {
      student: [
        { path: "/events", icon: FiCalendar, label: "Events" },
        { path: "/my-events", icon: FiCheckSquare, label: "My Events" },
        { path: "/my-tasks", icon: FiBriefcase, label: "My Tasks" },
      ],
      faculty: [
        { path: "/events", icon: FiCalendar, label: "Events" },
        { path: "/create-event", icon: FiCalendar, label: "Create Event" },
        { path: "/tasks", icon: FiBriefcase, label: "Manage Tasks" },
        { path: "/tasks/create", icon: FiCheckSquare, label: "Create Task" },
      ],
      hod: [
        { path: "/create-faculty", icon: FiUsers, label: "Create Faculty" },
        { path: "/event-approvals", icon: FiCheckSquare, label: "Approvals" },
        { path: "/all-events", icon: FiCalendar, label: "All Events" },
        { path: "/users", icon: FiUsers, label: "Users" },
        { path: "/reports", icon: FiBarChart2, label: "Reports" },
      ],
      admin: [
        { path: "/users/create", icon: FiUsers, label: "Create HOD" },
        { path: "/users", icon: FiUsers, label: "User Management" },
        { path: "/departments", icon: FiBriefcase, label: "Departments" },
        { path: "/events", icon: FiCalendar, label: "All Events" },
        { path: "/reports", icon: FiBarChart2, label: "Reports" },
      ],
    };

    return [...common, ...(roleSpecific[currentRole] || [])];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-teal-400">Co-Nexus</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="mb-3 px-4">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-semibold truncate">
                {user.First_name} {user.Last_name}
              </p>
              <p className="text-xs text-teal-400 uppercase">{currentRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-teal-400">Co-Nexus</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
