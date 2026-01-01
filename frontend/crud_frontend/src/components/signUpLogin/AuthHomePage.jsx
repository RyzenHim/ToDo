import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const AuthHomePage = () => {
    const [mode, setMode] = useState("Login");
    const navigate = useNavigate();

    const bgRef = useRef(null);
    const glowRef = useRef(null);
    const cardRef = useRef(null);
    const specularRef = useRef(null);

    // Motion refs
    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });
    const magnetic = useRef({ x: 0, y: 0 });
    const pulse = useRef(0);

    useEffect(() => {
        const onMouseMove = (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;

            target.current.x = (e.clientX - cx) / cx;
            target.current.y = (e.clientY - cy) / cy;
        };

        window.addEventListener("mousemove", onMouseMove);

        const animate = () => {
            // Base smoothing
            current.current.x += (target.current.x - current.current.x) * 0.05;
            current.current.y += (target.current.y - current.current.y) * 0.05;

            // Magnetic pull (strong near center, weak at edges)
            magnetic.current.x += (current.current.x - magnetic.current.x) * 0.08;
            magnetic.current.y += (current.current.y - magnetic.current.y) * 0.08;

            const x = current.current.x;
            const y = current.current.y;
            const mx = magnetic.current.x;
            const my = magnetic.current.y;

            pulse.current += 0.01;
            const breathe = Math.sin(pulse.current) * 3;

            /* BACKGROUND — very slow */
            if (bgRef.current) {
                bgRef.current.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
            }

            /* GLOW — medium */
            if (glowRef.current) {
                glowRef.current.style.transform = `translate(
          ${window.innerWidth / 2 + x * 240 - 450}px,
          ${window.innerHeight / 2 + y * 240 - 450}px
        )`;
            }

            /* CARD — magnetic + tilt */
            if (cardRef.current) {
                cardRef.current.style.transform = `
          perspective(1800px)
          translate(${mx * 14}px, ${my * 12}px)
          rotateX(${y * -5}deg)
          rotateY(${x * 5}deg)
          translateZ(${10 + breathe}px)
        `;
            }

            /* SPECULAR — fast & subtle */
            if (specularRef.current) {
                specularRef.current.style.transform = `
          translate(${x * 40}px, ${y * 28}px)
        `;
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
        };
    }, []);

    return (
        <>
            <style>{`
        @keyframes aurora {
          0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
          50% { background-position: 100% 50%; filter: hue-rotate(60deg); }
          100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
        }
        @keyframes breatheLight {
          0% { opacity: 0.35; }
          50% { opacity: 0.55; }
          100% { opacity: 0.35; }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-140%); }
          100% { transform: translateX(140%); }
        }
      `}</style>

            {/* ROOT — true centering */}
            <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center px-6">

                {/* BACKGROUND */}
                <div
                    ref={bgRef}
                    className="absolute inset-[-25%]"
                    style={{
                        background:
                            "linear-gradient(130deg, #020617, #0f172a, #1e293b, #312e81, #020617)",
                        backgroundSize: "700% 700%",
                        animation: "aurora 36s ease-in-out infinite"
                    }}
                />

                {/* CENTER LIGHT */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at center, rgba(99,102,241,0.45), transparent 65%)",
                        animation: "breatheLight 11s ease-in-out infinite"
                    }}
                />

                {/* CURSOR GLOW */}
                <div
                    ref={glowRef}
                    className="pointer-events-none absolute w-[900px] h-[900px] rounded-full blur-[200px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(168,85,247,0.6), transparent 65%)"
                    }}
                />

                {/* GRAIN */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"5\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\"/></svg>')"
                    }}
                />

                {/* CARD WRAPPER — fixed alignment */}
                <div className="relative z-10 w-full max-w-5xl flex justify-center">
                    <div
                        ref={cardRef}
                        className="relative w-full flex overflow-hidden rounded-2xl
            bg-white/10 backdrop-blur-2xl border border-white/20
            shadow-[0_80px_220px_rgba(0,0,0,0.75)]"
                    >
                        {/* SPECULAR */}
                        <div
                            ref={specularRef}
                            className="pointer-events-none absolute inset-0 opacity-25"
                            style={{
                                background:
                                    "linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent)",
                                animation: "shimmerSweep 10s linear infinite"
                            }}
                        />

                        {/* LEFT PANEL */}
                        {/* LEFT PANEL */}
                        <div className="relative hidden md:flex w-1/2 flex-col justify-end px-12 py-16
                bg-white/5 border-r border-white/10 overflow-hidden">

                            {/* BACKGROUND IMAGE */}
                            <img
                                src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop"
                                alt="Abstract visual"
                                className="absolute inset-0 w-full h-full object-cover opacity-40"
                            />

                            {/* IMAGE OVERLAY (to match glass UI) */}
                            <div className="absolute inset-0 bg-gradient-to-t
                  from-[#020617]/90 via-[#020617]/60 to-transparent" />

                            {/* CONTENT */}
                            <div className="relative z-10">
                                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-4">
                                    AUTH EXPERIENCE
                                </p>

                                <h1 className="text-4xl font-semibold text-white leading-tight mb-4">
                                    Design that<br />moves you.
                                </h1>

                                <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                                    Crafted with depth, motion, and restraint — built to feel as good as it looks.
                                </p>
                            </div>
                        </div>


                        {/* RIGHT PANEL */}
                        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 py-12">
                            <div className="flex justify-center mb-8 text-xs tracking-widest text-gray-400 gap-6">
                                <button
                                    onClick={() => {
                                        setMode("Login");
                                        navigate("/user/login");
                                    }}
                                    className={mode === "Login" ? "text-white" : ""}
                                >
                                    LOGIN
                                </button>
                                <button
                                    onClick={() => {
                                        setMode("Signup");
                                        navigate("/user/signup");
                                    }}
                                    className={mode === "Signup" ? "text-white" : ""}
                                >
                                    SIGN UP
                                </button>
                            </div>

                            <div className="min-h-[420px] flex items-center justify-center p-6
                bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthHomePage;
