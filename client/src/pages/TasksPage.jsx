import React, { useEffect, useState } from "react";
import api from "../lib/api";

const STATUS_STEPS = [
  { key: "created", label: "Created", color: "bg-gray-400" },
  { key: "in-progress", label: "In Progress", color: "bg-blue-500" },
  { key: "checking", label: "Checking", color: "bg-yellow-500" },
  { key: "completed", label: "Completed", color: "bg-green-500" }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [fileUploads, setFileUploads] = useState({});

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await api.get("/tasks");
      const active = res.data.filter(t => t.status !== "completed");
      const completed = res.data.filter(t => t.status === "completed");
      setTasks(active);
      setHistory(completed);
    } catch (e) {
      console.error(e);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    await api.post("/tasks", { title, description: desc, status: "created" });
    setTitle("");
    setDesc("");
    loadTasks();
  }

  async function nextStage(task) {
    const currentIndex = STATUS_STEPS.findIndex(s => s.key === task.status);
    if (currentIndex < STATUS_STEPS.length - 1) {
      const newStatus = STATUS_STEPS[currentIndex + 1].key;
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      loadTasks();
    }
  }

  async function deleteTask(task) {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task._id}`);
    loadTasks();
  }

  async function handleFileUpload(task, file) {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/tasks/${task._id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setFileUploads(prev => ({ ...prev, [task._id]: file.name }));
  }

  function ProgressBar({ status }) {
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return (
      <div className="flex w-full mt-2">
        {STATUS_STEPS.map((step, i) => (
          <div
            key={step.key}
            className={`h-2 flex-1 mr-1 rounded ${
              i <= idx ? step.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl mb-4 font-bold">Task Tracker</h2>

      {/* Add Task Form */}
      <div className="mb-4 p-4 bg-white border rounded shadow">
        <form onSubmit={addTask} className="space-y-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              title.trim() && desc.trim()
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!title.trim() || !desc.trim()}
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Active Tasks */}
      <h3 className="text-xl mb-2 font-semibold">Active Tasks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div
            key={task._id}
            className="p-4 bg-white border rounded shadow flex flex-col"
          >
            <div className="font-bold text-lg">
              {task.title}{" "}
              <span className="text-xs text-gray-500">({task.status})</span>
            </div>
            <div className="text-sm text-gray-600">{task.description}</div>

            {task.status === "checking" && (
              <div className="mt-2">
                <input
                  type="file"
                  onChange={e => handleFileUpload(task, e.target.files[0])}
                  className="text-sm"
                />
                {fileUploads[task._id] && (
                  <div className="text-xs text-green-600 mt-1">
                    Uploaded: {fileUploads[task._id]}
                  </div>
                )}
              </div>
            )}

            <ProgressBar status={task.status} />

            <div className="mt-3 flex gap-2">
              {task.status !== "completed" && (
                <button
                  onClick={() => nextStage(task)}
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                >
                  Next Stage
                </button>
              )}
              <button
                onClick={() => deleteTask(task)}
                className="border px-2 py-1 text-xs rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Completed History */}
      {history.length > 0 && (
        <>
          <h3 className="text-xl mt-6 mb-2 font-semibold">Completed History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map(task => (
              <div
                key={task._id}
                className="p-4 bg-green-50 border border-green-200 rounded shadow"
              >
                <div className="font-bold text-lg">{task.title}</div>
                <div className="text-sm text-gray-600">
                  {task.description}
                </div>
                <ProgressBar status="completed" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
