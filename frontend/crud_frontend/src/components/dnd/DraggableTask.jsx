import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiSave } from "react-icons/fi";
import api from "../../api/axios";

const DraggableTask = ({ task, userId, onTaskUpdated, onTaskDeleted }) => {
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.taskTitle);
    const [loading, setLoading] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `task-${task._id}`,
        data: {
            type: "task",
            task: task,        // ✅ MUST exist
            userId: userId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        willChange: "transform",
    };

    const token = localStorage.getItem("token");

    /* ================= SAVE EDIT ================= */
    const handleSaveEdit = async () => {
        if (!editTitle.trim()) return;

        try {
            setLoading(true);

            const res = await api.patch(
                `/user/updatetask/${task._id}`,
                { taskTitle: editTitle },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onTaskUpdated?.(res.data.task);
            setIsEditing(false);
            setShowActions(false);
        } catch (err) {
            console.error("Edit task error:", err);
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= MARK COMPLETE ================= */
    const handleMarkComplete = async () => {
        try {
            setLoading(true);

            const res = await api.patch(
                `/user/updatetask/${task._id}`,
                { status: "Completed" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onTaskUpdated?.(res.data.task);
            setShowActions(false);
        } catch (err) {
            console.error("Complete task error:", err);
            alert(err.response?.data?.message || "Not allowed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async () => {
        if (!window.confirm("Delete this task?")) return;

        try {
            setLoading(true);

            await api.delete(`/user/deletetask/${task._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onTaskDeleted?.(task._id);
        } catch (err) {
            console.error("Delete task error:", err);
            alert(err.response?.data?.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`task-card
                group relative
                px-3 py-2 rounded-xl
                bg-white/10 border border-white/10
                text-sm cursor-grab
                transition-all duration-300
                ${isDragging
                    ? "opacity-70 scale-[1.03] shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                    : "hover:bg-white/15"
                }
            `}
        >
            {/* ================= VIEW MODE ================= */}
            {!isEditing && (
                <>
                    <div className="flex justify-between items-center gap-2">
                        <div>
                            <div className="font-medium">
                                {task.taskTitle}
                            </div>
                            <div className="text-[11px] text-gray-400">
                                By {task.assignedBy?.name}
                            </div>
                        </div>

                        {/* ACTION TOGGLE */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActions((p) => !p);
                            }}
                            className="
                                p-1.5 rounded-md
                                text-gray-400 hover:text-indigo-300
                                hover:bg-white/10
                                transition
                            "
                        >
                            <FiEdit2 size={14} />
                        </button>
                    </div>

                    {/* ACTION PANEL */}
                    <div
                        className={`
                            mt-2 flex justify-end gap-3
                            overflow-hidden
                            transition-all duration-300
                            ${showActions
                                ? "max-h-20 opacity-100"
                                : "max-h-0 opacity-0"
                            }
                        `}
                    >
                        {/* COMPLETE */}
                        <button
                            disabled={loading}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkComplete();
                            }}
                            className="
                                p-2 rounded-lg
                                bg-emerald-500/15 text-emerald-400
                                hover:bg-emerald-500/25
                                transition
                            "
                            title="Mark complete"
                        >
                            <FiCheck size={14} />
                        </button>

                        {/* EDIT */}
                        <button
                            disabled={loading}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="
                                p-2 rounded-lg
                                bg-indigo-500/15 text-indigo-400
                                hover:bg-indigo-500/25
                                transition
                            "
                            title="Edit task"
                        >
                            <FiEdit2 size={14} />
                        </button>

                        {/* DELETE */}
                        <button
                            disabled={loading}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="
                                p-2 rounded-lg
                                bg-red-500/15 text-red-400
                                hover:bg-red-500/25
                                transition
                            "
                            title="Delete task"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                </>
            )}

            {/* ================= EDIT MODE ================= */}
            {isEditing && (
                <div className="
                    mt-1 p-2 rounded-lg
                    bg-black/40 backdrop-blur-xl
                    border border-white/10
                    transition-all duration-300
                ">
                    <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="
                            w-full px-3 py-2 mb-3 rounded-lg
                            bg-white/10 border border-white/10
                            text-sm text-white
                            focus:outline-none
                            focus:ring-2 focus:ring-indigo-400/40
                        "
                        placeholder="Edit task title"
                    />

                    <div className="flex justify-end gap-3">
                        {/* CANCEL */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                            }}
                            className="
                                flex items-center gap-1 px-3 py-1.5
                                rounded-lg text-sm
                                bg-white/10 text-gray-300
                                hover:bg-white/20 transition
                            "
                        >
                            <FiX size={14} />
                            Cancel
                        </button>

                        {/* SAVE */}
                        <button
                            disabled={loading}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit();
                            }}
                            className="
                                flex items-center gap-1 px-3 py-1.5
                                rounded-lg text-sm
                                bg-indigo-500/20 text-indigo-300
                                hover:bg-indigo-500/30 transition
                            "
                        >
                            <FiSave size={14} />
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraggableTask;
