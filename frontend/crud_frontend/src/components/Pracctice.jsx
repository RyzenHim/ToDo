import axios from "axios";
import React, { useEffect, useState } from "react";
import api from '../api/axios'
import { DndContext } from '@dnd-kit/core'
import DragableBox from "./dnd/DragableBox";
import DropZone from "./dnd/DropZone";

const Pracctice = () => {
    const [loading, setLoading] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState('')
    const [tasks, settasks] = useState([])
    const [totalTasksCount, setTotalTasksCount] = useState('')
    const [totalTaskAssignedToMe, setTotalTaskAssignedToMe] = useState('')
    const [totalTaskAssignedByMe, setTotalTaskAssignedByMe] = useState('')
    const [otherUserNameThanMe, setOtherUserNameThanMe] = useState([])
    const [formData, setFormData] = useState({
        title: "", assignto: "", urgency: "", date: "", time: "", file: "", color: "", taskDetail: ""
    })
    const [dragableTasks, useDragableTasks] = useState([
        { id: 1, title: "Add tasks" },
        { id: 2, title: "Add tasks 2" },
        { id: 3, title: "Add tasks 3" }
    ])

    const [leftItems, setLeftItems] = useState([
        { id: "1", title: "Task 1" },
        { id: "2", title: "Task 2" }
    ]);
    const [rightItems, setRightItems] = useState([]);
    useEffect(() => {

        const fetchfunction = async () => {
            const fetchData = await api.get('/user/practice', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }
            )
            setLoggedInUser(fetchData.data.name)
            settasks(fetchData.data.tasks)
            setTotalTasksCount(fetchData.data.totalTasksCount)
            setTotalTaskAssignedToMe(fetchData.data.totalTaskAssignedToMe)
            setTotalTaskAssignedByMe(fetchData.data.totalTaskAssignedByMe)
            setOtherUserNameThanMe(fetchData.data.setOtherUserNameThanMe)
            // console.log("fetchData.data.setOtherUserNameThanMe", fetchData.data.setOtherUserNameThanMe)
            // console.log(fetchData.data.tasks);
            console.log("detailsOfTask", fetchData.data.detailsOfTask);
            console.log("detailsOfTask", fetchData.data.detailsOfTask.length);

        }
        fetchfunction()
    }, [])


    const handleChange = (e) => {
        // const { title, assignto, urgency, date, time, file, color, taskDetail } = e.target
        const { name, value } = e.target
        console.log(e.target);
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))

    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(formData);

        try {
            await api.post(
                '/user/practice',
                formData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            )

        } catch (err) {
            console.log(err);
        }

    }
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        // ---------- LEFT → RIGHT ----------
        if (over.id === "right") {
            const item = leftItems.find(i => i.id === active.id);
            if (!item) return;

            setLeftItems(prev => prev.filter(i => i.id !== active.id));
            setRightItems(prev => [...prev, item]);
        }

        // ---------- RIGHT → LEFT ----------
        if (over.id === "left") {
            const item = rightItems.find(i => i.id === active.id);
            if (!item) return;

            setRightItems(prev => prev.filter(i => i.id !== active.id));
            setLeftItems(prev => [...prev, item]);
        }
    };

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>

            <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center text-white">


                <div className="flex flex-col gap-6">
                    <h1 className="text-white text-2xl text-center">Practice</h1>
                    {/* //for reusable button with skeleton */}
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <>
                                <SkeletonBt width="180px" height="48px" />
                                <SkeletonBt width="220px" height="48px" />
                            </>
                        ) : (
                            <>
                                <Bt name="Click me I'm button 1" />
                                <Bt name="Click me I'm button 2" />
                            </>
                        )}
                    </div>

                    {/* //for number of assignedtome and assignedbyme */}

                    <p>
                        Logged in user is {loggedInUser}
                    </p>


                    {/* for draggable */}
                    <DndContext onDragEnd={handleDragEnd}>
                        <div style={{ display: "flex", gap: 40 }}>

                            <DropZone id="left" title="Left">
                                {leftItems.map(item => (
                                    <DragableBox
                                        key={item.id}
                                        id={item.id}
                                        label={item.title}
                                    />
                                ))}
                            </DropZone>

                            <DropZone id="right" title="Right">
                                {rightItems.map(item => (
                                    <DragableBox
                                        key={item.id}
                                        id={item.id}
                                        label={item.title}
                                    />
                                ))}
                            </DropZone>

                        </div>
                    </DndContext>








                    <div className="border px-10 h-200 bg-gray-800 ">

                        <h1>Add task</h1>

                        <form
                            onSubmit={handleSubmit}
                            className="flex gap-4 flex-col items-center border border-white p-4">
                            <label htmlFor="title">Task Title</label>
                            <input value={formData.title} onChange={handleChange} type="text" name="title" id="title" placeholder="Enter task title" />

                            <select value={formData.assignto} onChange={handleChange} name="assignto" className="select" >
                                <option value="">Assign to</option>
                            </select>
                            <select value={formData.urgency} onChange={handleChange} name="urgency" className="select">
                                <option >Urgency</option>
                            </select>
                            <input value={formData.date} onChange={handleChange} type="date" name="date" id="" />
                            <input value={formData.time} onChange={handleChange} type="time" name="time" id="" />
                            <input value={formData.file} onChange={handleChange} type="file" name="file" id="" />
                            <input value={formData.color} onChange={handleChange} type="color" name="color" id="" />

                            <input type="text" name="taskDetail" value={formData.taskDetail} onChange={handleChange} id="" placeholder="Task Detail" />
                            <button className="border rounded-xl p-4" type="submit">Submit Form</button>
                        </form>

                    </div>
                    <div className="border m-2">
                        <h1>Length of the all tasks </h1>
                        <p>{totalTasksCount}</p>
                    </div>
                    <div className="border m-2">
                        <h1>Length of the all tasks assigned to me </h1>
                        <p>{totalTaskAssignedToMe}</p>
                    </div>
                    <div className="border m-2">
                        <h1>Length of the all tasks assigned by me </h1>
                        <p>{totalTaskAssignedByMe}</p>
                    </div>


                </div>
            </div>
        </>
    );
};

const Bt = ({ name }) => (
    <>
        <button className="px-6 py-3 rounded-md border border-white/30 text-white hover:bg-white/10 transition">
        </button>
        <div>


        </div>
    </>

);

const SkeletonBt = ({ width = "160px", height = "48px" }) => (
    <div
        className="relative overflow-hidden rounded-md bg-white/10"
        style={{ width, height }}
    >
        <div
            className="absolute inset-0"
            style={{
                background:
                    "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.25) 37%, transparent 63%)",
                animation: "shimmer 1.4s infinite",
            }}
        />
    </div>
);

export default Pracctice;
