import React, { useState } from 'react';
import { Send, Bot, Youtube, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiAssistant() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/ai/solve', { problem: query });
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        AI Assistant <Sparkles size={16} className="text-yellow-500" />
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything & get video guides</p>
                </div>
            </div>

            <form onSubmit={handleAsk} className="relative mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="How do I center a div?"
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={loading || !query}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* AI Answer */}
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                    {result.answer}
                                </p>
                            </div>

                            {/* Video Recommendations */}
                            {result.videos && result.videos.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Youtube size={16} className="text-red-600" />
                                        Recommended Videos
                                    </h4>
                                    <div className="space-y-3">
                                        {result.videos.map((video, idx) => (
                                            <a
                                                key={idx}
                                                href={video.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors group"
                                            >
                                                <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {video.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{video.channel}</p>
                                                </div>
                                                <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!result && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-10 opacity-50">
                        <Bot size={48} strokeWidth={1} />
                        <p className="text-sm">Ask for help with code, productivity, or life!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
