import React, { useEffect, useState } from "react";
import api from "../lib/api.js";
import { ArchiveRestore } from "lucide-react";
import toast from "react-hot-toast";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  async function load() {
  try {
    const res = await api.get("/tasks/history");

    if (Array.isArray(res.data)) {
      setHistory(res.data);
    } else {
      setHistory([]); // fallback if backend sends something unexpected
    }
  } catch {
    toast.error("Failed to load history");
    setHistory([]); // fallback on error
  }
}


  async function unarchive(item) {
    try {
      await api.post(`/tasks/${item._id}/unarchive`);
      setHistory((h) => h.filter((x) => x._id !== item._id));
      toast.success(`♻️ Restored "${item.title}" back to tasks`);
    } catch {
      toast.error("Failed to unarchive");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 text-neutral-900 dark:text-neutral-100">
      <h2 className="text-xl font-bold mb-4">📦 Archived Tasks</h2>
      {Array.isArray(history) && history.length === 0 ? (
        <p className="text-neutral-500">No archived tasks</p>
      ) : (
        <ul className="space-y-3">
          {history.map((h) => (
            <li
              key={h._id}
              className="flex items-center justify-between p-3 rounded border dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <div>
                <div className="font-medium">{h.title}</div>
                <div className="text-xs text-neutral-500">
                  Status: {h.status}
                </div>
              </div>
              <button
                onClick={() => unarchive(h)}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm flex items-center gap-1 hover:bg-emerald-700 transition"
              >
                <ArchiveRestore size={14} /> Unarchive
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
