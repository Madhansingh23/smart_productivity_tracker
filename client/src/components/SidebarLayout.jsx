import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function SidebarLayout({ children }) {
  const { user, setToken, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="w-60 hidden md:block border-r dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={user?.profilePic || "/default-avatar.png"}
              className="w-10 h-10 rounded-full object-cover"
              alt="avatar"
            />
            <div className="text-sm">
              <div className="font-semibold">@{user?.username}</div>
              <div className="text-neutral-500 dark:text-neutral-400">
                {user?.email}
              </div>
            </div>
          </div>
          <nav className="space-y-2 text-sm">
            <NavLink
              to="/"
              className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/tasks"
              className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Tasks
            </NavLink>
            <NavLink
              to="/decision-helper"
              className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Decision Helper
            </NavLink>
            <NavLink
              to={`/profile/${user?.username}`}
              className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Profile
            </NavLink>
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
              <nav className="space-y-2 text-sm">
                <NavLink
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/tasks"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Tasks
                </NavLink>
                <NavLink
                  to="/decision-helper"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Decision Helper
                </NavLink>
                <NavLink
                  to={`/profile/${user?.username}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Profile
                </NavLink>
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1">
          <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="md:hidden flex items-center gap-2">
              <button
                className="p-2 rounded border dark:border-neutral-700"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={18} />
              </button>
              <span className="font-semibold">@{user?.username}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                aria-label="Toggle theme"
                className="p-2 rounded border dark:border-neutral-700"
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
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
    </div>
  );
}
