import React from "react";
import AddTaskForm from "./AddTaskForm";

const TaskCard = ({
    userName,
    userId,
    isTaskFormOpen,
    openAddTaskForm,
    closeAddTaskForm,
    taskInput,
    onTaskInputChange,
    handleTaskSubmit,
}) => {
    return (
        <>
            {/* USER LABEL */}
            <div className="text-[11px] tracking-widest uppercase text-indigo-300/70 mb-3">
                {userName}
            </div>

            {!isTaskFormOpen ? (
                <div
                    onClick={() => openAddTaskForm(userId)}
                    className="
                        w-full h-12 rounded-xl
                        flex justify-center items-center
                        text-sm font-medium
                        bg-white/5 border border-white/10
                        cursor-pointer
                        transition-all duration-300
                        hover:bg-indigo-500/20
                        hover:border-indigo-400/40
                        hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]
                    "
                >
                    + Add Task
                </div>
            ) : (
                <AddTaskForm
                    userId={userId}
                    taskInput={taskInput}
                    onTaskInputChange={onTaskInputChange}
                    handleTaskSubmit={handleTaskSubmit}
                    closeAddTaskForm={closeAddTaskForm}
                />
            )}
        </>
    );
};

export default TaskCard;
