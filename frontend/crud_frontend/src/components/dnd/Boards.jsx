import React, { useEffect, useState } from "react";
import DragableBox from "./DragableBox";
import DropZone from "./DropZone";
import TaskCard from "./TaskCard";
import AddUserCard from "./AddUserCard";
import { DndContext } from "@dnd-kit/core";
import api from "../../api/axios";

const Boards = () => {
    const [showAddUser, setShowAddUser] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });

    const [existingUserData, setExistingUserData] = useState([]);
    const [cardOrder, setCardOrder] = useState([]);

    const [openTaskForms, setOpenTaskForms] = useState({});
    const [taskInputs, setTaskInputs] = useState({});

    useEffect(() => {
        const apiFunc = async () => {
            try {
                const apiData = await api.get("/user/all", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const users = apiData.data.existingUsers;
                setExistingUserData(users);
                setCardOrder(users.map((u) => u._id));
            } catch (err) {
                console.log(err);
            }
        };

        apiFunc();
    }, []);

    /* ---------- SWAP ---------- */
    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        setCardOrder((prev) => {
            const oldIndex = prev.indexOf(active.id);
            const newIndex = prev.indexOf(over.id);
            if (oldIndex === -1 || newIndex === -1) return prev;

            const updated = [...prev];
            [updated[oldIndex], updated[newIndex]] = [
                updated[newIndex],
                updated[oldIndex],
            ];
            return updated;
        });
    };

    /* ---------- USER FORM ---------- */
    const handleAddUser = () => {
        console.log(formData);
        setFormData({ name: "", email: "" });
        setShowEmailInput(false);
        setShowAddTask(true);
    };

    const handleFormChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    /* ---------- TASK FORM ---------- */
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

    return (
        <div className="relative min-h-screen w-screen text-white pt-24 overflow-hidden">
            {/* PREMIUM BACKGROUND */}
            <div
                className="absolute inset-[-40%]"
                style={{
                    background:
                        "linear-gradient(120deg,#020617,#0f172a,#1e293b,#312e81,#020617)",
                    backgroundSize: "600% 600%",
                    animation: "aurora 35s ease-in-out infinite",
                }}
            />

            {/* SOFT GLOW */}
            <div
                className="pointer-events-none absolute -top-40 -left-40 w-[720px] h-[720px] rounded-full blur-[280px]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)",
                }}
            />

            {/* CONTENT */}
            <div className="relative z-10 flex justify-center px-8">
                <DndContext onDragEnd={handleDragEnd}>
                    {/* GRID */}
                    <div
                        className="
                            grid gap-8
                            grid-cols-1
                            sm:grid-cols-2
                            md:grid-cols-3
                            lg:grid-cols-4
                            xl:grid-cols-5
                            place-items-start
                        "
                    >
                        {cardOrder.map((id) => {
                            const user = existingUserData.find((u) => u._id === id);
                            if (!user) return null;

                            return (
                                <DropZone key={id} id={id} title={user.name}>
                                    <DragableBox id={id}>
                                        <TaskCard
                                            userName={user.name}
                                            userId={id}
                                            isTaskFormOpen={!!openTaskForms[id]}
                                            openAddTaskForm={openAddTaskForm}
                                            closeAddTaskForm={closeAddTaskForm}
                                            taskInput={taskInputs[id] || ""}
                                            onTaskInputChange={handleTaskInputChange}
                                            handleTaskSubmit={handleTaskSubmit}
                                        />
                                    </DragableBox>
                                </DropZone>
                            );
                        })}

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
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

export default Boards;
