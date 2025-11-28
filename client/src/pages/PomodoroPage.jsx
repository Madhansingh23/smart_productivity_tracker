// src/pages/PomodoroPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, Volume2, VolumeX } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PomodoroPage() {
    const [mode, setMode] = useState("focus"); // focus, shortBreak, longBreak
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const intervalRef = useRef(null);

    const MODES = {
        focus: { time: 25 * 60, label: "Focus Time", color: "text-blue-500", stroke: "#3b82f6", bg: "from-blue-500/20 to-blue-600/5" },
        shortBreak: { time: 5 * 60, label: "Short Break", color: "text-emerald-500", stroke: "#10b981", bg: "from-emerald-500/20 to-emerald-600/5" },
        longBreak: { time: 15 * 60, label: "Long Break", color: "text-purple-500", stroke: "#a855f7", bg: "from-purple-500/20 to-purple-600/5" },
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(intervalRef.current);
            if (soundEnabled) {
                // Simple beep using AudioContext or just a toast for now
                const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
                audio.play().catch(e => console.log("Audio play failed", e));
            }
            toast.success(`${MODES[mode].label} completed!`);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, timeLeft, mode, soundEnabled]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(MODES[newMode].time);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Circular Progress Calculation
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3 mb-2">
                    <Timer className={MODES[mode].color} size={40} />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Pomodoro Timer
                    </span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    Master your time, master your life.
                </p>
            </div>

            <div className="relative w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${MODES[mode].bg} rounded-[3rem] blur-3xl opacity-50 transition-all duration-700`}></div>

                <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/20 dark:border-neutral-800 flex flex-col items-center">

                    {/* Mode Switcher */}
                    <div className="flex p-1 bg-gray-100 dark:bg-neutral-800 rounded-full mb-8 relative z-10">
                        {Object.keys(MODES).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${mode === m
                                        ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-md scale-105"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {MODES[m].label}
                            </button>
                        ))}
                    </div>

                    {/* Circular Timer */}
                    <div className="relative mb-8 group">
                        <svg width="300" height="300" className="transform -rotate-90">
                            {/* Background Circle */}
                            <circle
                                cx="150"
                                cy="150"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-gray-100 dark:text-neutral-800"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="150"
                                cy="150"
                                r={radius}
                                stroke={MODES[mode].stroke}
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>

                        {/* Time Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={`text-7xl font-bold font-mono tracking-tighter ${MODES[mode].color} drop-shadow-sm`}>
                                {formatTime(timeLeft)}
                            </div>
                            <p className="text-gray-400 font-medium mt-2 tracking-widest uppercase text-sm">
                                {isActive ? "Running" : "Paused"}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-3 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            title={soundEnabled ? "Mute" : "Unmute"}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>

                        <button
                            onClick={toggleTimer}
                            className={`p-6 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-xl flex items-center justify-center ${isActive
                                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                                    : `bg-gradient-to-r ${mode === 'focus' ? 'from-blue-500 to-blue-600' : mode === 'shortBreak' ? 'from-emerald-500 to-emerald-600' : 'from-purple-500 to-purple-600'} text-white shadow-lg shadow-blue-500/30`
                                }`}
                        >
                            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>

                        <button
                            onClick={resetTimer}
                            className="p-3 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            title="Reset"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-12 flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-full border border-gray-100 dark:border-neutral-800 text-sm text-gray-600 dark:text-gray-400">
                {mode === "focus" ? <Brain size={18} className="text-blue-500" /> : <Coffee size={18} className="text-emerald-500" />}
                <span>
                    {mode === "focus"
                        ? "Tip: Eliminate all distractions for deep work."
                        : "Tip: Step away from the screen and stretch."}
                </span>
            </div>
        </div>
    );
}
