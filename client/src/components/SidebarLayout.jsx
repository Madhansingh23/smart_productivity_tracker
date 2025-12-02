import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Trophy,
  Timer,
  Zap,
  History,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Phone,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import socket from "../lib/socket";

export default function SidebarLayout({ children }) {
  const { user, setUser, setToken } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const menuItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/tasks", icon: <CheckSquare size={20} />, label: "Tasks" },
    { to: "/leaderboard", icon: <Trophy size={20} />, label: "Leaderboard" },
    { to: "/pomodoro", icon: <Timer size={20} />, label: "Pomodoro" },
    { to: "/decision-helper", icon: <Zap size={20} />, label: "Decision Helper" },
    { to: "/history", icon: <History size={20} />, label: "History" },
    { to: "/rules", icon: <BookOpen size={20} />, label: "Rules" },
    { to: "/contact", icon: <Phone size={20} />, label: "Contact" },
  ];

  useEffect(() => {
    socket.on("historyUpdated", (newCount) => {
      setHistoryCount(newCount);
    });
    return () => socket.disconnect();
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Profile Section */}
      <div className="p-6 mb-6">
        <div
          className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-800/50 border border-blue-100 dark:border-neutral-700 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate(`/profile/${user?.username}`)}
        >
          <img
            src={user?.profilePic || "/default-avatar.png"}
            loading="lazy"
            className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-neutral-600 shadow-sm"
            alt="avatar"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {user?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all relative group ${isActive
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            <div className="relative flex items-center">
              {item.icon}
              {item.label === "History" && historyCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-white dark:border-neutral-900">
                  {historyCount > 99 ? "99+" : historyCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {location.pathname === item.to && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-neutral-800 space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button
          onClick={() => {
            setToken(null);
            setUser(null);
          }}
          className="w-full p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
          title="Sign out"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F3F4F6] dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-sans relative overflow-hidden">
      {/* Global Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-72 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-white/20 dark:border-neutral-800 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">SPT</span>
        </div>
        <img
          src={user?.profilePic || "/default-avatar.png"}
          className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-neutral-700"
          alt="avatar"
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 shadow-2xl transform transition-transform duration-300 ease-out">
            <SidebarContent />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 min-h-screen pt-16 md:pt-0 transition-all duration-300 flex flex-col relative z-10">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}