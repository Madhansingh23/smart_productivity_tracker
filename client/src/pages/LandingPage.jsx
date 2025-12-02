import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, User, Zap, Shield, Globe } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LandingPage() {
    const navigate = useNavigate();
    const { setToken, setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleGuestLogin = async () => {
        try {
            setLoading(true);
            const res = await api.post('/auth/guest');
            setToken(res.data.token);
            setUser(res.data.user);
            toast.success('Welcome, Guest!');
            navigate('/'); // Will redirect to dashboard via PrivateRoute/App logic
        } catch (err) {
            console.error(err);
            toast.error('Failed to start guest session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center min-h-screen text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 border border-blue-100 dark:border-blue-800">
                        <Zap size={16} />
                        <span>Boost your productivity today</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        Smart Productivity <br /> Tracker
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Manage tasks, track habits, and achieve your goals with an AI-powered productivity companion designed for modern life.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto"
                >
                    <button
                        onClick={() => navigate('/login')}
                        className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
                    >
                        Get Started
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="flex-1 px-8 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <User size={20} />
                                Guest Check
                            </>
                        )}
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
                >
                    {[
                        { icon: <CheckCircle2 className="text-green-500" />, title: "Task Management", desc: "Organize your life with intuitive task boards and lists." },
                        { icon: <Shield className="text-blue-500" />, title: "Secure & Private", desc: "Your data is encrypted and safe. Privacy first approach." },
                        { icon: <Globe className="text-purple-500" />, title: "Access Anywhere", desc: "Sync across all your devices seamlessly." }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white/50 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800 backdrop-blur-sm">
                            <div className="mb-4 w-12 h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center mx-auto">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
