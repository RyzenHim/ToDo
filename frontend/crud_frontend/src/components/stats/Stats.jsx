import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444"];

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/user/mytasks", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                setStats(res.data);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <LoadingScreen />;
    if (!stats) return null;

    /* ---------------- DATA ---------------- */
    const statusData = [
        { name: "Assigned To Me", value: stats.countTaskAssignedToMe },
        { name: "Assigned By Me", value: stats.countTaskAssignedByMe }
    ];

    const byPersonToMe = stats.taskByPersonsToMe.map(u => ({
        name: u.name,
        tasks: u.taskCount
    }));

    const byPersonByMe = stats.taskByPersonsByMe.map(u => ({
        name: u.name,
        tasks: u.taskCount
    }));

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white pt-14">

            {/* ---------- AURORA BACKGROUND ---------- */}
            <div className="absolute inset-[-40%] bg-[conic-gradient(from_180deg_at_50%_50%,#312e81,#0f172a,#020617,#312e81)] animate-[spin_40s_linear_infinite] opacity-40" />
            <div className="absolute inset-0 backdrop-blur-[120px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">

                {/* ---------- HEADER ---------- */}
                <div className="mb-12">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Real-time insights into your task performance
                    </p>
                </div>

                {/* ---------- STATS ---------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                    <GlassStat title="Assigned To Me" value={stats.countTaskAssignedToMe} />
                    <GlassStat title="Assigned By Me" value={stats.countTaskAssignedByMe} />
                    <GlassStat title="Users" value={stats.userList.length} />
                    <GlassStat
                        title="Total Tasks"
                        value={stats.assignedToMe.length + stats.assignedByMe.length}
                    />
                </div>

                {/* ---------- CHARTS ---------- */}
                <div className="grid lg:grid-cols-2 gap-10">

                    {/* PIE */}
                    <GlassCard title="Task Distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={65}
                                    outerRadius={95}
                                >
                                    {statusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: "rgba(15,23,42,.9)",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        borderRadius: "12px"
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* BAR – TO ME */}
                    <GlassCard title="Tasks Assigned To Me By">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={byPersonToMe}>
                                <XAxis dataKey="name" tick={{ fill: "#cbd5f5" }} />
                                <YAxis tick={{ fill: "#cbd5f5" }} />
                                <Tooltip
                                    contentStyle={{
                                        background: "rgba(15,23,42,.9)",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        borderRadius: "12px"
                                    }}
                                />
                                <Bar dataKey="tasks" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* BAR – BY ME */}
                    <GlassCard title="Tasks I Assigned To">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={byPersonByMe}>
                                <XAxis dataKey="name" tick={{ fill: "#cbd5f5" }} />
                                <YAxis tick={{ fill: "#cbd5f5" }} />
                                <Tooltip
                                    contentStyle={{
                                        background: "rgba(15,23,42,.9)",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        borderRadius: "12px"
                                    }}
                                />
                                <Bar dataKey="tasks" fill="#22c55e" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
};

/* ---------------- UI SYSTEM ---------------- */

const GlassStat = ({ title, value }) => (
    <div className="
    relative overflow-hidden
    bg-white/10 backdrop-blur-xl
    border border-white/20
    rounded-2xl p-6
    shadow-[0_30px_80px_rgba(0,0,0,.6)]
    hover:-translate-y-1 transition
  ">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <p className="text-sm text-gray-300">{title}</p>
        <h2 className="text-3xl font-semibold mt-2">{value}</h2>
    </div>
);

const GlassCard = ({ title, children }) => (
    <div className="
    relative overflow-hidden
    bg-white/10 backdrop-blur-xl
    border border-white/20
    rounded-3xl p-6
    shadow-[0_40px_120px_rgba(0,0,0,.7)]
  ">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <h2 className="relative text-lg font-medium mb-5">{title}</h2>
        <div className="relative">{children}</div>
    </div>
);

/* ---------------- LOADING ---------------- */

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="animate-pulse text-lg tracking-wide">
            Loading analytics…
        </div>
    </div>
);

export default Stats;