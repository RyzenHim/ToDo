import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DropZone = ({ id, title, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`
                group relative w-72 min-h-[200px]
                rounded-2xl p-4
                backdrop-blur-xl
                bg-white/5 border border-white/10
                transition-all duration-300 ease-out
                ${isOver
                    ? "scale-[1.03] ring-2 ring-indigo-400/60 shadow-[0_0_40px_rgba(99,102,241,0.35)]"
                    : "hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                }
            `}
        >
            {/* HEADER */}
            <div className="mb-3 text-xs font-semibold tracking-widest uppercase text-indigo-300/70">
                {title}
            </div>

            {/* CONTENT */}
            {children}

            {/* SOFT EDGE GLOW */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5 opacity-0 group-hover:opacity-100 transition" />
        </div>
    );
};

export default DropZone;
