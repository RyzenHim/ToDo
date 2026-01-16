import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const UserActionModal = ({
    isOpen,
    mode,          // "view" | "edit" | "delete"
    user,
    onClose,
    onDeleted,
    onUpdated,
}) => {
    const [name, setName] = useState("");

    useEffect(() => {
        if (user) setName(user.name || "");
    }, [user]);

    if (!isOpen || !user) return null;

    const token = localStorage.getItem("token");

    /* ================= UPDATE USER ================= */
    const handleUpdate = async () => {
        try {
            await api.patch(
                "/user/update",
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onUpdated?.({ ...user, name });
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    /* ================= DELETE USER ================= */
    const handleDelete = async () => {
        if (!window.confirm(`Delete ${user.name}?`)) return;

        try {
            await api.delete(`/user/user/${user._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            onDeleted?.(user._id);
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

            <div className="relative w-full max-w-md rounded-2xl
                            bg-slate-900/90 backdrop-blur-xl
                            border border-white/10
                            shadow-[0_30px_80px_rgba(0,0,0,0.7)]
                            p-6 text-white">

                <h2 className="text-lg font-semibold mb-4 capitalize">
                    {mode} User
                </h2>

                {/* ================= VIEW ================= */}
                {mode === "view" && (
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="text-gray-400">Name:</span>{" "}
                            {user.name}
                        </div>
                        <div>
                            <span className="text-gray-400">Email:</span>{" "}
                            {user.email}
                        </div>
                    </div>
                )}

                {/* ================= EDIT ================= */}
                {mode === "edit" && (
                    <div className="space-y-4">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="
                                w-full px-3 py-2 rounded-lg
                                bg-white/10 border border-white/10
                                focus:outline-none
                                focus:ring-2 focus:ring-indigo-400/40
                            "
                        />
                    </div>
                )}

                {/* ================= DELETE ================= */}
                {mode === "delete" && (
                    <p className="text-sm text-gray-300">
                        This will permanently delete <b>{user.name}</b>.
                        This action cannot be undone.
                    </p>
                )}

                {/* ================= FOOTER ================= */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 rounded-lg"
                    >
                        Cancel
                    </button>

                    {mode === "edit" && (
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-indigo-500/30 rounded-lg"
                        >
                            Save
                        </button>
                    )}

                    {mode === "delete" && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500/30 rounded-lg"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserActionModal;
