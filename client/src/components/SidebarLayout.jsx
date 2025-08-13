import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, HelpCircle, LogIn, LogOut, UserCircle2, Menu } from 'lucide-react';

/**
 * Responsive, professional sidebar layout.
 * - Desktop: compact (80px) by default, expands (224px) on hover.
 * - Mobile: hidden by default, tap hamburger to slide-in panel.
 * - Avatar + Logout is pinned to bottom.
 */
export default function SidebarLayout({ children }) {
  const { token, setToken, setUser, user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    setToken(null);
    setUser(null);
    nav('/login');
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={22} /> },
    { name: 'Decision Helper', path: '/decision-helper', icon: <HelpCircle size={22} /> },
    { name: 'Profile', path: user?.username ? `/profile/${user.username}` : '/profile/me', icon: <UserCircle2 size={22} /> },
  ];

  const profilePic = user?.profilePic || '/default-avatar.png';

  const SidebarInner = ({isExpanded}) => (
    <div className="flex h-full flex-col">
      {/* Profile */}
      <div className="flex flex-col items-center p-4">
        {user ? (
          <img
            src={profilePic}
            alt={user.name || 'User'}
            className="w-12 h-12 rounded-full object-cover cursor-pointer transition-transform hover:scale-105"
            onClick={() => nav(`/profile/${user.username || 'me'}`)}
          />
        ) : (
          <UserCircle2 size={48} className="text-gray-400" />
        )}
        {isExpanded && user && <h3 className="mt-2 text-sm font-semibold text-center line-clamp-1">{user.name}</h3>}
      </div>

      {/* Nav */}
      <nav className="mt-2 flex flex-col gap-1 flex-1">
        {menuItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded mx-2 transition
                ${active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={()=> setMobileOpen(false)}
            >
              <span className="shrink-0">{item.icon}</span>
              {isExpanded && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Auth button */}
      <div className="p-3 mt-auto">
        {token ? (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center rounded bg-blue-600 text-white py-2 hover:bg-blue-700 transition"
          >
            <LogOut size={18} />
            {isExpanded && 'Logout'}
          </button>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center gap-2 justify-center rounded bg-blue-600 text-white py-2 hover:bg-blue-700 transition"
          >
            <LogIn size={18} />
            {isExpanded && 'Login'}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            aria-label="Open sidebar"
            className="p-2 rounded hover:bg-gray-100"
            onClick={()=> setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="font-semibold">Smart Productivity</div>
          <div className="w-6" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block bg-white border-r h-screen sticky top-0 transition-all duration-200 ease-in-out
        ${expanded ? 'w-56' : 'w-20'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <SidebarInner isExpanded={expanded} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={()=> setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-xl">
            <SidebarInner isExpanded={true} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}
