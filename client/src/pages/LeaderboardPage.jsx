// src/pages/LeaderboardPage.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import Loading from "../components/Loading";
import { Trophy, Medal, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LeaderboardPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        api.get("/leaderboard")
            .then((res) => setUsers(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading />;

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-bold text-gray-500 w-6 text-center">{rank}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-4 mb-4">
                    <Trophy className="text-yellow-500" size={40} />
                    Global Leaderboard
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    See who's leading the productivity charge!
                </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-3 text-right">Points</div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {users.map((u) => (
                        <div
                            key={u._id}
                            className={`grid grid-cols-12 gap-4 items-center p-6 transition-all hover:bg-gray-50 dark:hover:bg-neutral-800/50 ${u._id === currentUser?._id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                }`}
                        >
                            <div className="col-span-2 flex justify-center">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${u.rank === 1 ? "bg-yellow-100 text-yellow-600" :
                                        u.rank === 2 ? "bg-gray-100 text-gray-600" :
                                            u.rank === 3 ? "bg-amber-100 text-amber-700" :
                                                "text-gray-500"
                                    }`}>
                                    {u.rank <= 3 ? getRankIcon(u.rank) : u.rank}
                                </div>
                            </div>

                            <div className="col-span-7 flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={u.profilePic || "/default-avatar.png"}
                                        alt={u.username}
                                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-neutral-700 shadow-sm"
                                    />
                                    {u.rank === 1 && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white p-1 rounded-full shadow-sm">
                                            <Crown size={12} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                        {u.firstName ? `${u.firstName} ${u.lastName || ""}` : u.username}
                                        {u._id === currentUser?._id && (
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {u.badges?.length > 0 ? `${u.badges.length} Badges Earned` : "Rookie"}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-3 text-right">
                                <span className="block font-bold text-2xl text-blue-600 dark:text-blue-400">
                                    {u.points}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {users.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No users found. Be the first to earn points!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
