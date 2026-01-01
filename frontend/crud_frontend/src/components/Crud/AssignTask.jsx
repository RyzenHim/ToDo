import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const AssignTask = () => {
    const bgRef = useRef(null);
    const glowRef = useRef(null);
    const rafRef = useRef(null);

    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    const [color, setColor] = useState("#6366f1");
    const [allUsers, setAllUsers] = useState([]);

    const [taskTitle, setTaskTitle] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [urgency, setUrgency] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [taskDescription, setTaskDescription] = useState("");

    /* ---------------- EFFECT ---------------- */
    useEffect(() => {
        const onMouseMove = (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            target.current.x = (e.clientX - cx) / cx;
            target.current.y = (e.clientY - cy) / cy;
        };

        window.addEventListener("mousemove", onMouseMove);
        animate();
        fetchUsers();

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    /* ---------------- FETCH USERS ---------------- */
    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8080/user/all", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setAllUsers(res.data.existingUsers);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!taskTitle || !assignedTo || !urgency || !date || !time) {
            alert("Please fill all required fields");
            return;
        }

        const dueDate = new Date(`${date}T${time}`);

        const submitData = {
            taskTitle,
            assignedTo,
            urgency,
            dueDate,
            color,
            taskDescription,
        };

        try {
            await axios.post(
                "http://localhost:8080/user/assigntask",
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            alert("Task assigned successfully");

            setTaskTitle("");
            setAssignedTo("");
            setUrgency("");
            setDate("");
            setTime("");
            setColor("#6366f1");
            setTaskDescription("");
        } catch (err) {
            console.error("Error submitting task", err);
        }
    };

    const animate = () => {
        current.current.x += (target.current.x - current.current.x) * 0.06;
        current.current.y += (target.current.y - current.current.y) * 0.06;

        const x = current.current.x;
        const y = current.current.y;

        if (bgRef.current) {
            bgRef.current.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
        }

        if (glowRef.current) {
            glowRef.current.style.transform = `
                translate(
                    ${window.innerWidth / 2 + x * 180 - 350}px,
                    ${window.innerHeight / 2 + y * 180 - 350}px
                )
            `;
        }

        rafRef.current = requestAnimationFrame(animate);
    };

    return (
        <>
            <style>{`
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div className="relative min-h-screen w-screen overflow-hidden pt-16 flex items-start justify-center">
                {/* BACKGROUND */}
                <div
                    ref={bgRef}
                    className="absolute inset-[-30%]"
                    style={{
                        background:
                            "linear-gradient(130deg, #020617, #0f172a, #1e293b, #312e81, #020617)",
                        backgroundSize: "700% 700%",
                        animation: "aurora 36s ease-in-out infinite",
                    }}
                />

                {/* GLOW */}
                <div
                    ref={glowRef}
                    className="pointer-events-none absolute w-[700px] h-[700px] rounded-full blur-[220px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.45), transparent 65%)",
                    }}
                />

                {/* FORM CARD */}
                <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl
                                border border-white/20 rounded-2xl p-8 mt-10">

                    <h1 className="text-2xl font-semibold text-white mb-1">
                        Assign Task
                    </h1>
                    <p className="text-gray-400 text-sm mb-6">
                        Create and assign a new task
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <input
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className="col-span-2 glass-input"
                                placeholder="Task title"
                            />

                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="glass-input"
                            >
                                <option value="">Assign to</option>
                                {allUsers.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="glass-input"
                            >
                                <option value="">Urgency</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>

                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="glass-input"
                            />

                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="glass-input"
                            />

                            <div className="col-span-2 flex items-center gap-4">
                                <label className="text-gray-300 text-sm">
                                    Task Color
                                </label>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                                <span
                                    className="px-3 py-1 text-xs rounded-full"
                                    style={{
                                        backgroundColor: `${color}33`,
                                        color,
                                    }}
                                >
                                    Preview
                                </span>
                            </div>

                            <textarea
                                value={taskDescription}
                                onChange={(e) =>
                                    setTaskDescription(e.target.value)
                                }
                                rows={4}
                                className="col-span-2 glass-input"
                                placeholder="Task description"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 px-4 py-2.5 bg-indigo-600
                                       text-white rounded-md hover:bg-indigo-700 transition"
                        >
                            Assign Task
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .glass-input {
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    outline: none;
                }
                .glass-input:focus {
                    border-color: #6366f1;
                }
            `}</style>
        </>
    );
};

export default AssignTask;
