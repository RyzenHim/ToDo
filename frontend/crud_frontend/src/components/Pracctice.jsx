import axios from "axios";
import React, { useEffect, useState } from "react";
import api from '../api/axios'
const Pracctice = () => {
    const [loading, setLoading] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState('')
    const [tasks, settasks] = useState([])
    const [totalTasksCount, setTotalTasksCount] = useState('')
    const [totalTaskAssignedToMe, setTotalTaskAssignedToMe] = useState('')
    const [totalTaskAssignedByMe, setTotalTaskAssignedByMe] = useState('')
    const [otherUserNameThanMe, setOtherUserNameThanMe] = useState([])
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

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

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>

            <div className="w-screen h-auto bg-gray-900 flex items-center justify-center text-white">
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
                    <p>
                        total number of tasks assigned to me
                    </p>

                    <div className="border">

                        <h1>Tasks id</h1>

                        {tasks.map((e) => (
                            <>
                                <p>{e._id}</p>
                                <p>{e.taskTitle}</p>
                                <p>{e.status}</p>

                            </>
                        ))}

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
