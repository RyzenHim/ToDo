import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const NavBar = () => {
    const navigate = useNavigate();
    const outSideCloseRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("User");

    /* ================= FLOATING NEON CURSOR ================= */
    const navRef = useRef(null);
    const [cursorStyle, setCursorStyle] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });

    const moveCursor = (e) => {
        const target = e.target.closest("[data-nav-item]");
        if (!target || !navRef.current) return;

        const navRect = navRef.current.getBoundingClientRect();
        const itemRect = target.getBoundingClientRect();

        setCursorStyle({
            left: itemRect.left - navRect.left,
            width: itemRect.width,
            opacity: 1,
        });
    };

    const hideCursor = () => {
        setCursorStyle((p) => ({ ...p, opacity: 0 }));
    };

    /* ================= FETCH USER ================= */
    useEffect(() => {
        const fetchFunc = async () => {
            try {
                const fetchApi = await api.get("/user/profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                setName(fetchApi.data.userDetail.name);
            } catch (err) { }
        };

        fetchFunc();
    }, []);

    /* ================= OUTSIDE CLICK ================= */
    useEffect(() => {
        const handleBackdropClick = (e) => {
            if (
                outSideCloseRef.current &&
                !outSideCloseRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleBackdropClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleBackdropClick);
        };
    }, [open]);

    /* ================= LOGOUT ================= */
    const handleLogOut = () => {
        localStorage.removeItem("token");
        navigate("/user/login");
    };

    /* ================= LINK STYLE ================= */
    const linkClass = ({ isActive }) =>
        `relative text-sm font-medium tracking-wide transition
     ${isActive ? "text-white" : "text-white/70 hover:text-white"}
     after:content-[''] after:absolute after:left-0 after:-bottom-1
     after:h-[2px] after:bg-indigo-400 after:transition-all
     ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

    return (
        <nav
            className="
                fixed top-0 z-50 w-full h-16
                bg-white/10 backdrop-blur-2xl
                border-b border-white/10
                shadow-[0_10px_40px_rgba(0,0,0,0.45)]
                transition-all duration-300
            "
        >
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                {/* LOGO */}
                <h1
                    onClick={() => navigate("/")}
                    className="
                        text-xl font-semibold tracking-wide text-white cursor-pointer
                        drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]
                        hover:scale-[1.03] transition
                    "
                >
                    TODO
                </h1>

                {/* LINKS */}
                <div
                    ref={navRef}
                    onMouseMove={moveCursor}
                    onMouseLeave={hideCursor}
                    className="relative flex items-center gap-8"
                >
                    <NavLink to="/" data-nav-item className={linkClass}>
                        Dash Board
                    </NavLink>

                    <NavLink to="/mytasks" data-nav-item className={linkClass}>
                        Manage Tasks
                    </NavLink>

                    <NavLink
                        to="/assigntasks"
                        data-nav-item
                        className={linkClass}
                    >
                        Assign Tasks
                    </NavLink>

                    <NavLink to="/boards" data-nav-item className={linkClass}>
                        My Boards
                    </NavLink>

                    <NavLink
                        to="/taskCalander"
                        data-nav-item
                        className={linkClass}
                    >
                        Task Calander
                    </NavLink>

                    {/* FLOATING NEON CURSOR */}
                    <span
                        className="
                            pointer-events-none absolute bottom-[-6px] h-[3px]
                            bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500
                            rounded-full blur-[2px]
                            transition-all duration-300 ease-out
                            shadow-[0_0_18px_rgba(99,102,241,0.9)]
                        "
                        style={{
                            left: cursorStyle.left,
                            width: cursorStyle.width,
                            opacity: cursorStyle.opacity,
                        }}
                    />
                </div>

                {/* PROFILE MENU */}
                <div ref={outSideCloseRef} className="relative">
                    <button
                        onClick={() => setOpen(!open)}
                        className="
                            flex items-center gap-3 text-white/80
                            hover:text-white transition
                        "
                    >
                        <div
                            className="
                                h-9 w-9 rounded-full
                                bg-white/20 backdrop-blur
                                border border-white/20
                                flex items-center justify-center
                                text-sm font-semibold text-white
                                shadow-[0_0_12px_rgba(0,255,255,0.4)]
                            "
                        >
                            {name?.[0].toUpperCase() || "U"}
                        </div>

                        <span className="hidden sm:block text-sm font-medium">
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                        </span>
                    </button>

                    {open && (
                        <div
                            className="
                                absolute right-0 mt-3 w-48
                                bg-black/60 backdrop-blur-2xl
                                border border-white/20
                                rounded-xl shadow-2xl overflow-hidden
                                animate-[fadeIn_0.25s_ease]
                            "
                        >
                            <NavLink
                                to="/profile"
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `block px-4 py-3 text-sm transition
                                     ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/80 hover:bg-white/10"
                                    }`
                                }
                            >
                                View Profile
                            </NavLink>

                            <button
                                onClick={handleLogOut}
                                className="
                                    w-full text-left px-4 py-3 text-sm
                                    text-red-400 hover:bg-red-500/10 transition
                                "
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
