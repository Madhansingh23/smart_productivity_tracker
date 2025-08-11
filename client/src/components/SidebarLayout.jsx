
import React from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext';
export default function SidebarLayout({children}){
  const { token, setToken, setUser, user } = useAuth();
  const nav = useNavigate();
  function logout(){ setToken(null); setUser(null); nav('/login'); }
  return (<div className='flex min-h-screen'>
    <aside className='w-64 bg-white border-r p-4'>
      <div className='mb-6'><h2 className='text-lg font-bold'>Smart Productivity</h2>{user && <div className='text-sm text-gray-600'>{user.name}</div>}</div>
      <nav className='flex flex-col gap-2'>
        <Link to='/' className='p-2 rounded hover:bg-gray-100'>Dashboard</Link>
        <Link to='/tasks' className='p-2 rounded hover:bg-gray-100'>Tasks</Link>
        <Link to='/decision-helper' className='p-2 rounded hover:bg-gray-100'>Decision Helper</Link>
      </nav>
      <div className='mt-6'>{token ? <button onClick={logout} className='bg-blue-600 text-white px-3 py-1 rounded'>Logout</button> : <Link to='/login' className='bg-blue-600 text-white px-3 py-1 rounded'>Login</Link>}</div>
    </aside>
    <main className='flex-1 p-6'>{children}</main>
  </div>);
}
