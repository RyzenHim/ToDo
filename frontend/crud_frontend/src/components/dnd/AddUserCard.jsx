import React from "react";
import { FaUserPlus } from "react-icons/fa";
import AddUserForm from "./AddUserForm";

const AddUserCard = ({ showAddUser, setShowAddUser, ...formProps }) => {
    return (
        <>
            {/* LABEL */}
            <div className="text-[11px] tracking-widest uppercase text-indigo-300/70 mb-3">
                Add User
            </div>

            {!showAddUser ? (
                <div
                    onClick={() => setShowAddUser(true)}
                    className="
                    border
                        w-full h-12 flex justify-center items-center gap-2
                        text-sm font-medium
                        bg-white/5 border border-white/10 rounded-xl
                        cursor-pointer
                        transition-all duration-300
                        hover:bg-emerald-500/20
                        hover:border-emerald-400/40
                        hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]
                    "
                >
                    Add User
                    <FaUserPlus className="text-sm" />
                </div>
            ) : (
                <AddUserForm {...formProps} setShowAddUser={setShowAddUser} />
            )}
        </>
    );
};

export default AddUserCard;
