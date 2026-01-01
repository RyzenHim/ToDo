import axios from "axios";
import { useEffect, useRef, useState } from "react";
import MyTaskSection from "./MyTaskSection";
import EditTaskModal from "./EditTaskModal";
import DetailTaskModal from "./DetailTaskModal";
import moment from "moment";
import api from '../../api/axios'
const Mytasks = () => {
    const bgRef = useRef(null);
    const glowRef = useRef(null);

    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    const [loading, setLoading] = useState(true);
    const [assignedToMe, setAssignedToMe] = useState([]);
    const [assignedByMe, setAssignedByMe] = useState([]);
    const [countTaskAssignedToMe, setCountTaskAssignedToMe] = useState("");
    const [countTaskAssignedByMe, setCountTaskAssignedByMe] = useState("");
    const [taskByPersonsToMe, setTaskByPersonsToMe] = useState([]);
    const [taskByPersonsByMe, setTaskByPersonsByMe] = useState([]);
    const [searchTo, setSearchTo] = useState("");
    const [searchBy, setSearchBy] = useState("");
    const [sortPersonTo, setSortPersonTo] = useState("");
    const [sortPersonBy, setSortPersonBy] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [detailTask, setDetailTask] = useState(null);
    const [editingType, setEditingType] = useState(null);

    /* SECTION FILTERS */
    const [filtersToMe, setFiltersToMe] = useState({
        status: "",
        urgency: "",
        dueDate: ""
    });

    const [filtersByMe, setFiltersByMe] = useState({
        status: "",
        urgency: "",
        dueDate: ""
    });

    /* DUE DATE SORT */
    const [dueSortToMe, setDueSortToMe] = useState("");
    const [dueSortByMe, setDueSortByMe] = useState("");

    /* ================= FETCH ================= */
    useEffect(() => {

        fetchData();
    }, []);
    async function fetchData() {
        try {
            const res = await api.get(
                "/user/mytasks",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            setAssignedToMe(res.data.assignedToMe || []);
            setAssignedByMe(res.data.assignedByMe || []);
            setCountTaskAssignedToMe(res.data.countTaskAssignedToMe);
            setCountTaskAssignedByMe(res.data.countTaskAssignedByMe);
            setTaskByPersonsToMe(res.data.taskByPersonsToMe);
            setTaskByPersonsByMe(res.data.taskByPersonsByMe);

        } catch (err) {
            console.error("Error fetching mytasks:", err);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    }
    /* ================= SEARCH ================= */
    const searchResultToMe = assignedToMe.filter(e => {
        const q = searchTo.toLowerCase().trim();
        return (
            e.taskTitle.toLowerCase().includes(q) ||
            e.status.toLowerCase().includes(q) ||
            (e.assignedBy?.name || "").toLowerCase().includes(q)
        );
    });

    const searchResultByMe = assignedByMe.filter(e => {
        const q = searchBy.toLowerCase().trim();
        return (
            e.taskTitle.toLowerCase().includes(q) ||
            e.status.toLowerCase().includes(q) ||
            (e.assignedTo?.name || "").toLowerCase().includes(q)
        );
    });

    /* ================= FILTER ENGINE ================= */
    const applyFilters = (tasks, filters) =>
        tasks.filter(task => {
            const statusMatch = filters.status ? task.status === filters.status : true;
            const urgencyMatch = filters.urgency ? task.urgency === filters.urgency : true;
            const dueDateMatch =
                filters.dueDate && task.dueDate
                    ? moment(task.dueDate).isSame(filters.dueDate, "day")
                    : !filters.dueDate;

            return statusMatch && urgencyMatch && dueDateMatch;
        });

    /* ================= DUE DATE SORT ================= */
    const applyDueDateSort = (tasks, sortOrder) => {
        if (!sortOrder) return tasks;

        return [...tasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            const diff =
                moment(a.dueDate).valueOf() -
                moment(b.dueDate).valueOf();

            return sortOrder === "asc" ? diff : -diff;
        });
    };

    /* ================= FINAL TASK LISTS ================= */
    const finalToMeTasks = applyDueDateSort(
        applyFilters(
            sortPersonTo
                ? searchResultToMe.filter(e => e.assignedBy?.name === sortPersonTo)
                : searchResultToMe,
            filtersToMe
        ),
        dueSortToMe
    );

    const finalByMeTasks = applyDueDateSort(
        applyFilters(
            sortPersonBy
                ? searchResultByMe.filter(e => e.assignedTo?.name === sortPersonBy)
                : searchResultByMe,
            filtersByMe
        ),
        dueSortByMe
    );

    /* ================= BACKGROUND MOTION ================= */
    useEffect(() => {
        const onMouseMove = (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            target.current.x = (e.clientX - cx) / cx;
            target.current.y = (e.clientY - cy) / cy;
        };
        window.addEventListener("mousemove", onMouseMove);

        const animate = () => {
            current.current.x += (target.current.x - current.current.x) * 0.04;
            current.current.y += (target.current.y - current.current.y) * 0.04;

            if (bgRef.current) {
                bgRef.current.style.transform =
                    `translate(${current.current.x * 14}px, ${current.current.y * 14}px)`;
            }
            if (glowRef.current) {
                glowRef.current.style.transform = `
                    translate(
                        ${window.innerWidth / 2 + current.current.x * 200 - 360}px,
                        ${window.innerHeight / 2 + current.current.y * 200 - 360}px
                    )
                `;
            }
            requestAnimationFrame(animate);
        };
        animate();

        return () => window.removeEventListener("mousemove", onMouseMove);
    }, []);

    const handleEditTask = (task, type) => {
        setEditingTask(task);
        setEditingType(type);
    };

    const handleViewTask = (task) => setDetailTask(task);

    return (
        <>
            <style>{`
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes floatSoft {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>

            <div className="relative min-h-screen w-screen overflow-hidden pt-16 px-6">

                {/* BACKGROUND */}
                <div
                    ref={bgRef}
                    className="absolute inset-[-30%]"
                    style={{
                        background:
                            "linear-gradient(120deg,#020617,#0f172a,#1e293b,#312e81,#020617)",
                        backgroundSize: "600% 600%",
                        animation: "aurora 35s ease-in-out infinite",
                    }}
                />

                {/* GLOW */}
                <div
                    ref={glowRef}
                    className="pointer-events-none absolute w-[760px] h-[760px] rounded-full blur-[300px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.35), transparent 65%)",
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 animate-[floatSoft_6s_ease-in-out_infinite]">
                    <MyTaskSection
                        type="toMe"
                        title="Assigned To Me"
                        subtitle="Incoming responsibilities"
                        loading={loading}
                        tasks={finalToMeTasks}
                        taskCount={countTaskAssignedToMe}
                        labelKey="assignedBy"
                        taskByPersonsToMe={taskByPersonsToMe}
                        search={searchTo}
                        setSearch={setSearchTo}
                        sortByPerson={sortPersonTo}
                        setSortByPerson={setSortPersonTo}

                        filters={filtersToMe}
                        setFilters={setFiltersToMe}
                        dueSort={dueSortToMe}
                        setDueSort={setDueSortToMe}
                        onEditTask={handleEditTask}
                        onViewTask={handleViewTask}
                        editingTask={editingTask}
                    />

                    <MyTaskSection
                        type="byMe"
                        title="Assigned By Me"
                        subtitle="Tasks you’ve delegated"
                        loading={loading}
                        tasks={finalByMeTasks}
                        taskCount={countTaskAssignedByMe}
                        labelKey="assignedTo"
                        taskByPersonsByMe={taskByPersonsByMe}
                        search={searchBy}
                        setSearch={setSearchBy}
                        sortByPerson={sortPersonBy}
                        setSortByPerson={setSortPersonBy}

                        filters={filtersByMe}
                        setFilters={setFiltersByMe}
                        dueSort={dueSortByMe}
                        setDueSort={setDueSortByMe}
                        onEditTask={handleEditTask}
                        onViewTask={handleViewTask}
                        editingTask={editingTask}
                    />
                </div>
                <EditTaskModal
                    isOpen={!!editingTask}
                    task={editingTask}
                    type={editingType}
                    onClose={() => {
                        setEditingTask(null);
                        setEditingType(null);
                    }}
                    onSuccess={fetchData}
                />

                <DetailTaskModal
                    isOpen={!!detailTask}
                    task={detailTask}
                    onClose={() => setDetailTask(null)}
                />
            </div>
        </>
    );
};

export default Mytasks;
