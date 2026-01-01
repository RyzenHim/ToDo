import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from '../../api/axios'
const EditProfileModal = ({ currentName, onClose, onSuccess, email }) => {

    const modalRef = useRef(null);
    const navigate = useNavigate()
    const [name, setName] = useState(currentName);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);


    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };


    const handleSave = async () => {

        if (password && password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const updatedData = {};

        if (name && name.trim()) {
            updatedData.name = name.trim();
        }

        if (password) {
            updatedData.password = password;
            updatedData.confirmPassword = confirmPassword;
        }

        try {
            await api.patch(
                "/user/update",
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            onSuccess(name);
            onClose();
            navigate("/user")
        } catch (err) {
            console.error("Error updating data:", err);
            alert(err.response?.data?.message || "Update failed");
        }
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

            <div
                onClick={handleBackdropClick}
                className="fixed inset-0 z-50 flex items-center justify-center
                           bg-black/60 backdrop-blur-sm"
            >
                <div
                    ref={modalRef}
                    className="relative w-full max-w-md rounded-2xl p-6
                               bg-white/10 backdrop-blur-2xl
                               border border-white/20
                               shadow-[0_40px_120px_rgba(0,0,0,0.7)]
                               animate-[fadeUp_0.35s_ease-out]"
                >
                    <div
                        className="absolute inset-0 -z-10 rounded-2xl opacity-40"
                        style={{
                            background:
                                "linear-gradient(130deg,#6366f1,#8b5cf6,#22d3ee)",
                            backgroundSize: "400% 400%",
                            animation: "aurora 18s ease-in-out infinite",
                        }}
                    />

                    <h2 className="text-xl font-semibold text-white mb-4">
                        Edit Profile
                    </h2>

                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                New Name
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full glass-input "
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                {email}
                            </label>
                            <input
                                value={email}
                                className="w-full glass-input disabled:opacity-40"
                                disabled
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full glass-input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full glass-input"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md
                                       bg-white/10 text-white
                                       border border-white/20
                                       hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-md
                                       bg-indigo-600 text-white
                                       hover:bg-indigo-700 transition"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .glass-input {
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                    background: rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.25);
                    color: white;
                    outline: none;
                }
                .glass-input:focus {
                    border-color: #6366f1;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default EditProfileModal;
