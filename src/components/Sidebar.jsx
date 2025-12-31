import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiLayers,
  FiFileText,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const menuItems = {
    admin: [
      {
        path: "/admin",
        icon: FiHome,
        label: "Dashboard",
      },
      {
        path: "/users",
        icon: FiUsers,
        label: "Users",
      },
      {
        path: "/departments",
        icon: FiLayers,
        label: "Departments",
      },
      {
        path: "/events",
        icon: FiCalendar,
        label: "Events",
      },
      {
        path: "/reports",
        icon: FiFileText,
        label: "Reports",
      },
    ],
    hod: [
      {
        path: "/hod",
        icon: FiHome,
        label: "Dashboard",
      },
      {
        path: "/faculty",
        icon: FiUsers,
        label: "Faculty",
      },
      {
        path: "/events",
        icon: FiCalendar,
        label: "Events",
      },
    ],
    faculty: [
      {
        path: "/faculty-dashboard",
        icon: FiHome,
        label: "Dashboard",
      },
      {
        path: "/events",
        icon: FiCalendar,
        label: "Events",
      },
    ],
  };

  const items = menuItems[userRole] || [];

  return (
    <div className="h-screen w-72 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col fixed left-0 top-0 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800/50 bg-gradient-to-r from-indigo-900/20 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all">
            <span className="text-white font-black text-2xl">C</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              Conexus
            </h1>
            <p className="text-indigo-300 text-xs font-medium">
              Management Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-40"></div>
                )}
                <div className="relative flex items-center gap-3 flex-1">
                  <item.icon
                    className={`text-xl ${isActive ? "text-white" : ""}`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800/50 bg-gradient-to-t from-indigo-900/10 to-transparent space-y-3">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg relative">
              <span className="text-lg">
                {user.First_name?.[0]}
                {user.Last_name?.[0]}
              </span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user.First_name} {user.Last_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <p className="text-slate-400 text-xs capitalize">
                  {userRole} Account
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-700/60 hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20 hover:border-indigo-500/40 border border-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all text-sm font-medium"
          >
            <FiUser className="text-sm" />
            <span>View Profile</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all font-medium text-sm group"
        >
          <FiLogOut className="text-lg group-hover:rotate-6 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
