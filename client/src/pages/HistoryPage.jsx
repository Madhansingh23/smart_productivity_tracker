// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import toast, { Toaster } from "react-hot-toast";
import { Clock, Archive, AlertCircle } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await api.get("/tasks/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
      toast.error("Failed to load archived tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-neutral-900 dark:text-neutral-100">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-bold mb-8 text-center sm:text-left flex items-center gap-2">
        <Archive size={22} />
        Archived Tasks
      </h2>

      {loading ? (
        <p className="text-neutral-500">Loading history...</p>
      ) : history.length === 0 ? (
        <div className="flex items-center gap-2 text-neutral-500 italic">
          <AlertCircle size={18} /> No archived tasks yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((t) => (
            <div
              key={t._id}
              className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-base mb-1 break-words">
                  {t.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 break-words">
                  {t.description || "—"}
                </p>

                <div className="mt-3 text-xs text-neutral-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    Due:{" "}
                    {t.dueAt ? new Date(t.dueAt).toLocaleString() : "—"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Archive size={14} />
                    Archived:{" "}
                    {t.archivedAt
                      ? new Date(t.archivedAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
