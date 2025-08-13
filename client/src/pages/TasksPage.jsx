import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const STATUS_STEPS = ['created', 'in-progress', 'checking', 'completed'];
const STATUS_COLORS = {
  'created': 'bg-gray-300',
  'in-progress': 'bg-blue-400',
  'checking': 'bg-amber-400',
  'completed': 'bg-emerald-500'
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  async function loadTasks() {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => { loadTasks(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      alert('Please provide both title and description.');
      return;
    }
    try {
      setCreating(true);
      await api.post('/tasks', { title, description: desc, status: 'created' });
      setTitle('');
      setDesc('');
      loadTasks();
    } finally {
      setCreating(false);
    }
  }

  async function advance(t) {
    const i = STATUS_STEPS.indexOf(t.status);
    if (i < STATUS_STEPS.length - 1) {
      const status = STATUS_STEPS[i + 1];
      await api.put(`/tasks/${t._id}`, { status });
      loadTasks();
    }
  }

  async function remove(t) {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${t._id}`);
    loadTasks();
  }

  const progressPct = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
      </div>

      {/* Add form */}
      <div className="mb-6 bg-white border rounded-xl p-4 shadow-sm">
        <form onSubmit={add} className="grid md:grid-cols-4 gap-3">
          <input
            value={title}
            onChange={e=>setTitle(e.target.value)}
            placeholder="Task title"
            className="p-2 border rounded md:col-span-1"
          />
          <input
            value={desc}
            onChange={e=>setDesc(e.target.value)}
            placeholder="Short description"
            className="p-2 border rounded md:col-span-2"
          />
          <button
            type="submit"
            disabled={!title.trim() || !desc.trim() || creating}
            className="bg-emerald-600 text-white rounded px-4 py-2 disabled:opacity-60"
          >
            {creating ? 'Adding...' : 'Add Task'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Enter both title and description to enable Add.</p>
      </div>

      {/* Task list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(t => (
          <div key={t._id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">{t.status}</span>
            </div>

            {/* Multi-step progress */}
            <div className="mt-3">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-2 ${STATUS_COLORS[t.status]}`}
                  style={{ width: progressPct(t.status)+'%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                {STATUS_STEPS.map(s=>(<span key={s}>{s}</span>))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {t.status !== 'completed' ? (
                <button onClick={()=>advance(t)} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                  Next Stage
                </button>
              ) : (
                <span className="text-emerald-600 text-sm font-medium">Completed</span>
              )}
              <button onClick={()=>remove(t)} className="px-3 py-1 rounded border text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
