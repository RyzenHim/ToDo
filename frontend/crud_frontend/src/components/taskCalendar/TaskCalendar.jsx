import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import api from "../../api/axios";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "./taskCalender.css";

const TaskCalendar = () => {
    const [assignedToMe, setAssignedToMe] = useState([]);
    const [assignedByMe, setAssignedByMe] = useState([]);
    const [activeTask, setActiveTask] = useState(null);

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await api.get("/user/mytasks", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setAssignedToMe(res.data.assignedToMe || []);
            setAssignedByMe(res.data.assignedByMe || []);
            console.log("Calendar API response:", res.data);
        } catch (err) {
            console.error("Calendar fetch error:", err);
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

    /* ================= DRAG FEEDBACK ================= */
    const handleDragStart = () => {
        document.body.classList.add("calendar-dragging");
    };

    const handleDragStop = () => {
        document.body.classList.remove("calendar-dragging");
    };

    return (
        <div className="calendar-glass-container">
            <h1 className="calendar-title">My Task Calendar</h1>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={events[0]?.start}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                editable
                selectable
                height="auto"

                /* ================= TOOLTIP ================= */
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

                /* ================= CLICK → MODAL ================= */
                eventClick={(info) => {
                    setActiveTask({
                        title: info.event.title,
                        ...info.event.extendedProps,
                        dueDate: info.event.start,
                    });
                }}

                /* ================= DRAG UX ================= */
                eventDragStart={handleDragStart}
                eventDragStop={handleDragStop}

                /* ================= UPDATE DATE ================= */
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

            {/* ================= MODAL ================= */}
            {activeTask && (
                <div className="calendar-modal-backdrop">
                    <div className="calendar-modal">
                        <h2>{activeTask.title}</h2>
                        <p><b>Status:</b> {activeTask.status}</p>
                        <p><b>Urgency:</b> {activeTask.urgency}</p>
                        <p><b>Assigned To:</b> {activeTask.assignedTo}</p>
                        <p><b>Assigned By:</b> {activeTask.assignedBy}</p>
                        <p><b>Description:</b> {activeTask.description}</p>
                        <p>
                            <b>Due:</b> {moment(activeTask.dueDate).format("DD MMM YYYY")}
                        </p>

                        <button onClick={() => setActiveTask(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCalendar;
