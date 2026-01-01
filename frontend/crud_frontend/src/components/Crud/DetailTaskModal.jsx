import React from "react";
import moment from "moment";

const DetailTaskModal = ({ isOpen, onClose, task }) => {
    if (!isOpen || !task) return null;

    const urgencyBadge =
        task.urgency === "High" ? "bg-rose-500/25 text-rose-300" : task.urgency === "Medium"
            ? "bg-amber-400/25 text-amber-300"
            : "bg-emerald-400/25 text-emerald-300";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div
                className="relative w-full max-w-2xl rounded-2xl
                           bg-white/10 backdrop-blur-xl
                           border border-white/20 shadow-2xl p-6
                           animate-[taskIn_.3s_ease]"
            >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Task Details
                        </h2>
                        <p className="text-xs text-gray-400 uppercase">
                            Read only view
                        </p>
                    </div>

                </div>

                {/* CONTENT */}
                <div className="space-y-5 text-sm">

                    {/* TITLE */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Title</p>
                        <p className="text-white font-medium">
                            {task.taskTitle || "—"}
                        </p>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Description</p>
                        <p className="text-gray-200 leading-relaxed">
                            {task.taskDescription || "—"}
                        </p>
                    </div>

                    {/* STATUS + URGENCY */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Status</p>
                            <span className="inline-block px-3 py-0.5 text-xs rounded-full
                                             bg-indigo-500/20 text-indigo-300">
                                {task.status || "—"}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">Urgency</p>
                            <span className={`inline-block px-3 py-0.5 text-xs rounded-full ${urgencyBadge}`}>
                                {task.urgency || "—"}
                            </span>
                        </div>
                    </div>

                    {/* ASSIGNMENT */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Assigned By</p>
                            <p className="text-white">
                                {task.assignedBy?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                                ID: {task.assignedBy?._id || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                            <p className="text-white">
                                {task.assignedTo?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                                ID: {task.assignedTo?._id || "—"}
                            </p>
                        </div>
                    </div>

                    {/* DUE DATE */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Due Date</p>
                        {task.dueDate ? (
                            <p className="text-white">
                                {moment(task.dueDate).format("DD MMM YYYY, HH:mm")}
                                <span className="text-gray-400 ml-2">
                                    ({moment(task.dueDate).fromNow()})
                                </span>
                            </p>
                        ) : (
                            <p className="text-gray-400">—</p>
                        )}
                    </div>

                    {/* COLOR */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Task Color</p>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded-full border border-white/30"
                                style={{ backgroundColor: task.color || "#6366f1" }}
                            />
                            <span className="text-gray-300 text-xs">
                                {task.color || "Default"}
                            </span>
                        </div>
                    </div>

                    {/* DATES */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Created At</p>
                            <p className="text-white">
                                {task.createdAt
                                    ? moment(task.createdAt).format("DD MMM YYYY, HH:mm")
                                    : "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {task.createdAt && moment(task.createdAt).fromNow()}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">Last Updated</p>
                            <p className="text-white">
                                {task.updatedAt
                                    ? moment(task.updatedAt).format("DD MMM YYYY, HH:mm")
                                    : "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {task.updatedAt && moment(task.updatedAt).fromNow()}
                            </p>
                        </div>
                    </div>

                    {/* IDS */}
                    <div className="pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Task ID</p>
                        <p className="text-gray-300 text-xs break-all">
                            {task._id}
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg
                                   bg-white/10 text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailTaskModal;
