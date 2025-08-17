// src/components/SidebarLayout.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';

export default function SidebarLayout({ children }) {
  const { user, setToken, setUser } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="flex">
        <aside className="w-60 hidden md:block border-r dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-6">
            <img src={user?.profilePic ? user.profilePic : '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
            <div className="text-sm">
              <div className="font-semibold">@{user?.username}</div>
              <div className="text-neutral-500 dark:text-neutral-400">{user?.email}</div>
            </div>
          </div>
          <nav className="space-y-2 text-sm">
            <NavLink to="/" className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Dashboard</NavLink>
            <NavLink to="/tasks" className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Tasks</NavLink>
            <NavLink to="/decision-helper" className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Decision Helper</NavLink>
            <NavLink to={`/profile/${user?.username}`} className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Profile</NavLink>
          </nav>
        </aside>
        <main className="flex-1">
          <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="md:hidden font-semibold">@{user?.username}</div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Toggle theme"
                className="p-2 rounded border dark:border-neutral-700"
                onClick={()=> setTheme(theme==='dark' ? 'light' : 'dark')}
              >
                {theme==='dark' ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
              <button
                className="p-2 rounded border dark:border-neutral-700"
                onClick={()=>{ setToken(null); setUser(null); }}
                title="Sign out"
              >
                <LogOut size={18}/>
              </button>
            </div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
