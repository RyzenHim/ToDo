import React, { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const UserActionMenu = ({ userId, userName, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* THREE DOT ICON */}
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setOpen((p) => !p)}
                className="
          p-1 rounded-md
          hover:bg-white/10
          transition
        "
            >
                <BsThreeDotsVertical className="text-indigo-300/80" size={16} />
            </button>

            {/* MENU */}
            {open && (
                <div
                    className="
            absolute right-0 mt-2 w-36
            rounded-xl
            bg-slate-900/90 backdrop-blur-xl
            border border-white/10
            shadow-[0_20px_50px_rgba(0,0,0,0.6)]
            z-50
            overflow-hidden
          "
                >
                    <MenuItem onClick={() => { onView(userId); setOpen(false); }}>
                        View
                    </MenuItem>
                    <MenuItem onClick={() => { onEdit(userId); setOpen(false); }}>
                        Edit
                    </MenuItem>
                    <MenuItem danger onClick={() => { onDelete(userId, userName); setOpen(false); }}>
                        Delete
                    </MenuItem>
                </div>
            )}
        </div>
    );
};

const MenuItem = ({ children, onClick, danger }) => (
    <div
        onClick={onClick}
        className={`
      px-3 py-2 text-sm cursor-pointer
      ${danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-200 hover:bg-white/10"}
      transition
    `}
    >
        {children}
    </div>
);

export default UserActionMenu;
