// src/pages/TasksPage.jsx
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api, { getTasksFast, invalidateTasksCache } from "../lib/api.js";
import {
  Trash2, RotateCcw, CheckCircle2, Archive, Plus, Calendar,
  AlertCircle, Clock, Upload, X, LayoutGrid, List, Tag, CheckSquare
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../components/Loading.jsx";

const STEPS = ["created", "in-progress", "checking", "completed"];
const COLUMNS = {
  created: { label: "To Do", color: "bg-gray-100 dark:bg-neutral-800", border: "border-gray-200 dark:border-neutral-700" },
  "in-progress": { label: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  checking: { label: "Review", color: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  completed: { label: "Done", color: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'list'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofFile, setProofFile] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "med",
    dueAt: "",
    remindAt: "",
    notifyAt: "",
    tags: "",
    subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getTasksFast();
      setTasks(Array.isArray(data) ? data : (data.tasks || []));
    } finally {
      setLoading(false);
    }
  }

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setNewTask(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtask, completed: false }]
    }));
    setNewSubtask("");
  };

  const removeSubtask = (index) => {
    setNewTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await api.post("/tasks", taskData);
      setTasks((prev) => [res.data, ...prev]);
      setNewTask({ title: "", description: "", priority: "med", dueAt: "", remindAt: "", notifyAt: "", tags: "", subtasks: [] });
      setIsCreateModalOpen(false);
      invalidateTasksCache();
      toast.success("Task created successfully!");
    } catch {
      toast.error("Failed to create task");
    }
  }

  async function handleDragEnd(result) {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // Optimistic update
    const updatedTasks = tasks.map(t =>
      t._id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTasks(updatedTasks);

    if (destination.droppableId === "completed") {
      setSelectedTask(task);
      setIsCompleteModalOpen(true);
    }

    try {
      await api.put(`/tasks/${task._id}`, { status: destination.droppableId });
      invalidateTasksCache();
    } catch {
      toast.error("Failed to update task status");
      load(); // Revert on error
    }
  }

  async function handleCompleteWithProof(e) {
    e.preventDefault();
    if (!selectedTask) return;

    const formData = new FormData();
    if (proofFile) formData.append("proof", proofFile);
    formData.append("status", "completed");

    try {
      await api.put(`/tasks/${selectedTask._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTasks(prev => prev.map(t =>
        t._id === selectedTask._id ? { ...t, status: "completed", proof: proofFile ? "uploaded" : null } : t
      ));

      setIsCompleteModalOpen(false);
      setProofFile(null);
      setSelectedTask(null);
      invalidateTasksCache();
      toast.success("Task completed with proof! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload proof");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      invalidateTasksCache();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage and track your progress</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-all ${viewMode === "kanban" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-gray-500"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-gray-500"}`}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 min-w-[1000px] h-full pb-4">
              {STEPS.map((step) => (
                <Droppable key={step} droppableId={step}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col rounded-xl ${COLUMNS[step].color} p-4 border ${COLUMNS[step].border}`}
                    >
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex justify-between items-center">
                        {COLUMNS[step].label}
                        <span className="bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs shadow-sm">
                          {tasks.filter(t => t.status === step).length}
                        </span>
                      </h3>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {tasks
                          .filter(t => t.status === step)
                          .map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow group"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                      task.priority === 'low' ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                      }`}>
                                      {task.priority}
                                    </span>
                                    <button
                                      onClick={() => handleDelete(task._id)}
                                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  <h4
                                    onClick={() => { setSelectedTask(task); setIsDetailsModalOpen(true); }}
                                    className="font-medium text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                  >
                                    {task.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{task.description}</p>

                                  {/* Tags */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {task.tags.map((tag, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded-md">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Subtasks Progress */}
                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="mb-3">
                                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                        <span>Subtasks</span>
                                        <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                                      </div>
                                      <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-blue-500 rounded-full"
                                          style={{ width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                      {task.dueAt && (
                                        <div className="flex items-center gap-1">
                                          <Calendar size={12} />
                                          {new Date(task.dueAt).toLocaleDateString()}
                                        </div>
                                      )}
                                      {task.proof && (
                                        <div className="flex items-center gap-1 text-emerald-500" title="Proof Uploaded">
                                          <CheckCircle2 size={12} />
                                        </div>
                                      )}
                                    </div>

                                    <button
                                      onClick={async () => {
                                        if (!confirm("Archive this task?")) return;
                                        try {
                                          await api.post(`/tasks/${task._id}/archive`);
                                          setTasks(prev => prev.filter(t => t._id !== task._id));
                                          invalidateTasksCache();
                                          toast.success("Task archived");
                                        } catch {
                                          toast.error("Failed to archive");
                                        }
                                      }}
                                      className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Archive"
                                    >
                                      <Archive size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
          {tasks.map(task => (
            <div key={task._id} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold">{task.title}</h4>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full">{task.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{task.description}</p>

              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {task.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={async () => {
                    if (!confirm("Archive this task?")) return;
                    try {
                      await api.post(`/tasks/${task._id}/archive`);
                      setTasks(prev => prev.filter(t => t._id !== task._id));
                      invalidateTasksCache();
                      toast.success("Task archived");
                    } catch {
                      toast.error("Failed to archive");
                    }
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  title="Archive"
                >
                  <Archive size={16} />
                </button>
                <button onClick={() => handleDelete(task._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  required
                  className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-blue-500">
                  <Tag size={16} className="text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none"
                    placeholder="work, study, urgent"
                    value={newTask.tags}
                    onChange={e => setNewTask({ ...newTask, tags: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtasks</label>
                <div className="space-y-2 mb-2">
                  {newTask.subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg">
                      <CheckSquare size={14} className="text-gray-400" />
                      <span className="flex-1 truncate">{st.title}</span>
                      <button type="button" onClick={() => removeSubtask(i)} className="text-red-500 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask(e)}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="med">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                    value={newTask.dueAt}
                    onChange={e => setNewTask({ ...newTask, dueAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Notify At</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                    value={newTask.notifyAt}
                    onChange={e => setNewTask({ ...newTask, notifyAt: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors mt-4">
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 /> Complete Task
              </h2>
              <p className="text-sm text-gray-500 mt-1">Great job! Upload proof to earn extra points.</p>
            </div>

            <form onSubmit={handleCompleteWithProof} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*,application/pdf"
                  onChange={e => setProofFile(e.target.files[0])}
                />
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {proofFile ? proofFile.name : "Click to upload proof"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Images or PDF (Optional)</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                >
                  Complete Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-start sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedTask.title}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${selectedTask.priority === 'high' ? 'bg-red-100 text-red-600' :
                    selectedTask.priority === 'low' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                    {selectedTask.priority}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-600 dark:text-gray-400">
                    {selectedTask.status}
                  </span>
                </div>
              </div>
              <button onClick={() => { setIsDetailsModalOpen(false); setSelectedTask(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              {/* Subtasks */}
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subtasks</h3>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-xl">
                        <div className={`p-1 rounded-full ${st.completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-neutral-700'}`}>
                          <CheckSquare size={14} />
                        </div>
                        <span className={st.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Upload size={16} /> Proof of Work
                </h3>

                {selectedTask.proof ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-full text-emerald-600 dark:text-emerald-200">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Proof Uploaded</p>
                      <a
                        href={`http://localhost:5000${selectedTask.proof}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        View Proof
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors relative group">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append("proof", file);

                        try {
                          const res = await api.put(`/tasks/${selectedTask._id}`, formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          setTasks(prev => prev.map(t => t._id === selectedTask._id ? res.data : t));
                          setSelectedTask(res.data);
                          toast.success("Proof uploaded successfully!");
                        } catch (err) {
                          toast.error("Failed to upload proof");
                        }
                      }}
                    />
                    <Upload className="mx-auto text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Drag & drop or click to upload proof
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Earn +2 bonus points!</p>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <div>
                  <span className="block font-medium mb-1">Created</span>
                  {new Date(selectedTask.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="block font-medium mb-1">Due Date</span>
                  {selectedTask.dueAt ? new Date(selectedTask.dueAt).toLocaleDateString() : "No due date"}
                </div>
                {selectedTask.tags && (
                  <div className="col-span-2">
                    <span className="block font-medium mb-1">Tags</span>
                    <div className="flex gap-2">
                      {selectedTask.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-md">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 flex justify-end gap-3">
              <button
                onClick={async () => {
                  if (!confirm("Archive this task?")) return;
                  try {
                    await api.post(`/tasks/${selectedTask._id}/archive`);
                    setTasks(prev => prev.filter(t => t._id !== selectedTask._id));
                    setIsDetailsModalOpen(false);
                    toast.success("Task archived");
                  } catch {
                    toast.error("Failed to archive");
                  }
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-2"
              >
                <Archive size={18} /> Archive
              </button>
              <button
                onClick={() => { setIsDetailsModalOpen(false); setSelectedTask(null); }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-6 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-neutral-800">
        © All rights reserved by <b>Madhan Singh</b> | Call: +91 6382703678
      </footer>
    </div>
  );
}
