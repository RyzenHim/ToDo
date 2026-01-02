import axios from "axios";
import React, { useEffect, useState } from "react";
import api from '../../api/axios'
const EditTaskModal = ({
    isOpen,
    onClose,
    task,
    type,
    onSuccess
}) => {
    const [form, setForm] = useState({
        taskTitle: "",
        taskDescription: "",
        urgency: "",
        status: "",
        dueDate: "",
        color: "#6366f1"
    });

    /* ================= ROLE FLAGS ================= */
    const isByMe = type === "byMe";
    const isToMe = type === "toMe";

    /* ================= INIT FORM ================= */
    useEffect(() => {
        if (task) {
            setForm({
                taskTitle: task.taskTitle || "",
                taskDescription: task.taskDescription || "",
                urgency: task.urgency || "",
                status: task.status || "",
                dueDate: task.dueDate
                    ? new Date(task.dueDate).toISOString().slice(0, 16)
                    : "",
                color: task.color || "#6366f1"
            });
        }
    }, [task]);

    if (!isOpen || !task) return null;

    /* ================= CHANGE HANDLER ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        // 🔒 TO ME → ONLY STATUS
        if (isToMe && name !== "status") return;

        // 🔒 STATUS RULE
        if (name === "status") {
            if (task.status !== "Pending") return;
            if (value !== "Pending" && value !== "Completed") return;
        }

        setForm(prev => ({ ...prev, [name]: value }));
    };

    /* ================= UPDATE ================= */
    const handleUpdate = async () => {
        try {
            await api.patch(
                `/user/updatetask/${task._id}`,
                {
                    ...form,
                    dueDate: form.dueDate ? new Date(form.dueDate) : null
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            onClose();
            onSuccess()
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    const handleDelete = async () => {
        if (!isByMe) return;

        const confirmDelete = window.confirm(
            "This will permanently delete the task. Continue?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(
                `/user/deletetask/${task._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-2xl rounded-2xl
                            bg-white/10 backdrop-blur-xl
                            border border-white/20 shadow-2xl p-6">

                <h2 className="text-lg font-semibold text-white mb-4">
                    Edit Task
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* TITLE */}
                    <input
                        name="taskTitle"
                        value={form.taskTitle}
                        onChange={handleChange}
                        disabled={!isByMe}
                        className="md:col-span-2 glass-input disabled:opacity-40"
                    />

                    {/* ASSIGNED TO (ALWAYS READ-ONLY) */}
                    <input
                        value={task.assignedTo?.name || ""}
                        disabled
                        className="glass-input opacity-50"
                    />

                    {/* URGENCY */}
                    <select
                        name="urgency"
                        value={form.urgency}
                        onChange={handleChange}
                        disabled={!isByMe}
                        className="glass-input disabled:opacity-40"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>

                    {/* DUE DATE */}
                    <input
                        type="datetime-local"
                        name="dueDate"
                        value={form.dueDate}
                        onChange={handleChange}
                        disabled={!isByMe}
                        className="glass-input disabled:opacity-40"
                    />

                    {/* STATUS */}
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        disabled={task.status !== "Pending"}
                        className="glass-input"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>

                    {/* COLOR */}
                    <input
                        type="color"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        disabled={!isByMe}
                    />

                    {/* DESCRIPTION */}
                    <textarea
                        name="taskDescription"
                        value={form.taskDescription}
                        onChange={handleChange}
                        disabled={!isByMe}
                        rows={4}
                        className="md:col-span-2 glass-input disabled:opacity-40"
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between items-center mt-6">

                    {isByMe && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg
                                       bg-rose-500/20 text-rose-300
                                       hover:bg-rose-500/30 transition"
                        >
                            Delete
                        </button>
                    )}

                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/10"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-indigo-500/30"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .glass-input {
                    padding: 0.6rem 0.9rem;
                    border-radius: 0.5rem;
                    background: rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default EditTaskModal;
