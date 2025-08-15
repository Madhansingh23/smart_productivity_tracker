import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Clock3, Trophy, Newspaper, ListChecks } from "lucide-react";
import TechNews from "../components/TechNews";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [points, setPoints] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const t = await api.get("/tasks");
        setTasks(t.data || []);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const uRaw = localStorage.getItem("user");
      if (uRaw) {
        const u = JSON.parse(uRaw);
        setPoints(u.points || 0);
        setName(u.name || "");
      }
    } catch {}
  }, []);

  const pending = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Welcome Section */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Welcome{ name ? `, ${name}` : "" } 👋
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Here’s a quick snapshot of your productivity.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {/* Today */}
        <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <Clock3 size={18} /> Today
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Pending Tasks Count */}
        <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <ListChecks size={18} /> Pending Tasks
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">Keep going!</div>
        </div>

        {/* Points */}
        <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <Trophy size={18} /> Points
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{points}</div>
          <div className="text-xs text-gray-500 mt-1">
            Earn by finishing on time
          </div>
        </div>
      </div>

      {/* Tech News Row */}
      <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition mb-5 sm:mb-6">
        <div className="flex items-center gap-2 font-semibold text-sm sm:text-base mb-2">
          <Newspaper size={18} /> Tech News
        </div>
        <TechNews />
      </div>

      {/* Pending Tasks List */}
      <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold mb-3">
          Incomplete Tasks
        </h3>
        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending tasks 🎉</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
            {pending.map((task) => (
              <li key={task.id} className="text-gray-700">
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
