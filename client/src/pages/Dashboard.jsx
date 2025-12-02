import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Clock, Trophy, Newspaper, ListChecks, TrendingUp, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import TechNews from "../components/TechNews";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading.jsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      className="space-y-4"
    >
      {showNotifications && (
        <NotificationModal
          tasks={dueTasks}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Welcome Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profilePic || "/default-avatar.png"}
              alt="avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-neutral-700 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {name}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              You have {pending.length} pending tasks today. Let's crush them!
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickAdd} className="flex-1 max-w-md flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Quick add a task..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
            Add
          </button>
        </form>

        <div className="hidden md:flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
          <Trophy className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Points</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{points}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <ListChecks size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-600 dark:text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pending.length}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-600 dark:text-gray-400">Urgent</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{highPriority.length}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-600 dark:text-gray-400">Due Soon</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dueSoon.length}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Due within 24h</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-600 dark:text-gray-400">Weekly</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData.reduce((acc, curr) => acc + curr.completed, 0)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed this week</p>
        </div>
      </motion.div>

      {/* Main Grid: Chart, Calendar, News, AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Chart & Quote */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4 flex flex-col">
          {/* Activity Chart */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Productivity Trend
            </h3>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Quote */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
            <Quote className="absolute top-4 right-4 text-white/20" size={48} />
            <p className="text-lg font-medium italic mb-2 relative z-10">"{quote.text}"</p>
            <p className="text-sm text-white/80 relative z-10">— {quote.author}</p>
          </div>
        </motion.div>

        {/* Right Column: Calendar & News */}
        <motion.div variants={item} className="space-y-4 flex flex-col">
          {/* Calendar Widget */}
          <div className="flex-1">
            <CalendarWidget tasks={tasks} />
          </div>

          {/* AI Assistant - NEW */}
          <div className="flex-1 min-h-[300px]">
            <AiAssistant />
          </div>

          {/* Tech News */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Newspaper size={20} className="text-purple-500" />
              Tech News
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[250px]">
              <TechNews />
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 py-6 border-t border-gray-100 dark:border-neutral-800">
        <p>© 2024 Smart Productivity Tracker. Crafted with ❤️ by <span className="font-semibold text-gray-900 dark:text-white">Madhan Singh</span></p>
      </footer>
    </motion.div>
  );
}
