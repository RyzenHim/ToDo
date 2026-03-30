import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import api from "../../api/axios";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "./taskCalender.css";
import { FiMaximize, FiMinimize, FiX } from "react-icons/fi";

const TaskCalendar = () => {
    const [assignedToMe, setAssignedToMe] = useState([]);
    const [assignedByMe, setAssignedByMe] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    /* ✅ LOADER STATE */
    const [loading, setLoading] = useState(false);

    const calendarRef = useRef(null);
    const wrapperRef = useRef(null);

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true); // ✅ start loader

            const res = await api.get("/user/mytasks", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setAssignedToMe(res.data.assignedToMe || []);
            setAssignedByMe(res.data.assignedByMe || []);
        } catch (err) {
            console.error("Calendar fetch error:", err);
        } finally {
            setLoading(false); // ✅ stop loader
            setIsInitialLoad(false);
        }
    }

    /* ================= MOUSE FOLLOW GLOW ================= */
    useEffect(() => {
        const handleMove = (e) => {
            document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
            document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
        };

        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    /* ================= KEYBOARD ================= */
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                setActiveTask(null);
            }

            if (e.key.toLowerCase() === "f") toggleFullScreen();
            if (e.key.toLowerCase() === "t")
                calendarRef.current?.getApi().today();
            if (e.key === "ArrowLeft")
                calendarRef.current?.getApi().prev();
            if (e.key === "ArrowRight")
                calendarRef.current?.getApi().next();
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    /* ================= DATA ================= */
    const allTasks = useMemo(
        () => [...assignedToMe, ...assignedByMe],
        [assignedToMe, assignedByMe]
    );

    const events = useMemo(() => {
        return allTasks
            .filter((t) => t.dueDate)
            .map((t) => ({
                id: t._id,
                title: t.taskTitle,
                start: moment(t.dueDate).year(moment().year()).toISOString(),
                allDay: true,
                backgroundColor: t.color || "#6366f1",
                extendedProps: {
                    description: t.taskDescription,
                    status: t.status,
                    urgency: t.urgency,
                    assignedTo: t.assignedTo?.name,
                    assignedBy: t.assignedBy?.name,
                },
            }));
    }, [allTasks]);

    /* ================= REAL FULLSCREEN ================= */
    const toggleFullScreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await wrapperRef.current.requestFullscreen();
                document.body.classList.add("calendar-fs-active");
                setIsFullScreen(true);
            } else {
                await document.exitFullscreen();
                document.body.classList.remove("calendar-fs-active");
                setIsFullScreen(false);
            }

            setTimeout(() => {
                calendarRef.current?.getApi().updateSize();
                window.dispatchEvent(new Event("resize"));
            }, 300);
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    };

    /* ================= DRAG FEEDBACK ================= */
    const handleDragStart = () => {
        document.body.classList.add("calendar-dragging");
    };

    const handleDragStop = () => {
        document.body.classList.remove("calendar-dragging");
    };

    return (
        <div
            ref={wrapperRef}
            className={`calendar-shell ${isFullScreen ? "fullscreen" : ""}`}
        >
            {/* ================= HEADER ================= */}
            <div className="calendar-topbar">
                <h1 className="calendar-title">My Task Calendar</h1>

                <div className="calendar-actions">
                    <button
                        onClick={toggleFullScreen}
                        className="calendar-icon-btn"
                        title="Toggle Fullscreen (F)"
                    >
                        {isFullScreen ? <FiMinimize /> : <FiMaximize />}
                    </button>
                </div>
            </div>

            {/* ================= LOADER ================= */}
            {/* ================= SKELETON LOADER ================= */}
            {loading && (
                <div className="calendar-skeleton">
                    <div className="skeleton-header" />
                    <div className="skeleton-grid">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="skeleton-cell" />
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="calendar-loader">
                    <p>Loading tasks...</p>
                </div>
            )}

            {/* ================= CALENDAR ================= */}
            {!isInitialLoad && !loading && (
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={events}
                    editable
                    selectable
                    height="auto"
                    dayMaxEvents={3}
                    nowIndicator

                    eventDidMount={(info) => {
                        const e = info.event.extendedProps;

                        tippy(info.el, {
                            content: `
                              <div style="font-size:12px">
                                <b>${info.event.title}</b><br/>
                                <b>Status:</b> ${e.status}<br/>
                                <b>Urgency:</b> ${e.urgency}<br/>
                                <b>To:</b> ${e.assignedTo || "-"}<br/>
                                <b>By:</b> ${e.assignedBy || "-"}
                              </div>
                            `,
                            allowHTML: true,
                            theme: "light-border",
                        });
                    }}

                    eventClick={(info) => {
                        setActiveTask({
                            title: info.event.title,
                            ...info.event.extendedProps,
                            dueDate: info.event.start,
                        });
                    }}

                    eventDragStart={handleDragStart}
                    eventDragStop={handleDragStop}

                    eventDrop={async (info) => {
                        const newDate = moment(info.event.start).toISOString();

                        try {
                            await api.patch(
                                `/tasks/update/${info.event.id}`,
                                { dueDate: newDate },
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                }
                            );
                        } catch (err) {
                            console.error("Failed to update due date");
                            info.revert();
                        }
                    }}
                />
            )}

            {/* ================= MODAL ================= */}
            {activeTask && (
                <div className="calendar-modal-backdrop">
                    <div className="calendar-modal">
                        <button
                            className="modal-close"
                            onClick={() => setActiveTask(null)}
                        >
                            <FiX />
                        </button>

                        <h2>{activeTask.title}</h2>
                        <p><b>Status:</b> {activeTask.status}</p>
                        <p><b>Urgency:</b> {activeTask.urgency}</p>
                        <p><b>Assigned To:</b> {activeTask.assignedTo}</p>
                        <p><b>Assigned By:</b> {activeTask.assignedBy}</p>
                        <p><b>Description:</b> {activeTask.description}</p>
                        <p>
                            <b>Due:</b>{" "}
                            {moment(activeTask.dueDate).format("DD MMM YYYY")}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCalendar;
