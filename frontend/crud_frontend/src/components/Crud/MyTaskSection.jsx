import moment from "moment";

const MyTaskSection = ({
    type,
    title,
    subtitle,
    taskCount,
    loading,
    tasks,
    taskByPersonsToMe,
    taskByPersonsByMe,
    labelKey,
    search,
    setSearch,
    sortByPerson,
    setSortByPerson,

    filters,
    setFilters,
    dueSort,
    setDueSort,
    onEditTask,
    onViewTask

}) => {

    const handleClearFilters = () => {
        setFilters({ status: "", urgency: "", dueDate: "" });
        setDueSort("");
        setSortByPerson("");
        setSearch("");
    };

    return (
        <div className="space-y-12 min-w-0">

            {/* ================= GLASS HEADER ================= */}
            <div className="relative rounded-3xl
                            bg-white/10 backdrop-blur-[28px]
                            border border-white/20
                            shadow-[0_40px_120px_rgba(0,0,0,0.6)]
                            overflow-hidden mt-16">

                <div className="absolute inset-0 bg-gradient-to-br
                                from-indigo-500/25 via-transparent to-fuchsia-500/25
                                blur-3xl opacity-70" />

                <div className="relative p-7 space-y-6">

                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-white tracking-wide">
                                {title}
                            </h2>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                {subtitle}
                            </p>
                        </div>

                        <span className="px-5 py-1.5 rounded-full text-sm
                                         bg-indigo-500/20 text-indigo-300
                                         border border-indigo-400/30">
                            {taskCount} Tasks
                        </span>
                    </div>

                    {/* SEARCH + PERSON */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks, status, person..."
                            className="md:col-span-2 px-4 py-2.5 rounded-xl
                                       bg-black/40 backdrop-blur
                                       border border-white/20
                                       text-white placeholder-gray-400"
                        />

                        <select
                            value={sortByPerson}
                            onChange={(e) => setSortByPerson(e.target.value)}
                            className="px-3 py-2.5 rounded-xl
                                       bg-black/40 backdrop-blur
                                       border border-white/20
                                       text-white"
                        >
                            <option className="bg-gray-800" value="">Person</option>
                            {(type === "byMe" ? taskByPersonsByMe : taskByPersonsToMe)
                                ?.map(p => (
                                    <option className="bg-gray-800" key={p.userId} value={p.name}>
                                        {p.name} ({p.taskCount})
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* FILTER BAR */}
                    <div className="flex justify-between flex-wrap gap-4">
                        <div className="flex gap-3">
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters(prev => ({ ...prev, status: e.target.value }))
                                }
                                className="px-3 py-1.5 rounded-xl bg-white/10 text-white border border-white/20"
                            >
                                <option className="bg-gray-800" value="">Status</option>
                                <option className="bg-gray-800" value="Pending">Pending</option>
                                <option className="bg-gray-800" value="In Progress">In Progress</option>
                                <option className="bg-gray-800" value="Completed">Completed</option>
                            </select>

                            <select
                                value={filters.urgency}
                                onChange={(e) =>
                                    setFilters(prev => ({ ...prev, urgency: e.target.value }))
                                }
                                className="px-3 py-1.5 rounded-xl bg-white/10 text-white border border-white/20 "
                            >
                                <option className="bg-gray-800" value="Low">Low</option>
                                <option className="bg-gray-800" value="">Urgency</option>
                                <option className="bg-gray-800" value="Medium">Medium</option>
                                <option className="bg-gray-800" value="High">High</option>
                            </select>

                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-1.5 rounded-xl text-sm
                                           bg-white/10 text-gray-100
                                           border border-white/20
                                           hover:bg-rose-500/20 hover:text-rose-300
                                           transition-all"
                            >
                                Clear Filters
                            </button>
                        </div>

                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setDueSort("asc")}
                                className={`px-3 py-1.5 rounded-xl text-white
                                ${dueSort === "asc"
                                        ? "bg-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,.7)]"
                                        : "bg-white/10 hover:bg-white/20"}`}
                            >
                                ↑ Nearest
                            </button>

                            <button
                                onClick={() => setDueSort("desc")}
                                className={`px-3 py-1.5 rounded-xl text-white
                                ${dueSort === "desc"
                                        ? "bg-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,.7)]"
                                        : "bg-white/10 hover:bg-white/20"}`}
                            >
                                ↓ Farthest
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= TASK LIST ================= */}
            <div className="space-y-6">
                {loading ? (
                    <>
                        <SkeletonTask />
                        <SkeletonTask />
                    </>
                ) : (
                    tasks.map((task, i) => {

                        /* BORDER COLOR FROM BACKEND URGENCY */
                        const borderColor =
                            task.urgency === "High"
                                ? "border-rose-400/50"
                                : task.urgency === "Medium"
                                    ? "border-amber-400/50"
                                    : "border-emerald-400/50";

                        /* URGENCY BADGE COLOR ONLY */
                        const urgencyBadge =
                            task.urgency === "High"
                                ? "bg-rose-500/25 text-rose-300"
                                : task.urgency === "Medium"
                                    ? "bg-amber-400/25 text-amber-300"
                                    : "bg-emerald-400/25 text-emerald-300";

                        return (
                            <div
                                key={task._id}
                                style={{ animation: `taskIn .45s ease ${i * 0.08}s both` }}
                                className={`group relative rounded-2xl
                                            bg-white/10 backdrop-blur-2xl
                                            border ${borderColor}
                                            shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                                            transition-all duration-300
                                            hover:-translate-y-1
                                            hover:shadow-[0_40px_120px_rgba(0,0,0,0.7)]`}
                            >
                                <div className="p-6 flex justify-between gap-6">

                                    <div className="min-w-0 space-y-2">
                                        <h3 className="text-white font-semibold text-lg">
                                            {task.taskTitle}
                                        </h3>

                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {task.taskDescription}
                                        </p>

                                        <div className="text-xs text-gray-400 flex flex-wrap gap-4">
                                            <span>
                                                {labelKey === "assignedBy"
                                                    ? `From ${task.assignedBy?.name}`
                                                    : `To ${task.assignedTo?.name}`}
                                            </span>

                                            {task.dueDate && (
                                                <span>
                                                    Due: {moment(task.dueDate).format("DD MMM YYYY")} ·{" "}
                                                    {moment(task.dueDate).fromNow()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            <div>Created: {moment(task.createdAt).format("DD MMM YYYY, HH:mm")}</div>
                                            <div>Updated: {moment(task.updatedAt).fromNow()}</div>
                                            <div>ID: {task._id.slice(-6)}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 items-start shrink-0">
                                        <span className="px-3 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300">
                                            {task.status}
                                        </span>

                                        <span className={`px-3 py-0.5 text-xs rounded-full ${urgencyBadge}`}>
                                            {task.urgency}
                                        </span>

                                        <button
                                            onClick={() => onEditTask(task, type)}
                                            className="px-2 py-1 rounded-md bg-white/10 text-white hover:bg-white/20"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            onClick={() => onViewTask(task, type)}
                                            className="px-2 py-1 rounded-md bg-white/10 text-white hover:bg-white/20"
                                        >
                                            👁
                                        </button>
                                    </div>
                                </div>


                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyTaskSection;

const SkeletonTask = () => (
    <div className="h-32 rounded-2xl bg-white/5 backdrop-blur border border-white/10 animate-pulse" />
);
