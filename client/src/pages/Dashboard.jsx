import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Clock, Trophy, Newspaper, ListChecks, TrendingUp, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import TechNews from "../components/TechNews";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading.jsx";
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Moved to ChartWidget
const ChartWidget = React.lazy(() => import("../components/ChartWidget"));
import { motion } from "framer-motion";

import CalendarWidget from "../components/CalendarWidget";
import { Quote } from "lucide-react";
import NotificationModal from "../components/NotificationModal";
import AiAssistant from "../components/AiAssistant";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [points, setPoints] = useState(0);
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [quote, setQuote] = useState({ text: "Focus on being productive instead of busy.", author: "Tim Ferriss" });
  const [showNotifications, setShowNotifications] = useState(false);
  const [dueTasks, setDueTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [t, u, h] = await Promise.all([
          api.get("/tasks"),
          api.get("/users/me"),
          api.get("/tasks/history")
        ]);

        const taskList = Array.isArray(t.data) ? t.data : (t.data.tasks || []);
        setTasks(taskList);
        setPoints(u.data.points || 0);
        setName(u.data.firstName || u.data.username || "");
        setProfilePic(u.data.profilePic || null);

        // Check for due tasks (due today or overdue)
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const due = taskList.filter(t => {
          if (t.status === 'completed' || !t.dueAt) return false;
          const dueDate = new Date(t.dueAt);
          return dueDate <= endOfDay;
        });

        if (due.length > 0) {
          setDueTasks(due);
          setShowNotifications(true);
        }

        // Process history for chart (last 7 days)
        const history = h.data || [];
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const data = last7Days.map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          completed: history.filter(h => h.completedAt && h.completedAt.startsWith(date)).length
        }));
        setChartData(data);

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
        <div className="w-16 h-6 bg-gray-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
      <div className="w-12 h-8 bg-gray-200 dark:bg-neutral-800 rounded mb-2"></div>
      <div className="w-24 h-4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-48 h-8 bg-gray-200 dark:bg-neutral-800 rounded"></div>
              <div className="w-64 h-4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 animate-pulse"></div>
          <div className="h-[300px] bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const pending = tasks.filter((t) => t.status !== "completed");
  const highPriority = pending.filter(t => t.priority === 'high');
  const dueSoon = pending.filter(t => t.dueAt && new Date(t.dueAt) < new Date(Date.now() + 24 * 60 * 60 * 1000));

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await api.post("/tasks", { title: newTaskTitle, priority: "medium" });
      setTasks([res.data, ...tasks]);
      setNewTaskTitle("");
      toast.success("Task added!");
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1800px] mx-auto"
    >
      {showNotifications && (
        <NotificationModal
          tasks={dueTasks}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Welcome Section - Humanoid Pill */}
      <motion.div variants={item} className="relative overflow-hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 dark:border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-2xl transition-all duration-500">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-700"></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="relative group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img
              src={profilePic || "/default-avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-[2rem] object-cover border-4 border-white dark:border-neutral-800 shadow-lg relative z-10"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-neutral-800 z-20 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{name}</span>! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
              You have <span className="text-blue-600 dark:text-blue-400 font-bold">{pending.length}</span> pending tasks. Let's make today count!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <form onSubmit={handleQuickAdd} className="flex-1 md:w-80 flex gap-2 bg-gray-50/50 dark:bg-neutral-800/50 p-2 rounded-[2rem] border border-gray-100 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Quick add a task..."
              className="flex-1 px-4 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all active:scale-95">
              Add
            </button>
          </form>

          <div className="hidden lg:flex items-center gap-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 px-6 py-3 rounded-[2rem] border border-orange-100 dark:border-orange-900/20 shadow-sm">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Points</p>
              <p className="text-xl font-black text-orange-700 dark:text-orange-300">{points}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Organic Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <ListChecks size={24} />, label: "Total Tasks", value: pending.length, color: "purple" },
          { icon: <AlertCircle size={24} />, label: "High Priority", value: highPriority.length, color: "red" },
          { icon: <Clock size={24} />, label: "Due Soon", value: dueSoon.length, color: "orange" },
          { icon: <TrendingUp size={24} />, label: "Completed", value: chartData.reduce((acc, curr) => acc + curr.completed, 0), color: "green" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 dark:border-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-[1.5rem] bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Updated just now</p>
          </div>
        ))}
      </motion.div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Row: Chart (8) & Calendar (4) */}
        <motion.div variants={item} className="lg:col-span-8 flex flex-col gap-6">
          <React.Suspense fallback={<div className="h-[400px] bg-gray-100 dark:bg-neutral-800 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] animate-pulse"></div>}>
            <div className="rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] overflow-hidden shadow-xl">
              <ChartWidget data={chartData} />
            </div>
          </React.Suspense>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-[1.5rem] rounded-br-[1.5rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
            <Quote className="absolute top-8 right-8 text-white/20" size={64} />
            <div className="relative z-10">
              <p className="text-2xl font-medium italic mb-4 leading-relaxed">"{quote.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                <p className="text-lg font-bold text-white/90">{quote.author}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-bl-[3rem] rounded-tr-[3rem] rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-white/20 dark:border-neutral-800 shadow-xl overflow-hidden h-full">
            <CalendarWidget tasks={tasks} />
          </div>
        </motion.div>

        {/* Bottom Row: AI Assistant (6) & Tech News (6) */}
        <motion.div variants={item} className="lg:col-span-6">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-[2rem] rounded-br-[2rem] border border-white/20 dark:border-neutral-800 shadow-xl overflow-hidden min-h-[400px] h-full">
            <AiAssistant />
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-6">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[2rem] rounded-bl-[2rem] border border-white/20 dark:border-neutral-800 shadow-xl flex flex-col h-full min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 px-2">
              <Newspaper size={20} className="text-purple-500" />
              Tech News
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <TechNews />
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="mt-12 text-center py-8 border-t border-gray-100 dark:border-neutral-800">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          © 2024 Smart Productivity Tracker <span className="w-1 h-1 bg-gray-300 rounded-full"></span> Crafted with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-bold text-gray-900 dark:text-white">Madhan Singh</span>
        </p>
      </footer>
    </motion.div>
  );
}
