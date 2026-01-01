import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("User");
    const [countTaskAssignedToMe, setCountTaskAssignedToMe] = useState("")
    const [countTaskAssignedByMe, setCountTaskAssignedByMe] = useState("")
    const [countPendingTask, setCountPendingTask] = useState("")
    const [countCompletedTask, setCountCompletedTask] = useState("")

    const bgRef = useRef(null);
    const glowRef = useRef(null);

    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    /* ================= PROFILE ================= */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:8080/user/profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserName(res.data.userDetail?.name || "User");
                console.log(res.data.countTaskAssignedToMe);
                setCountTaskAssignedToMe(res.data.countTaskAssignedToMe)
                setCountTaskAssignedByMe(res.data.countTaskAssignedByMe)
                setCountPendingTask(res.data.countPendingTask)
                console.log("res.data.countPendingTask", res.data.countPendingTask);
                setCountCompletedTask(res.data.countCompletedTask)
            } catch {
                localStorage.removeItem("token");
                navigate("/user/login");
            }
        };
        fetchProfile();
    }, [navigate]);

    /* ================= MOTION ================= */
    useEffect(() => {
        const onMouseMove = (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            target.current.x = (e.clientX - cx) / cx;
            target.current.y = (e.clientY - cy) / cy;
        };
        window.addEventListener("mousemove", onMouseMove);

        const animate = () => {
            current.current.x += (target.current.x - current.current.x) * 0.05;
            current.current.y += (target.current.y - current.current.y) * 0.05;

            if (bgRef.current) {
                bgRef.current.style.transform =
                    `translate(${current.current.x * 12}px, ${current.current.y * 12}px)`;
            }
            if (glowRef.current) {
                glowRef.current.style.transform = `
                    translate(
                        ${window.innerWidth / 2 + current.current.x * 180 - 410}px,
                        ${window.innerHeight / 2 + current.current.y * 180 - 410}px
                    )
                `;
            }
            requestAnimationFrame(animate);
        };

        animate();
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, []);

    return (
        <>
            <style>{`
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glowSweep {
                    0% { left: -120%; }
                    100% { left: 120%; }
                }
            `}</style>

            <div className="relative min-h-screen w-screen overflow-hidden pt-16">
                {/* BACKGROUND */}
                <div
                    ref={bgRef}
                    className="absolute inset-[-30%]"
                    style={{
                        background:
                            "linear-gradient(130deg,#020617,#0f172a,#1e293b,#312e81,#020617)",
                        backgroundSize: "700% 700%",
                        animation: "aurora 40s ease-in-out infinite",
                    }}
                />

                {/* GLOW */}
                <div
                    ref={glowRef}
                    className="pointer-events-none absolute w-[900px] h-[900px] rounded-full blur-[240px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.45), transparent 65%)",
                    }}
                />

                {/* CONTENT */}
                <div className="relative z-10 max-w-7xl mx-auto px-8 py-10 animate-[fadeUp_0.7s_ease-out_both]">

                    {/* HEADER */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">
                                Dashboard
                            </h1>
                            <p className="text-gray-300 text-sm mt-1">
                                Welcome back, {userName[0].toUpperCase() + userName.slice(1)}
                            </p>
                            <div className="mt-3 h-[2px] w-16 bg-indigo-500/70 rounded-full" />
                        </div>

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/user/login");
                            }}
                            className="px-4 py-2 rounded-md bg-white/10 border border-white/20
                                       text-gray-200 hover:bg-white/20 transition"
                        >
                            Logout
                        </button>
                    </div>

                    {/* ================= STATS ================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard title="Assigned To Me" value={countTaskAssignedToMe} />
                        <StatCard title="Assigned By Me" value={countTaskAssignedByMe} />
                        <StatCard title="Pending Tasks" value={countPendingTask} />
                        <StatCard title="Completed Tasks" value={countCompletedTask} />
                    </div>

                    {/* ================= MAIN OPTIONS ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <DashboardCard title="My Tasks" desc="Tasks assigned to you" onClick={() => navigate("/mytasks")} />
                        <DashboardCard title="Assigned By Me" desc="Tasks you gave others" onClick={() => navigate("/mytasks")} />
                        <DashboardCard title="Profile" desc="View and edit profile" onClick={() => navigate("/profile")} />
                        <DashboardCard title="Activity" desc="Recent actions" />
                        <DashboardCard title="Insights" desc="Performance overview" />
                        <DashboardCard title="Notifications" desc="Task alerts" />
                    </div>

                    {/* ================= QUICK ACTIONS ================= */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Quick Actions
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ActionButton label="Assign Task" onClick={() => navigate("/assigntasks")} />
                            <ActionButton label="View Tasks" onClick={() => navigate("/mytasks")} />
                            <ActionButton label="Profile" onClick={() => navigate("/profile")} />
                            <ActionButton label="Settings" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ================= UI COMPONENTS ================= */

const StatCard = ({ title, value }) => (
    <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20
                    rounded-2xl p-6 hover:-translate-y-1 transition">
        <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-y-0 w-1/3 bg-white animate-[glowSweep_6s_linear_infinite]" />
        </div>
        <p className="text-sm text-gray-400">{title}</p>
        <h2 className="text-3xl font-semibold text-white mt-2">{value}</h2>
    </div>
);

const DashboardCard = ({ title, desc, onClick }) => (
    <div
        onClick={onClick}
        className="cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20
                   rounded-2xl p-6 hover:-translate-y-[2px]
                   hover:shadow-[0_30px_90px_rgba(0,0,0,0.65)]
                   transition"
    >
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
    </div>
);

const ActionButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="px-4 py-2.5 rounded-md bg-white/10 border border-white/20
                   text-gray-200 hover:bg-white/20 transition text-sm"
    >
        {label}
    </button>
);

export default Home;
