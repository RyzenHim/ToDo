import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DragableBox = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type: "user",     // 🔥 REQUIRED for card swapping
            userId: id,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        willChange: "transform",
        touchAction: "none",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                relative w-72 rounded-2xl
                border border-white/10
                transition-all duration-300
                ${isDragging
                    ? "bg-[#0b1220] scale-[1.03] shadow-[0_0_30px_rgba(99,102,241,0.45)]"
                    : "bg-white/5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.5)]"
                }
            `}
        >
            {/* DRAG HANDLE */}
            <div
                {...attributes}
                {...listeners}
                className="
                    cursor-grab active:cursor-grabbing
                    px-3 py-2 text-xs
                    tracking-widest uppercase
                    text-indigo-300/70
                    border-b border-white/10
                    select-none
                    hover:bg-white/5
                    transition
                "
            >
                Drag
            </div>

            {/* CONTENT */}
            <div className="relative z-10 p-4">
                {children}
            </div>
        </div>
    );
};

export default DragableBox;
