import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ChartWidget({ data }) {
    const hasData = data && data.length > 0 && data.some(d => d.completed > 0);

    return (
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] border border-white/20 dark:border-neutral-800 shadow-xl flex-1 flex flex-col relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors duration-500"></div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-500">
                    <TrendingUp size={24} />
                </div>
                Productivity Trend
            </h3>

            <div className="flex-1 min-h-[300px] w-full relative">
                {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 z-10">
                        <p>No activity yet. Complete a task to see trends!</p>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                            }}
                            cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            stroke="#3B82F6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
