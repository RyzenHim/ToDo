import React from "react";
import { MdCancel } from "react-icons/md";

const AddTaskForm = ({
    userId,
    taskInput,
    onTaskInputChange,
    handleTaskSubmit,
    closeAddTaskForm,
}) => {
    return (
        <div
            className="
                w-full p-4 rounded-2xl
                bg-white/5 border border-white/10
                backdrop-blur-xl
                shadow-[0_12px_40px_rgba(0,0,0,0.45)]
                transition-all duration-300
            "
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-indigo-200 text-sm font-medium tracking-wide">
                    Add Task
                </span>
                <MdCancel
                    onClick={() => closeAddTaskForm(userId)}
                    className="
                        cursor-pointer text-gray-400
                        hover:text-red-400
                        transition-colors duration-200
                    "
                    size={18}
                />
            </div>

            {/* INPUT */}
            <input
                value={taskInput}
                onChange={(e) => onTaskInputChange(userId, e.target.value)}
                placeholder="Enter task title"
                className="
                    w-full px-3 py-2 mb-3 rounded-lg
                    bg-white/10 border border-white/10
                    text-sm text-white placeholder-gray-400
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-400/40
                    focus:border-indigo-400/40
                    transition
                "
            />

            {/* BUTTON */}
            <button
                onClick={() => handleTaskSubmit(userId)}
                className="
                    w-full py-2 rounded-lg
                    text-sm font-medium
                    bg-white/10
                    hover:bg-indigo-500/25
                    hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]
                    transition-all duration-300
                "
            >
                Add Task
            </button>
        </div>
    );
};

export default AddTaskForm;
