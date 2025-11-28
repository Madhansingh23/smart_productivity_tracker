// src/pages/DecisionHelper.jsx
import React, { useState } from "react";
import { Star, Shuffle, Check, ArrowRight, Sparkles, BrainCircuit, Youtube, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../lib/api";

const PRESETS = [
  { label: "Prioritize Task", options: ["Do the hardest task first", "Clear small tasks", "Plan for tomorrow", "Take a break"] },
  { label: "Pick a Meal", options: ["Pizza", "Salad", "Burger", "Sushi", "Pasta", "Tacos"] },
  { label: "Weekend Activity", options: ["Read a book", "Go for a walk", "Watch a movie", "Learn something new", "Call a friend"] },
  { label: "Yes / No", options: ["Yes", "No", "Maybe", "Ask again later"] },
];

export default function DecisionHelper() {
  const [mode, setMode] = useState("random"); // 'random' or 'ai'

  // Random Picker State
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [decision, setDecision] = useState(null);

  // AI Solver State
  const [problem, setProblem] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [trialEnded, setTrialEnded] = useState(false); // Simulation toggle

  // Random Picker Logic
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, newTask]);
    setNewTask("");
  };

  const pickRandom = () => {
    if (tasks.length === 0) {
      toast.error("Add some tasks first!");
      return;
    }
    const random = tasks[Math.floor(Math.random() * tasks.length)];
    setDecision(random);
  };

  const clear = () => {
    setTasks([]);
    setDecision(null);
  };

  const loadPreset = (options) => {
    setTasks(options);
    setDecision(null);
    toast.success("Preset loaded!");
  };

  // AI Solver Logic
  const solveWithAi = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setLoadingAi(true);
    setAiResult(null);

    try {
      const res = await api.post("/ai/solve", { problem });
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI solution");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Star className="text-yellow-500" size={32} />
          Decision Helper
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Can't decide? Let fate or AI help you out.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode("random")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${mode === "random"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
            }`}
        >
          Random Picker
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${mode === "ai"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
            }`}
        >
          <BrainCircuit size={16} /> AI Solver
        </button>
      </div>

      {mode === "random" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(preset.options)}
                className="p-3 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition shadow-sm"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800">
            <form onSubmit={addTask} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a task option..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition"
              >
                Add
              </button>
            </form>

            {tasks.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Sparkles size={14} /> Your Options ({tasks.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tasks.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-700 dark:text-gray-300 text-sm animate-in fade-in zoom-in duration-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                <p>No options added yet. Type one above or pick a preset!</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={pickRandom}
                disabled={tasks.length === 0}
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle /> Pick for Me
              </button>
              <button
                onClick={clear}
                className="px-6 py-4 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
              >
                Clear
              </button>
            </div>

            {decision && (
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl text-center animate-in zoom-in duration-300">
                <p className="text-sm text-green-600 dark:text-green-400 font-bold uppercase mb-2">Fate has spoken</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                  <Check className="text-green-500" />
                  {decision}
                </h2>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800">

            {/* Simulation Toggle */}
            <div className="flex justify-end mb-4">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trialEnded}
                  onChange={(e) => setTrialEnded(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Simulate Trial Ended
              </label>
            </div>

            <form onSubmit={solveWithAi} className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your problem or dilemma
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., I'm feeling overwhelmed with tasks and don't know where to start..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white h-32 resize-none mb-4"
              />
              <button
                type="submit"
                disabled={loadingAi || !problem.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAi ? (
                  <>Thinking...</>
                ) : (
                  <><BrainCircuit /> Solve with AI</>
                )}
              </button>
            </form>

            {aiResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* AI Text Answer - Only if Trial Active */}
                {!trialEnded ? (
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                      <Sparkles size={20} /> AI Solution
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                      {aiResult.answer}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl text-center">
                    <Lock className="mx-auto text-gray-400 mb-2" size={32} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      AI Trial Ended
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      Upgrade to Premium to get personalized AI solutions.
                      <br />Don't worry, we still found some helpful videos for you!
                    </p>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                      Upgrade Now
                    </button>
                  </div>
                )}

                {/* YouTube Recommendations - Always Visible */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Youtube className="text-red-600" size={24} />
                    {trialEnded ? "Recommended Videos (Free)" : "Related Videos"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiResult.videos.map((video, idx) => (
                      <a
                        key={idx}
                        href={video.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group block bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-gray-100 dark:border-neutral-700 hover:shadow-md transition-all"
                      >
                        <div className="relative aspect-video bg-gray-200 dark:bg-neutral-700">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Youtube className="text-red-600 ml-1" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {video.channel}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
