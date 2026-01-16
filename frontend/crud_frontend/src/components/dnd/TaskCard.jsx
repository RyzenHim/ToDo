import React from "react";
import AddTaskForm from "./AddTaskForm";
import DraggableTask from "./DraggableTask";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import UserActionMenu from "./UserActionMenu";

const TaskCard = ({
    userName,
    userId,
    tasks = [],
    isTaskFormOpen,
    openAddTaskForm,
    closeAddTaskForm,
    taskInput,
    onTaskInputChange,
    handleTaskSubmit,
    onDeleteUser,
    onTaskUpdated,
    onTaskDeleted,
    onViewUser,
    onEditUser,
    onDeleteUserFromMenu,

}) => {
    // 🔥 IMPORTANT: ids must match DraggableTask sortable ids
    const taskIds = tasks.map((t) => t._id);

    return (
        <div className="flex flex-col">

            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] tracking-widest uppercase text-indigo-300/70">
                    {userName}
                </div>
                {/* 
                <UserActionMenu
                    userId={userId}
                    userName={userName}
                    onView={(id) => console.log("VIEW USER", id)}
                    onEdit={(id) => console.log("EDIT USER", id)}
                    onDelete={(id, name) => console.log("DELETE USER", id, name)}
                /> */}
                <UserActionMenu
                    userId={userId}
                    userName={userName}
                    onView={(id) => onViewUser(id)}
                    onEdit={(id) => onEditUser(id)}
                    onDelete={(id) => onDeleteUserFromMenu(id)}
                />



            </div>

            {/* ================= TASK LIST ================= */}
            <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2 mb-3">
                    {tasks.length === 0 && (
                        <div className="text-xs text-gray-400 italic px-1">
                            No tasks yet
                        </div>
                    )}

                    {tasks.map((task) => (
                        <DraggableTask
                            key={task._id}
                            task={task}
                            userId={userId}
                            onTaskUpdated={onTaskUpdated}
                            onTaskDeleted={onTaskDeleted}
                        />
                    ))}

                </div>
            </SortableContext>

            {/* ================= ADD TASK ================= */}
            {!isTaskFormOpen ? (
                <button
                    type="button"
                    onClick={() => openAddTaskForm(userId)}
                    className="
            w-full h-11 rounded-xl
            flex justify-center items-center
            text-sm font-medium
            bg-white/5 border border-white/10
            cursor-pointer
            transition-all duration-300
            hover:bg-indigo-500/20
            hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]
          "
                >
                    + Add Task
                </button>
            ) : (
                <AddTaskForm
                    userId={userId}
                    taskInput={taskInput}
                    onTaskInputChange={onTaskInputChange}
                    handleTaskSubmit={handleTaskSubmit}
                    closeAddTaskForm={closeAddTaskForm}
                />
            )}
        </div>
    );
};

export default TaskCard;