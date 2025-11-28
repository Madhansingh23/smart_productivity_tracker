// src/components/CalendarWidget.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";

export default function CalendarWidget({ tasks }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    // Padding for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const today = new Date();

    return (
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <CalIcon size={16} className="text-blue-500" />
                    {monthNames[month]} {year}
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-400 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1">
                {days.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;

                    const dateStr = date.toISOString().split('T')[0];
                    const dayTasks = tasks.filter(t => t.dueAt && t.dueAt.startsWith(dateStr));
                    const isToday = date.toDateString() === today.toDateString();
                    const hasTasks = dayTasks.length > 0;

                    return (
                        <div
                            key={i}
                            className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs relative group
                                ${isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'}
                                ${hasTasks && !isToday ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}
                            `}
                        >
                            {date.getDate()}
                            {hasTasks && (
                                <div className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-blue-500'}`} />
                            )}

                            {/* Tooltip for tasks */}
                            {hasTasks && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                    {dayTasks.slice(0, 3).map(t => (
                                        <div key={t._id} className="truncate">• {t.title}</div>
                                    ))}
                                    {dayTasks.length > 3 && <div>+{dayTasks.length - 3} more</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
