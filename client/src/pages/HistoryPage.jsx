import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/tasks/history");
        setHistory(res);
      } catch {
        alert("Failed to load history");
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-neutral-900 dark:text-neutral-100">
      <h2 className="text-2xl font-bold mb-6">📜 Task History</h2>
      {history.length === 0 ? (
        <p className="text-neutral-500">No history yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((h) => (
            <li
              key={h._id}
              className="p-4 border rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm"
            >
              <div className="font-semibold">{h.title}</div>
              <div className="text-sm text-neutral-500">
                {h.description || "—"}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Archived on {new Date(h.archivedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
