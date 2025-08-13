import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Clock3, Trophy, Newspaper, ListChecks } from 'lucide-react';

/**
 * Dashboard: responsive cards
 * - Greeting + today stats
 * - Pending tasks
 * - Points
 * - Tech news (static curated list as placeholder)
 */
export default function Dashboard(){
  const [tasks,setTasks] = useState([]);
  const [points,setPoints] = useState(0);
  const [name,setName] = useState('');

  useEffect(()=> {
    (async ()=>{
      try{
        const t = await api.get('/tasks');
        setTasks(t.data || []);
      }catch{}
    })();
  },[]);

  useEffect(()=>{
    try{
      const uRaw = localStorage.getItem('user');
      if(uRaw){
        const u = JSON.parse(uRaw);
        setPoints(u.points || 0);
        setName(u.name || '');
      }
    }catch{}
  },[]);

  const pending = tasks.filter(t=> t.status !== 'completed');

  const news = [
    { title: 'AI beats SOTA on code generation', url: '#'},
    { title: 'Vite 6 roadmap highlights', url: '#'},
    { title: 'MongoDB tips for massive scale', url: '#'},
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome{ name ? `, ${name}` : '' } 👋</h2>
        <p className="text-gray-600">Here’s a quick snapshot of your productivity.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold"><Clock3 size={18}/> Today</div>
          <div className="text-3xl font-bold mt-2">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          <div className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString()}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold"><ListChecks size={18}/> Pending Tasks</div>
          <div className="text-3xl font-bold mt-2">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">Keep going!</div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold"><Trophy size={18}/> Points</div>
          <div className="text-3xl font-bold mt-2">{points}</div>
          <div className="text-xs text-gray-500 mt-1">Earn by finishing on time</div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold"><Newspaper size={18}/> Tech News</div>
          <ul className="mt-2 text-sm list-disc pl-4">
            {news.map((n,i)=>(<li key={i}><a className="text-blue-600 hover:underline" href={n.url} target="_blank" rel="noreferrer">{n.title}</a></li>))}
          </ul>
        </div>
      </div>
    </div>
  );
}
