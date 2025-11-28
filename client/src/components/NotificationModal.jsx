import React from 'react';
import { X, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationModal({ tasks, onClose }) {
    const navigate = useNavigate();

    if (!tasks || tasks.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-neutral-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={100} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Clock className="animate-pulse" /> Daily Briefing
                        </h2>
                        <p className="text-blue-100 mt-1">
                            You have {tasks.length} tasks requiring attention today.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Task List */}
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            className="group p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                        task.priority === 'med' ? 'bg-blue-100 text-blue-600' :
                                            'bg-green-100 text-green-600'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <AlertCircle size={14} className="text-orange-500" />
                                <span>Due: {new Date(task.dueAt).toLocaleString()}</span>
                            </div>

                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/tasks');
                                }}
                                className="w-full py-2 bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all flex items-center justify-center gap-2"
                            >
                                View Task <ArrowRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
