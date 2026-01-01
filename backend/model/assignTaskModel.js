// model/assignTaskModel.js
const mongoose = require("mongoose");

const assignTaskSchema = new mongoose.Schema(
    {
        taskTitle: { type: String, required: true, trim: true },
        taskDescription: { type: String, trim: true },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "authuser",
            required: true
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "authuser",
            required: true
        },

        urgency: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        dueDate: { type: Date, required: true },

        color: { type: String, default: "#6366f1" },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AssignTask", assignTaskSchema);
