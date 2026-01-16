import React from "react";
import { FaUserPlus } from "react-icons/fa";
import AddUserForm from "./AddUserForm";

const AddUserCard = ({ showAddUser, setShowAddUser, ...formProps }) => {
    return (
        <div
            className="
                relative w-full
                rounded-2xl
                bg-white/5 backdrop-blur-xl
                border border-white/10
                shadow-[0_18px_60px_rgba(0,0,0,0.45)]
                transition-all duration-300
                hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]
            "
        >
            {/* Glow ring */}
            <div
                className="
                    pointer-events-none absolute inset-0 rounded-2xl
                    opacity-0 hover:opacity-100 transition-opacity duration-300
                    bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.25),transparent_65%)]
                "
            />

            <div className="relative z-10 p-4">
                {/* LABEL */}
                <div className="mb-3 text-[11px] tracking-widest uppercase text-emerald-300/70">
                    Add User
                </div>

                {!showAddUser ? (
                    <div
                        onClick={() => setShowAddUser(true)}
                        className="
                            group
                            relative w-full h-12
                            flex justify-center items-center gap-2
                            text-sm font-medium
                            rounded-xl
                            cursor-pointer
                            border border-white/10
                            bg-white/5

                            transition-all duration-300
                            hover:bg-emerald-500/20
                            hover:border-emerald-400/40
                            hover:shadow-[0_0_30px_rgba(16,185,129,0.45)]
                            hover:scale-[1.02]
                        "
                    >
                        {/* Shine layer */}
                        <span
                            className="
                                pointer-events-none absolute inset-0 rounded-xl
                                opacity-0 group-hover:opacity-100
                                transition-opacity duration-300
                                bg-gradient-to-r
                                from-transparent
                                via-white/10
                                to-transparent
                            "
                        />

                        <span className="relative z-10 flex items-center gap-2">
                            Add User
                            <FaUserPlus
                                className="
                                    text-sm
                                    transition-transform duration-300
                                    group-hover:rotate-12 group-hover:scale-110
                                "
                            />
                        </span>
                    </div>
                ) : (
                    <AddUserForm {...formProps} setShowAddUser={setShowAddUser} />
                )}
            </div>
        </div>
    );
};

export default AddUserCard;
