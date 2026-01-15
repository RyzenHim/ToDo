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

                /* USERS */
                const users = userRes.data.existingUsers || [];
                setExistingUserData(users);
                setCardOrder(users.map((u) => u._id));

                /* TASKS (same source as Calendar & Mytasks) */
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

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete ${userName}?`)) return;

        try {
            const token = localStorage.getItem("token");

            await api.delete(`/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setExistingUserData((prev) =>
                prev.filter((u) => u._id !== userId)
            );

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
                {
                    name: formData.name,
                    email: formData.email,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
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
           1) TASK → TASK (same card sort)
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
            const task = activeData.task;
            const newUserId = overData.userId;

            if (task.assignedTo._id === newUserId) return;

            try {
                const token = localStorage.getItem("token");

                const res = await api.patch(
                    `/tasks/reassign/${task._id}`,
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
                `/tasks/reassign/${lastAction.taskId}`,
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

            {/* BACKGROUND */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-[-40%] aurora-bg" />
                <div className="absolute inset-0 light-beams" />
                <div className="absolute inset-0 particles-layer" />
            </div>

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

            {/* CONTENT */}
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
                        <div className="flex flex-wrap gap-12 max-w-[1600px] w-full items-start justify-center">
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
                                                    onDeleteUser={handleDeleteUser}
                                                    userId={id}
                                                    tasks={getTasksForUser(id)}
                                                    isTaskFormOpen={!!openTaskForms[id]}
                                                    openAddTaskForm={openAddTaskForm}
                                                    closeAddTaskForm={closeAddTaskForm}
                                                    taskInput={taskInputs[id] || ""}
                                                    onTaskInputChange={handleTaskInputChange}
                                                    handleTaskSubmit={handleTaskSubmit}
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
        </div>
    );
};

/* ---------------- SKELETON CARD ---------------- */
const BoardSkeleton = () => {
    return (
        <div className="w-72 min-h-[300px] rounded-2xl bg-white/5 border border-white/10 p-5 animate-pulse shadow-[0_0_30px_rgba(0,0,0,0.4)]">
            <div className="h-3 w-24 bg-white/20 rounded mb-5" />
            <div className="space-y-4">
                <div className="h-9 bg-white/10 rounded-lg" />
                <div className="h-9 bg-white/10 rounded-lg" />
                <div className="h-9 bg-white/10 rounded-lg" />
            </div>
        </div>
    );
};

export default Boards;
