import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Clock3, Trophy, Newspaper, ListChecks } from "lucide-react";
import TechNews from "../components/TechNews";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";
import SkeletonCard from "../components/SkeletonCard";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [points, setPoints] = useState(0);
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch tasks + user
  useEffect(() => {
    (async () => {
      try {
         const t = await api.get("/tasks");
         const u = await api.get("/users/me");

        setTasks(t.data || []);
        setPoints(u.data.points || 0);
        setName(u.data.firstName || u.data.username || "");
        setProfilePic(u.data.profilePic || null);

        localStorage.setItem("user", JSON.stringify(u.data));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function advance(t) {
    try {
      const res = await api.post(`/api/tasks/${t._id}/advance`);
      const { task, user } = res.data;

      setTasks((ts) => ts.map((x) => (x._id === task._id ? task : x)));
      setPoints(user.points || 0);
      setProfilePic(user.profilePic || null);

      toast.success(
        task.status === "completed"
          ? `🎉 Task "${task.title}" completed!`
          : `Task moved to ${task.status}`
      );
    } catch {
      toast.error("Failed to advance");
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <Loading text="Loading your dashboard..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const pending = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 text-neutral-900 dark:text-neutral-100">
      {/* Welcome Section */}
      <div className="mb-5 sm:mb-6 flex items-center gap-3">
        <img
          src={profilePic || "/default-avatar.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome{name ? `, ${name}` : ""} 👋
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
            Here’s a quick snapshot of your productivity.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Today */}
        <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <Clock3 size={18} /> Today
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <ListChecks size={18} /> Pending Tasks
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{pending.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Keep going!</div>
        </div>

        {/* Points */}
        <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <Trophy size={18} /> Points
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{points}</div>
          <div className="text-xs text-neutral-500 mt-1">Earn by finishing tasks</div>
        </div>
      </div>

      {/* Tech News */}
      <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 font-semibold text-sm sm:text-base mb-2">
          <Newspaper size={18} /> Tech News
        </div>
        <TechNews />
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Incomplete Tasks</h3>
        {pending.length === 0 ? (
          <p className="text-neutral-500 text-sm">No pending tasks 🎉</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
            {pending.map((task) => (
              <li key={task._id} className="text-neutral-700 dark:text-neutral-300">
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
