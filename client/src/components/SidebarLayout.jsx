// src/components/SidebarLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Sun, Moon, LogOut, Menu, X,Mail,
  LayoutDashboard, ClipboardList, Star, User, Archive,Gamepad2
} from "lucide-react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";   // ✅ add
import api from "../lib/api.js"

export default function SidebarLayout({ children }) {
  const { user, setToken, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const navigate = useNavigate();

  const menuItems = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
    { to: "/decision-helper", label: "Decision Helper", icon: <Star size={18} /> },
    { to: "/history", label: "History", icon: <Archive size={18} /> },
    { to: `/profile/${user?.username}`, label: "Profile", icon: <User size={18} /> },
    { to: "/snake", label: "Snake Game", icon: <Gamepad2 size={18} /> }, 
    { to: "/contact", label: "Contact", icon: <Mail size={18} /> },
  ];

  // ✅ Initial fetch
useEffect(() => {
  api.get("/tasks/history")
    .then((res) => setHistoryCount(res.data.length || 0))
    .catch(() => setHistoryCount(0));
}, []);


  // ✅ Live updates with WebSocket
  useEffect(() => {
    const socket = io("/", { withCredentials: true }); // assumes same host
    socket.on("historyUpdated", (newCount) => {
      setHistoryCount(newCount);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden z-50 md:flex flex-col fixed left-0 top-0 h-screen border-r dark:border-neutral-800 bg-white dark:bg-neutral-900 group transition-all duration-200 w-16 hover:w-56">
        {/* Profile */}
        <div
          className="flex flex-col items-center group-hover:items-start gap-4 p-4 cursor-pointer"
          onClick={() => navigate(`/profile/${user?.username}`)}
        >
          <img
            src={user?.profilePic || "/default-avatar.png"}
            loading="lazy"    // ✅ lazy load
            className="w-10 h-10 rounded-full object-cover transition group-hover:w-24 group-hover:h-24 mx-auto"
            alt="avatar"
          />
          <div className="hidden group-hover:block text-sm mt-2">
            <div className="font-semibold">{user?.username?.toUpperCase()}</div>
            <div className="text-neutral-500 dark:text-neutral-400">{user?.email}</div>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-6 flex-1 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-sm transition relative ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              <div className="relative flex items-center">
                {item.icon}
                {item.label === "History" && historyCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {historyCount > 99 ? "99+" : historyCount}
                  </span>
                )}
              </div>
              <span className="hidden group-hover:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
          <div className="bg-white dark:bg-neutral-900 w-64 h-full p-4 shadow-xl">
            <button
              className="mb-4 p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
            <div
              className="flex items-center gap-3 mb-6 cursor-pointer"
              onClick={() => {
                navigate(`/profile/${user?.username}`);
                setMobileOpen(false);
              }}
            >
              <img
                src={user?.profilePic || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <div className="text-sm">
                <div className="font-semibold">{user?.username?.toUpperCase()}</div>
                <div className="text-neutral-500 dark:text-neutral-400">{user?.email}</div>
              </div>
            </div>
            <nav className="space-y-2 text-sm">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded text-sm relative ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`
                  }
                >
                  <div className="relative flex items-center">
                    {item.icon}
                    {item.label === "History" && historyCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {historyCount > 99 ? "99+" : historyCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2 rounded border dark:border-neutral-700"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 font-bold text-lg">
            <span className="hidden md:inline">Smart Productivity Tracker</span>
            <span className="md:hidden">SPT</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              aria-label="Toggle theme"
              className="p-2 rounded border dark:border-neutral-700"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="p-2 rounded border dark:border-neutral-700"
              onClick={() => {
                setToken(null);
                setUser(null);
              }}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}