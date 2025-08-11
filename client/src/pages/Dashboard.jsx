
import React, { useEffect, useState } from 'react'; import api from '../lib/api';
export default function Dashboard(){ const [tasks,setTasks]=useState([]);
  useEffect(()=>{ let mounted=true; (async ()=>{ try{ const res=await api.get('/tasks'); if(!mounted) return; setTasks(res.data); }catch(e){ console.error(e); } })(); return ()=>{ mounted=false; }; }, []);
  return (<div><h2 className='text-2xl mb-4'>Dashboard</h2><div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{tasks.map(t=>(<div key={t._id} className='p-4 bg-white border rounded'><div className='font-bold'>{t.title}</div><div className='text-sm text-gray-600'>{t.description}</div><div className='mt-2 text-xs'>Status: {t.status}</div></div>))}</div></div>); }
