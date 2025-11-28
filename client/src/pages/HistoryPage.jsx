// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import Loading from "../components/Loading";
import { Archive, RotateCcw, Trash2, CheckCircle2, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

export default function HistoryPage() {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'archived', 'completed'

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const fetchAllHistory = async () => {
    setLoading(true);
    try {
      const [archivedRes, activeRes] = await Promise.all([
        api.get("/tasks/history"),
        api.get("/tasks")
      ]);

      setArchivedTasks(archivedRes.data || []);
      setCompletedTasks((activeRes.data || []).filter(t => t.status === 'completed'));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.post(`/tasks/${id}/unarchive`);
      toast.success("Task restored to To-Do");
      fetchAllHistory();
    } catch (err) {
      toast.error("Failed to restore task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task forever?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted permanently");
      setArchivedTasks(prev => prev.filter(t => t._id !== id));
      setCompletedTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const getFilteredTasks = () => {
    const all = [
      ...archivedTasks.map(t => ({ ...t, type: 'archived' })),
      ...completedTasks.map(t => ({ ...t, type: 'completed' }))
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (filter === 'archived') return all.filter(t => t.type === 'archived');
    if (filter === 'completed') return all.filter(t => t.type === 'completed');
    return all;
  };

  if (loading) return <Loading />;

  const displayedTasks = getFilteredTasks();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Archive className="text-blue-500" size={32} />
          Task History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          View your completed achievements and archived items.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-neutral-900 p-1 rounded-xl border border-gray-100 dark:border-neutral-800 flex gap-1 shadow-sm">
          {['all', 'completed', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden min-h-[400px]">
        {displayedTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <Archive size={48} className="mb-4 text-gray-300" />
            <p>No tasks found in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {displayedTasks.map((task) => (
              <div key={task._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${task.type === 'archived' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                    {task.type === 'archived' ? <Archive size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {task.title}
                      {task.type === 'archived' && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 rounded-full">Archived</span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {task.type === 'archived' ? 'Archived' : 'Completed'} on {new Date(task.completedAt || task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.type === 'archived' && (
                    <button
                      onClick={() => handleRestore(task._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Restore to Board"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Forever"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
