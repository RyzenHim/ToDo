import React, { useEffect, useState, useMemo } from "react";
import DragableBox from "./DragableBox";
import DropZone from "./DropZone";
import TaskCard from "./TaskCard";
import AddUserCard from "./AddUserCard";
import {
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import api from "../../api/axios";
import UserActionModal from "./UserActionModal";

/* ---------------- DRAG ANIMATION ---------------- */
const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: "0.4" } },
    }),
};

const Boards = () => {
    const [showAddUser, setShowAddUser] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });

    const [existingUserData, setExistingUserData] = useState([]);
    const [cardOrder, setCardOrder] = useState([]);

    const [openTaskForms, setOpenTaskForms] = useState({});
    const [taskInputs, setTaskInputs] = useState({});

    const [tasks, setTasks] = useState([]);
    const [lastAction, setLastAction] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [activeDragTask, setActiveDragTask] = useState(null);

    const [activeUser, setActiveUser] = useState(null);
    const [userActionMode, setUserActionMode] = useState(null);

    const [viewMode, setViewMode] = useState("board"); // "board" | "table"

    /* ---------------- FETCH ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const [userRes, taskRes] = await Promise.all([
                    api.get("/user/all", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    api.get("/user/mytasks", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const users = userRes.data.existingUsers || [];
                setExistingUserData(users);
                setCardOrder(users.map((u) => u._id));

                const { assignedToMe = [], assignedByMe = [] } = taskRes.data;
                setTasks([...assignedToMe, ...assignedByMe]);
            } catch (err) {
                console.error("Fetch data error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    /* ---------------- TASK CRUD ---------------- */
    const handleTaskUpdated = (updatedTask) => {
        setTasks((prev) =>
            prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );
    };

    const handleTaskDeleted = (taskId) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    /* ---------------- USER DELETE ---------------- */
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete ${userName}?`)) return;

        try {
            const token = localStorage.getItem("token");

            await api.delete(`/user/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setExistingUserData((prev) => prev.filter((u) => u._id !== userId));
            setCardOrder((prev) => prev.filter((id) => id !== userId));
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async () => {
        try {
            const token = localStorage.getItem("token");

            await api.post(
                "/user/signup",
                { name: formData.name, email: formData.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("User created. Credentials sent by email.");
            setFormData({ name: "", email: "" });
            setShowAddUser(false);

            const res = await api.get("/user/all", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const users = res.data.existingUsers || [];
            setExistingUserData(users);
            setCardOrder(users.map((u) => u._id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create user");
        }
    };

    /* ---------------- TASKS PER USER ---------------- */
    const tasksByUser = useMemo(() => {
        const map = {};
        tasks.forEach((task) => {
            const uid = task.assignedTo?._id;
            if (!uid) return;
            if (!map[uid]) map[uid] = [];
            map[uid].push(task);
        });
        return map;
    }, [tasks]);

    const getTasksForUser = (userId) => tasksByUser[userId] || [];

    /* ---------------- DND SENSORS ---------------- */
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    /* ---------------- DRAG START ---------------- */
    const handleDragStart = ({ active }) => {
        const data = active.data.current;
        if (data?.type === "task") {
            setActiveDragTask(data.task);
        }
    };

    /* ---------------- DRAG END ---------------- */
    const handleDragEnd = async ({ active, over }) => {
        setActiveDragTask(null);
        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        /* ================================
           1) TASK → TASK (same column)
        ================================= */
        if (
            activeData?.type === "task" &&
            overData?.type === "task" &&
            activeData.userId === overData.userId
        ) {
            const userId = activeData.userId;
            const userTasks = getTasksForUser(userId);

            const oldIndex = userTasks.findIndex(
                (t) => `task-${t._id}` === active.id
            );
            const newIndex = userTasks.findIndex(
                (t) => `task-${t._id}` === over.id
            );

            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(userTasks, oldIndex, newIndex);

            setTasks((prev) => {
                const others = prev.filter(
                    (t) => t.assignedTo?._id !== userId
                );
                return [...others, ...reordered];
            });

            return;
        }

        /* ================================
           2) TASK → USER (REASSIGN)
        ================================= */
        if (activeData?.type === "task" && overData?.type === "user") {
            const task = activeData?.task;

            // 🛡️ HARD GUARD
            if (!task || !task.assignedTo) {
                console.warn("Drag data missing task:", activeData);
                return;
            }

            const newUserId = overData.userId;

            if (task.assignedTo._id === newUserId) return;

            try {
                const token = localStorage.getItem("token");

                const res = await api.patch(
                    `/user/tasks/reassign/${task._id}`,
                    { newUserId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const { task: updatedTask, previous } = res.data;

                setLastAction({
                    taskId: updatedTask._id,
                    prevAssignedTo: previous.assignedTo,
                    prevStatus: previous.status,
                });

                setTasks((prev) =>
                    prev.map((t) =>
                        t._id === updatedTask._id ? updatedTask : t
                    )
                );
            } catch (err) {
                console.error("Reassign task error:", err);
            }

            return;
        }

        /* ================================
           3) USER → USER (SWAP COLUMNS)
        ================================= */
        if (
            activeData?.type === "user" &&
            overData?.type === "user" &&
            active.id !== over.id
        ) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                if (oldIndex === -1 || newIndex === -1) return items;
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    /* ---------------- UNDO ---------------- */
    const handleUndo = async () => {
        if (!lastAction) return;

        try {
            const token = localStorage.getItem("token");

            const res = await api.patch(
                `/user/tasks/reassign/${lastAction.taskId}`,
                { newUserId: lastAction.prevAssignedTo },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedTask = res.data.task;
            updatedTask.status = lastAction.prevStatus;

            setTasks((prev) =>
                prev.map((t) =>
                    t._id === updatedTask._id ? updatedTask : t
                )
            );

            setLastAction(null);
        } catch (err) {
            console.error("Undo error:", err);
        }
    };

    /* ---------------- TASK FORM HANDLERS ---------------- */
    const openAddTaskForm = (id) =>
        setOpenTaskForms((p) => ({ ...p, [id]: true }));

    const closeAddTaskForm = (id) =>
        setOpenTaskForms((p) => ({ ...p, [id]: false }));

    const handleTaskInputChange = (id, val) =>
        setTaskInputs((p) => ({ ...p, [id]: val }));

    const handleTaskSubmit = (id) => {
        console.log("Task for", id, taskInputs[id]);
        setTaskInputs((p) => ({ ...p, [id]: "" }));
        closeAddTaskForm(id);
    };

    const openUserModal = (mode, user) => {
        setActiveUser(user);
        setUserActionMode(mode);
    };

    const closeUserModal = () => {
        setActiveUser(null);
        setUserActionMode(null);
    };

    /* ---------------- SKELETON ---------------- */
    if (isLoading) {
        return (
            <div className="min-h-screen w-screen bg-[#020617] pt-24 px-12">
                <div className="flex gap-12 flex-wrap justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <BoardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-screen text-white pt-24 overflow-hidden">
            {/* UNDO TOAST */}
            {lastAction && (
                <div className="fixed top-6 right-6 z-50 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-[0_0_35px_rgba(99,102,241,0.45)]">
                    <span className="text-sm text-gray-200">
                        Task reassigned
                    </span>
                    <button
                        onClick={handleUndo}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
                    >
                        Undo
                    </button>
                </div>
            )}

            {/* VIEW TOGGLE */}
            <div className="relative z-20 flex justify-end px-12 mb-6">
                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-xl">
                    <button
                        onClick={() => setViewMode("board")}
                        className={`px-4 py-2 rounded-lg text-sm transition
                        ${viewMode === "board"
                                ? "bg-indigo-500/30 text-indigo-200"
                                : "text-gray-300 hover:bg-white/10"}`}
                    >
                        Board View
                    </button>

                    <button
                        onClick={() => setViewMode("table")}
                        className={`px-4 py-2 rounded-lg text-sm transition
                        ${viewMode === "table"
                                ? "bg-emerald-500/30 text-emerald-200"
                                : "text-gray-300 hover:bg-white/10"}`}
                    >
                        Table View
                    </button>
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            {viewMode === "board" ? (
                <div className="relative z-10 flex justify-center px-12">
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                    >
                        <SortableContext
                            items={cardOrder}
                            strategy={horizontalListSortingStrategy}
                        >
                            <div className="flex flex-wrap gap-12 max-w-[1600px] w-full items-start justify-center self-start">
                                {cardOrder.map((id) => {
                                    const user = existingUserData.find((u) => u._id === id);
                                    if (!user) return null;

                                    return (
                                        <DropZone key={id} id={id} title={user.name}>
                                            <DragableBox id={id}>
                                                <SortableContext
                                                    items={getTasksForUser(id).map(t => `task-${t._id}`)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <TaskCard
                                                        userName={user.name}
                                                        userId={id}
                                                        onViewUser={(uid) => {
                                                            const u = existingUserData.find(x => x._id === uid);
                                                            openUserModal("view", u);
                                                        }}
                                                        onEditUser={(uid) => {
                                                            const u = existingUserData.find(x => x._id === uid);
                                                            openUserModal("edit", u);
                                                        }}
                                                        onDeleteUserFromMenu={(uid) => {
                                                            const u = existingUserData.find(x => x._id === uid);
                                                            openUserModal("delete", u);
                                                        }}
                                                        tasks={getTasksForUser(id)}
                                                        isTaskFormOpen={!!openTaskForms[id]}
                                                        openAddTaskForm={openAddTaskForm}
                                                        closeAddTaskForm={closeAddTaskForm}
                                                        taskInput={taskInputs[id] || ""}
                                                        onTaskInputChange={handleTaskInputChange}
                                                        handleTaskSubmit={handleTaskSubmit}
                                                        onTaskUpdated={handleTaskUpdated}
                                                        onTaskDeleted={handleTaskDeleted}
                                                    />
                                                </SortableContext>
                                            </DragableBox>
                                        </DropZone>
                                    );
                                })}
                            </div>
                        </SortableContext>

                        {/* ADD USER CARD */}
                        <DropZone id="add-user-zone" title="Add User">
                            <DragableBox id="add-user-card">
                                <AddUserCard
                                    showAddUser={showAddUser}
                                    setShowAddUser={setShowAddUser}
                                    formData={formData}
                                    handleFormChange={handleFormChange}
                                    handleAddUser={handleAddUser}
                                    showEmailInput={showEmailInput}
                                    setShowEmailInput={setShowEmailInput}
                                    setShowAddTask={setShowAddTask}
                                />
                            </DragableBox>
                        </DropZone>

                        {/* DRAG PREVIEW */}
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeDragTask ? (
                                <div className="px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-[0_0_45px_rgba(99,102,241,0.45)]">
                                    <div className="font-medium text-sm">
                                        {activeDragTask.taskTitle}
                                    </div>
                                    <div className="text-[11px] text-gray-300 mt-1">
                                        Assigned by {activeDragTask.assignedBy?.name}
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            ) : (
                <div className="relative z-10 px-12 w-full">
                    <TaskTableView
                        tasks={tasks}
                        onTaskUpdated={handleTaskUpdated}
                        onTaskDeleted={handleTaskDeleted}
                    />
                </div>
            )}

            {/* USER MODAL */}
            <UserActionModal
                isOpen={!!activeUser}
                mode={userActionMode}
                user={activeUser}
                onClose={closeUserModal}
                onUpdated={(updatedUser) => {
                    setExistingUserData(prev =>
                        prev.map(u => u._id === updatedUser._id ? updatedUser : u)
                    );
                }}
                onDeleted={(id) => {
                    setExistingUserData(prev => prev.filter(u => u._id !== id));
                    setCardOrder(prev => prev.filter(uid => uid !== id));
                }}
            />
        </div>
    );
};

/* ---------------- SKELETON CARD ---------------- */
const BoardSkeleton = () => {
    return (
        <div className="relative w-72 h-fit min-h-[140px] rounded-2xl bg-white/5 border border-white/10 p-5 animate-pulse shadow-[0_0_30px_rgba(0,0,0,0.4)]">
            <div className="h-3 w-24 bg-white/20 rounded mb-5" />
            <div className="space-y-4">
                <div className="h-9 bg-white/10 rounded-lg" />
                <div className="h-9 bg-white/10 rounded-lg" />
                <div className="h-9 bg-white/10 rounded-lg" />
            </div>
        </div>
    );
};

/* ---------------- TABLE VIEW ---------------- */
const TaskTableView = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl bg-white/5">
                <thead className="bg-white/10">
                    <tr className="text-left text-xs uppercase tracking-wider text-indigo-200">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Assigned By</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Urgency</th>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-white/10 text-sm">
                    {tasks.map((t) => (
                        <tr key={t._id} className="hover:bg-white/10 transition">
                            <td className="px-4 py-3 font-medium">{t.taskTitle}</td>
                            <td className="px-4 py-3">{t.assignedTo?.name}</td>
                            <td className="px-4 py-3">{t.assignedBy?.name}</td>

                            <td className="px-4 py-3">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs
                                    ${t.status === "Completed"
                                            ? "bg-emerald-500/20 text-emerald-300"
                                            : t.status === "In Progress"
                                                ? "bg-indigo-500/20 text-indigo-300"
                                                : "bg-yellow-500/20 text-yellow-300"}`}
                                >
                                    {t.status}
                                </span>
                            </td>

                            <td className="px-4 py-3">{t.urgency}</td>

                            <td className="px-4 py-3">
                                {new Date(t.dueDate).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() =>
                                            onTaskUpdated({ ...t, status: "Completed" })
                                        }
                                        className="px-3 py-1 rounded-lg text-xs
                                        bg-emerald-500/20 text-emerald-300
                                        hover:bg-emerald-500/30 transition"
                                    >
                                        Complete
                                    </button>

                                    <button
                                        onClick={() => onTaskDeleted(t._id)}
                                        className="px-3 py-1 rounded-lg text-xs
                                        bg-red-500/20 text-red-300
                                        hover:bg-red-500/30 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center py-8 text-gray-400">
                                No tasks available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Boards;
