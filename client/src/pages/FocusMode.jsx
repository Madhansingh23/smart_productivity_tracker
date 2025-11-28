// src/pages/FocusMode.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Maximize2, Minimize2, Play, Pause, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { toast } from "react-hot-toast";

export default function FocusMode() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            toast.success("Focus session complete! Take a break.");
            new Audio("/notification.mp3").play().catch(() => { }); // Simple fallback if file exists
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const fetchTasks = async () => {
        try {
            const res = await api.get("/tasks");
            const pending = (Array.isArray(res.data) ? res.data : res.data.tasks || [])
                .filter(t => t.status !== "completed");
            setTasks(pending);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const completeTask = async () => {
        if (!activeTask) return;
        try {
            await api.put(`/tasks/${activeTask._id}`, { status: "completed" });
            toast.success("Task completed! +4 Points");
            setTasks(prev => prev.filter(t => t._id !== activeTask._id));
            setActiveTask(null);
            setIsActive(false);
            setTimeLeft(25 * 60);
        } catch (err) {
            toast.error("Failed to complete task");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900 z-0"></div>

            {/* Header */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Exit Focus
                </button>
            </div>

            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
            </div>

            {/* Main Content */}
            <div className="z-10 text-center max-w-2xl w-full">
                {!activeTask ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-bold mb-8">What are you working on?</h1>
                        <div className="grid gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500">No pending tasks. You're all caught up!</p>
                            ) : (
                                tasks.map(task => (
                                    <button
                                        key={task._id}
                                        onClick={() => setActiveTask(task)}
                                        className="p-4 bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 rounded-xl text-left transition-all group"
                                    >
                                        <span className="font-medium group-hover:text-blue-400 transition-colors">{task.title}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="mb-8">
                            <span className="text-blue-400 text-sm font-bold tracking-wider uppercase">Now Focusing On</span>
                            <h2 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">{activeTask.title}</h2>
                        </div>

                        <div className="text-[120px] md:text-[180px] font-mono font-bold leading-none tracking-tighter mb-12 tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={toggleTimer}
                                className={`p-6 rounded-full transition-all transform hover:scale-105 ${isActive ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                            </button>

                            <button
                                onClick={completeTask}
                                className="p-6 rounded-full bg-green-600 hover:bg-green-700 text-white transition-all transform hover:scale-105"
                                title="Complete Task"
                            >
                                <CheckCircle2 size={32} />
                            </button>
                        </div>

                        <button
                            onClick={() => { setActiveTask(null); setIsActive(false); setTimeLeft(25 * 60); }}
                            className="mt-12 text-gray-500 hover:text-white transition-colors text-sm"
                        >
                            Switch Task
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
