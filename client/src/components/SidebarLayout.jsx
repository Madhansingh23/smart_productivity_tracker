import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  HelpCircle,
  LogIn,
  LogOut,
  UserCircle2,
  Menu,
} from "lucide-react";

export default function SidebarLayout({ children }) {
  const { token, setToken, setUser, user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    setToken(null);
    setUser(null);
    nav("/login");
  }

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22} /> },
    { name: "Tasks", path: "/tasks", icon: <CheckSquare size={22} /> },
    { name: "Decision Helper", path: "/decision-helper", icon: <HelpCircle size={22} /> },
    {
      name: "Profile",
      path: user?.username ? `/profile/${user.username}` : "/profile/me",
      icon: <UserCircle2 size={22} />,
    },
  ];

  const profilePic = user?.profilePic || "/default-avatar.png";

  const SidebarInner = ({ isExpanded }) => (
    <div className="flex h-full flex-col">
      {/* Profile */}
      <div className="flex flex-col items-center p-4">
        {user ? (
          <img
            src={profilePic}
            alt={user.name || "User"}
            className="w-12 h-12 rounded-full object-cover cursor-pointer transition-transform hover:scale-105"
            onClick={() => nav(`/profile/${user.username || "me"}`)}
          />
        ) : (
          <UserCircle2 size={48} className="text-gray-400" />
        )}
        {isExpanded && user && (
          <h3 className="mt-2 text-sm font-semibold text-center truncate w-full">
            {user.name}
          </h3>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded mx-2 transition
                ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="shrink-0">{item.icon}</span>
              {isExpanded && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Auth Button */}
      <div className="p-3 mt-auto">
        {token ? (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center rounded bg-blue-600 text-white py-2 hover:bg-blue-700 transition"
          >
            <LogOut size={18} />
            {isExpanded && "Logout"}
          </button>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center gap-2 justify-center rounded bg-blue-600 text-white py-2 hover:bg-blue-700 transition"
          >
            <LogIn size={18} />
            {isExpanded && "Login"}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Floating Mobile Button */}
      <div className="lg:hidden fixed bottom-4 left-4 z-50">
        <button
          aria-label="Open menu"
          className="p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block bg-white border-r h-screen sticky top-0 transition-all duration-200 ease-in-out
        ${expanded ? "w-56" : "w-20"}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <SidebarInner isExpanded={expanded} />
      </aside>

      {/* Mobile Fullscreen Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-semibold text-lg">Menu</div>
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarInner isExpanded={true} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}
