import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
const NavBar = () => {
    const navigate = useNavigate();
    const outSideCloseRef = useRef(null)
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("User")


    useEffect(() => {

        const fetchFunc = async () => {

            try {

                const fetchApi = await axios.get('http://localhost:8080/user/profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                })

                setName(fetchApi.data.userDetail.name)
            } catch (err) {

            }
        }

        fetchFunc()
    }, [])


    useEffect(() => {
        const handleBackdropClick = (e) => {
            if (outSideCloseRef.current && !outSideCloseRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleBackdropClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleBackdropClick);
        };
    }, [open])



    const handleLogOut = () => {
        localStorage.removeItem("token");
        navigate("/user");
    };

    const linkClass = ({ isActive }) =>
        `relative text-sm font-medium tracking-wide transition
     ${isActive ? "text-white" : "text-white/70 hover:text-white"}
     after:content-[''] after:absolute after:left-0 after:-bottom-1
     after:h-[2px] after:bg-indigo-400 after:transition-all
     ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

    return (
        <nav className="fixed top-0 z-50 w-full h-16
                    bg-white/10 backdrop-blur-xl
                    border-b border-white/10">
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

                {/* LOGO */}
                <h1 onClick={() => navigate('/')} className="text-xl font-semibold tracking-wide text-white cursor-pointer">
                    TODO
                </h1>

                {/* LINKS */}
                <div className="flex items-center gap-8">

                    <NavLink to="/" className={linkClass}>
                        Dash Board
                    </NavLink>
                    <NavLink to="/mytasks" className={linkClass}>
                        Manage Tasks
                    </NavLink>
                    <NavLink to="/assigntasks" className={linkClass}>
                        Assign Tasks
                    </NavLink>
                    <NavLink to="/practice" className={linkClass}>
                        Practice
                    </NavLink>

                    {/* PROFILE DROPDOWN */}
                    <div
                        ref={outSideCloseRef}
                        className="relative">
                        <button

                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 text-white/80 hover:text-white transition"
                        >
                            <div className="h-9 w-9 rounded-full
                              bg-white/20 backdrop-blur
                              border border-white/20
                              flex items-center justify-center
                              text-sm font-semibold text-white">
                                {name?.[0].toUpperCase() || "U"}
                            </div>
                            <span className="hidden sm:block text-sm font-medium">
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </span>
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-3 w-48
                              bg-white/10 backdrop-blur-xl
                              border border-white/20
                              rounded-xl shadow-2xl overflow-hidden">
                                <NavLink
                                    to="/profile"
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-3 text-sm transition ${isActive ? "bg-white/10 text-white"
                                            : "text-white/80 hover:bg-white/10"}`
                                    }
                                >
                                    View Profile
                                </NavLink>

                                <button
                                    onClick={handleLogOut}
                                    className="w-full text-left px-4 py-3 text-sm
                             text-red-400 hover:bg-red-500/10 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default NavBar;
