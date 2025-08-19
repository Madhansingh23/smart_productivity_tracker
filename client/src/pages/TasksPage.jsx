import React, { useEffect, useState } from "react";
import api, { getTasksFast, invalidateTasksCache } from "../lib/api";
import { Trash2, RotateCcw, CheckCircle2, Archive } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueAt: "",
    remindAt: ""
  });

  async function load() {
    setLoading(true);
    try {
      // setTasks(await getTasksFast());
      const data = await getTasksFast();
      setTasks(Array.isArray(data) ? data : (data.tasks || []));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function createTask(e) {
    e.preventDefault();
    try {
      const res = await api.post("/tasks", newTask);
      // setTasks([res.data, ...tasks]);
      setTasks((ts) => [res.data, ...(Array.isArray(ts) ? ts : [])]);
      setNewTask({ title: "", description: "", dueAt: "", remindAt: "" });
      invalidateTasksCache();
      toast.success("Task created successfully!");
    } catch {
      toast.error("Failed to create task");
    }
  }

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
      const res = await api.post(`/tasks/${t._id}/advance`);
      invalidateTasksCache();
      if (res.data.status === "completed") {
        toast.success(`🎉 Task "${t.title}" completed!`);
      } else {
        toast.success(`Task moved to ${res.data.status}`);
      }
    } catch {
      setTasks(prev);
      toast.error("Failed to advance");
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
      toast("Task reset to Created", { icon: "🔄" });
    } catch {
      setTasks(prev);
      toast.error("Failed to redo");
    }
  }

  async function archive(t) {
    const prev = tasks;
    setTasks((ts) => ts.filter((x) => x._id !== t._id));
    try {
      await api.post(`/tasks/${t._id}/archive`);
      invalidateTasksCache();
      toast.success(`📦 Task "${t.title}" archived!`);
    } catch {
      setTasks(prev);
      toast.error("Failed to archive");
    }
  }

  async function remove(t) {
    if (!confirm("Delete this task?")) return;
    const prev = tasks;
    setTasks((ts) => ts.filter((x) => x._id !== t._id));
    try {
      await api.delete(`/tasks/${t._id}`);
      invalidateTasksCache();
      toast.success("Task deleted");
    } catch {
      setTasks(prev);
      toast.error("Delete failed");
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

                  {t.status === "completed" && (
                    <div className="text-xs text-neutral-400 mt-2">
                      ✅ Completed on:{" "}
                      {t.completedAt
                        ? new Date(t.completedAt).toLocaleString()
                        : "—"}
                    </div>
                  )}
                </div>

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
                    onClick={() => archive(t)}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded border text-sm flex items-center justify-center gap-1 hover:bg-blue-50 dark:hover:bg-neutral-800 transition"
                  >
                    <Archive size={14} /> Archive
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
      <Toaster position="top-right" />

      <h2 className="text-2xl font-bold mb-8 text-center sm:text-left">
        Tasks by Phases
      </h2>

      {/* Task creation form */}
      <form
        onSubmit={createTask}
        className="mb-8 p-4 rounded-lg border dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">➕ Create New Task</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Title
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full bg-white dark:bg-neutral-800 dark:text-neutral-100"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full bg-white dark:bg-neutral-800 dark:text-neutral-100"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Required Completion Date
            </label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm w-full bg-white dark:bg-neutral-800 dark:text-neutral-100"
              value={newTask.dueAt}
              onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Notify Date
            </label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm w-full bg-white dark:bg-neutral-800 dark:text-neutral-100"
              value={newTask.remindAt}
              onChange={(e) =>
                setNewTask({ ...newTask, remindAt: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition"
        >
          Add Task
        </button>
      </form>

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
