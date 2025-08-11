import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  HelpCircle,
  LogIn,
  LogOut,
  UserCircle2,
} from "lucide-react";

export default function SidebarLayout({ children }) {
  const { token, setToken, setUser, user } = useAuth();
  const nav = useNavigate();
  const [expanded, setExpanded] = useState(false);

  function logout() {
    setToken(null);
    setUser(null);
    nav("/login");
  }

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22} /> },
    { name: "Tasks", path: "/tasks", icon: <CheckSquare size={22} /> },
    {
      name: "Decision Helper",
      path: "/decision-helper",
      icon: <HelpCircle size={22} />,
    },
  ];

  const profilePic =
    user?.profilePic || "https://via.placeholder.com/80?text=User";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r flex flex-col transition-all duration-300 ease-in-out 
          ${expanded ? "w-56" : "w-20"}
        `}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* User profile */}
        <div className="flex flex-col items-center p-4">
          {user ? (
            <img
              src={profilePic}
              alt={user.name}
              className="w-12 h-12 rounded-full cursor-pointer transition-transform hover:scale-105"
              onClick={() => nav(`/profile/${user.username}`)}
            />
          ) : (
            <UserCircle2 size={48} className="text-gray-500" />
          )}
          {expanded && user && (
            <h3 className="mt-2 text-sm font-semibold text-center truncate max-w-[120px]">
              {user.name}
            </h3>
          )}
        </div>

        {/* Navigation links */}
        <nav className="mt-4 flex flex-col gap-1 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 p-3 rounded hover:bg-gray-100 transition text-gray-700"
            >
              {item.icon}
              {expanded && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Login / Logout button */}
        <div className="p-4 mt-auto">
          {token ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded w-full justify-center hover:bg-blue-700 transition"
            >
              <LogOut size={18} />
              {expanded && "Logout"}
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded w-full justify-center hover:bg-blue-700 transition"
            >
              <LogIn size={18} />
              {expanded && "Login"}
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
