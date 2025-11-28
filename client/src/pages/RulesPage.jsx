// src/pages/RulesPage.jsx
import React from "react";
import { BookOpen, CheckCircle2, AlertTriangle, Star, Zap, Clock, Shield } from "lucide-react";

export default function RulesPage() {
    const sections = [
        {
            title: "Core Principles",
            icon: <Star className="text-yellow-500" />,
            rules: [
                "Honesty is key. Only mark tasks as complete when they are truly done.",
                "Quality over quantity. Focus on completing tasks well rather than rushing.",
                "Consistency builds habits. Try to log in and complete at least one task daily.",
            ],
        },
        {
            title: "Task Management",
            icon: <CheckCircle2 className="text-green-500" />,
            rules: [
                "Break large tasks into smaller, manageable subtasks.",
                "Use tags to categorize your tasks (e.g., 'Work', 'Study', 'Health').",
                "Set realistic due dates to avoid burnout.",
                "Upload proof for important tasks to earn bonus points.",
            ],
        },
        {
            title: "Points & Gamification",
            icon: <Zap className="text-blue-500" />,
            rules: [
                "Create a Task: +1 Point",
                "Complete a Task: +4 Points",
                "Upload Proof: +2 Bonus Points",
                "Delete a Task: -1 Point (Think before you create!)",
                "Climb the leaderboard by accumulating points consistently.",
            ],
        },
        {
            title: "Focus & Productivity",
            icon: <Clock className="text-purple-500" />,
            rules: [
                "Use the Pomodoro timer for focused work sessions (25m work / 5m break).",
                "Try 'Focus Mode' for a distraction-free environment.",
                "Take regular breaks to maintain mental clarity.",
            ],
        },
        {
            title: "Account & Security",
            icon: <Shield className="text-red-500" />,
            rules: [
                "Keep your password secure and do not share your account.",
                "Update your profile with a valid email for account recovery.",
                "Report any bugs or issues via the Contact page.",
            ],
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Rules & Guidelines
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                    Master your productivity journey by following these core principles.
                    Consistency, honesty, and focus are your keys to success.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {sections.map((section, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                {React.cloneElement(section.icon, { size: 28 })}
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                {section.title}
                            </h3>
                        </div>
                        <ul className="space-y-4">
                            {section.rules.map((rule, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl shadow-xl text-white flex items-start gap-6 transform hover:scale-[1.01] transition-transform">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <AlertTriangle className="text-white" size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-2xl mb-2">
                        Honor Code
                    </h4>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        These rules are designed to help you build better habits. Cheating the system only cheats yourself out of real progress. Stay consistent, stay honest, and watch yourself grow!
                    </p>
                </div>
            </div>
        </div>
    );
}
