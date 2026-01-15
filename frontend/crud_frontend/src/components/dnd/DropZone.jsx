import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DropZone = ({ id, title, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        // id: `user-${id}`, 
        id: id,     // 🔥 make droppable id unique
        data: {
            type: "user",
            userId: id,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                board-card
                relative w-72 min-h-[200px]
                flex flex-col gap-3
                rounded-2xl
                transition-all duration-300 ease-out

                bg-white/5 backdrop-blur-xl
                border border-white/10
                shadow-[0_18px_60px_rgba(0,0,0,0.45)]

                ${isOver
                    ? `
                        scale-[1.03]
                        ring-2 ring-indigo-400/50
                        bg-indigo-500/10
                        shadow-[0_0_40px_rgba(99,102,241,0.45)]
                      `
                    : `
                        hover:shadow-[0_22px_70px_rgba(0,0,0,0.55)]
                        hover:bg-white/10
                      `
                }
            `}
        >
            {/* subtle glow border */}
            <div
                className={`
                    pointer-events-none absolute inset-0 rounded-2xl
                    transition-opacity duration-300
                    ${isOver
                        ? "opacity-100"
                        : "opacity-0"
                    }
                    bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.25),transparent_60%)]
                `}
            />

            {/* content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default DropZone;
