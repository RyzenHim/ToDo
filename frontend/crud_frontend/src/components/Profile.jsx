import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "./myProfile/EditProfileModal";

const Profile = () => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [showEditModal, setShowEditModal] = useState(false)
    const navigate = useNavigate();

    const bgRef = useRef(null);
    const glowRef = useRef(null);

    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserName(res.data.userDetail.name);
                setUserEmail(res.data.userDetail.email)
            } catch {
                localStorage.removeItem("token");
                navigate("/user/login");
            }
        };
        fetchData();
    }, [navigate]);

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

            const x = current.current.x;
            const y = current.current.y;

            if (bgRef.current) {
                bgRef.current.style.transform = `translate(${x * 12}px, ${y * 12}px)`;
            }

            if (glowRef.current) {
                glowRef.current.style.transform = `
                    translate(
                        ${window.innerWidth / 2 + x * 180 - 420}px,
                        ${window.innerHeight / 2 + y * 180 - 420}px
                    )
                `;
            }

            requestAnimationFrame(animate);
        };

        animate();
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, []);

    const handleEditProfile = (e) => {
        setShowEditModal(!showEditModal)

    }

    return (
        <>
            <style>{`
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fadeUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.45; }
                    50% { opacity: 0.6; }
                }
            `}</style>

            <div className="relative min-h-screen w-screen overflow-hidden pt-16">

                <div
                    ref={bgRef}
                    className="absolute inset-[-30%]"
                    style={{
                        background:
                            "linear-gradient(130deg, #020617, #0f172a, #1e293b, #312e81, #020617)",
                        backgroundSize: "700% 700%",
                        animation: "aurora 40s ease-in-out infinite",
                    }}
                />

                <div
                    ref={glowRef}
                    className="pointer-events-none absolute w-[820px] h-[820px] rounded-full blur-[240px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.5), transparent 65%)",
                        animation: "glowPulse 12s ease-in-out infinite",
                    }}
                />

                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\"/></svg>')",
                    }}
                />

                <div
                    className="relative z-10 max-w-5xl mx-auto px-8 py-10"
                    style={{ animation: "fadeUp 0.7s ease-out both" }}
                >
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20
                                    rounded-2xl shadow-[0_60px_180px_rgba(0,0,0,0.7)]
                                    overflow-hidden">

                        <div className="p-8 bg-gradient-to-r from-indigo-600/70 to-purple-600/70">
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-full
                                                bg-white/20 border border-white/30
                                                flex items-center justify-center
                                                text-3xl font-semibold text-white">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold text-white">
                                        {userName.charAt(0).toUpperCase() + userName.slice(1)}
                                    </h1>
                                    <p className="text-sm text-white/80">
                                        {userEmail}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Personal Information
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <Info label="Full Name" value={userName.charAt(0).toUpperCase() + userName.slice(1)} />
                                    <Info label="Email" value={userEmail} />
                                    <Info label="Role" value="User" />
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Account Details
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <Info label="Status" value="Active" accent="text-green-400" />
                                    <Info label="Joined" value="Jan 2025" />
                                    <Info label="Last Login" value="Today" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 p-6
                                        flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                onClick={handleEditProfile}
                                className="px-6 py-2 rounded-lg
                                               bg-white/10 text-white
                                               border border-white/20
                                               hover:bg-white/20 transition">
                                Edit Profile
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    navigate("/user/login");
                                }}
                                className="px-6 py-2 rounded-lg
                                           bg-red-500/80 text-white
                                           hover:bg-red-500 transition">
                                Logout
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditProfileModal
                    currentName={userName}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={(updatedName) => setUserName(updatedName)}
                    email={userEmail}
                />
            )}
        </>
    );
};

const Info = ({ label, value, accent = "text-white" }) => (
    <div className="flex justify-between text-white/70">
        <span>{label}</span>
        <span className={accent}>{value}</span>
    </div>
);

export default Profile;
