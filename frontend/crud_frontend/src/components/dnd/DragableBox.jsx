import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DragableBox = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        willChange: "transform",
        touchAction: "none",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                relative w-72 select-none rounded-2xl
                border border-white/10
                transition-shadow duration-200
                ${isDragging
                    ? "bg-[#0b1220] shadow-[0_0_25px_rgba(99,102,241,0.35)]"
                    : "bg-white/5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.35)]"
                }
            `}
        >
            <div className="relative z-10 p-4">
                {children}
            </div>
        </div>
    );
};

export default DragableBox;
