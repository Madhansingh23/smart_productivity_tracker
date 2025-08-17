import React, { useEffect, useState } from "react";
import api, { getTasksFast, invalidateTasksCache } from "../lib/api";
import { Trash2, RotateCcw, CheckCircle2 } from "lucide-react";

const STEPS = ["created", "in-progress", "checking", "completed"];
const COLORS = {
  created: "bg-gray-300",
  "in-progress": "bg-blue-400",
  checking: "bg-amber-400",
  completed: "bg-emerald-500",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setTasks(await getTasksFast());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function advance(t) {
    const prev = tasks;
    setTasks((ts) =>
      ts.map((x) =>
        x._id === t._id
          ? {
              ...x,
              status:
                STEPS[Math.min(STEPS.indexOf(x.status) + 1, STEPS.length - 1)],
              completedAt:
                x.status === "checking" ? new Date().toISOString() : x.completedAt,
            }
          : x
      )
    );
    try {
      await api.post(`/tasks/${t._id}/advance`);
      invalidateTasksCache();
    } catch {
      setTasks(prev);
      alert("Failed to advance");
    }
  }

  async function redo(t) {
    const prev = tasks;
    setTasks((ts) =>
      ts.map((x) =>
        x._id === t._id ? { ...x, status: "created", completedAt: null } : x
      )
    );
    try {
      await api.post(`/tasks/${t._id}/redo`);
      invalidateTasksCache();
    } catch {
      setTasks(prev);
      alert("Failed to redo");
    }
  }

  async function remove(t) {
    if (!confirm("Delete this task?")) return;
    const prev = tasks;
    setTasks((ts) => ts.filter((x) => x._id !== t._id));
    try {
      await api.delete(`/tasks/${t._id}`);
      invalidateTasksCache();
    } catch {
      setTasks(prev);
      alert("Delete failed");
    }
  }

  function renderPhase(label, key) {
    const phaseTasks = tasks.filter((t) => t.status === key);
    return (
      <section className="mb-10" key={key}>
        <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
          <span className="capitalize">{label}</span>
          <span className="text-sm text-neutral-500">({phaseTasks.length})</span>
        </h3>

        {phaseTasks.length === 0 ? (
          <p className="text-neutral-500 text-sm italic">
            No tasks in {label}.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phaseTasks.map((t) => (
              <div
                key={t._id}
                className="flex flex-col justify-between bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="font-medium text-base">{t.title}</div>
                  <div className="text-sm text-neutral-500 break-words">
                    {t.description}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${COLORS[t.status]}`}
                        style={{
                          width:
                            ((STEPS.indexOf(t.status) + 1) / STEPS.length) * 100 +
                            "%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Completed timestamp */}
                  {t.status === "completed" && (
                    <div className="text-xs text-neutral-400 mt-2">
                      ✅ Completed on:{" "}
                      {t.completedAt
                        ? new Date(t.completedAt).toLocaleString()
                        : "—"}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {t.status !== "completed" && (
                    <button
                      onClick={() => advance(t)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-blue-600 text-white text-sm flex items-center justify-center gap-1 hover:bg-blue-700 transition"
                    >
                      Next <CheckCircle2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => redo(t)}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded border text-sm flex items-center justify-center gap-1 hover:bg-yellow-50 dark:hover:bg-neutral-800 transition"
                  >
                    <RotateCcw size={14} /> Redo
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded border text-sm flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-neutral-800 transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-neutral-900 dark:text-neutral-100">
      <h2 className="text-2xl font-bold mb-8 text-center sm:text-left">
        Tasks by Phases
      </h2>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <>
          {renderPhase("Created", "created")}
          {renderPhase("In Progress", "in-progress")}
          {renderPhase("Checking", "checking")}
          {renderPhase("Completed", "completed")}
        </>
      )}
    </div>
  );
}
