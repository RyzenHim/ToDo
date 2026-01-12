const User = require('../model/userModel')
const AssignTask = require('../model/assignTaskModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY
const transporter = require('../utils/mailer')
const uploadImage = require('../utils/cloudinary')

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!(name && email && password)) {
            return res.status(400).json({ message: "All the feild are required" })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already exist" })
        }
        const salt = await bcrypt.genSaltSync(10)
        const hash = await bcrypt.hashSync(password, salt)
        const newData = new User({ name, email, password: hash })
        await newData.save()
        return res.status(200).json({ message: "User Saved " })
    } catch (err) {
        return res.status(500).json({ err: 'Internal Server Error' })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(400).json({ message: "User not Found" })
        }
        const match = await bcrypt.compare(password, existingUser.password)
        if (match) {
            const token = jwt.sign({
                _id: existingUser._id,
                email: existingUser.email
            }, secretKey, { expiresIn: '1h' })

            return res.status(200).json({ message: "Welcome", token })
        } else {
            return res.status(400).json({ message: "Password is wrong" })
        }

    } catch (err) {
        console.error("Login Error:", err)
        return res.status(500).json({ messphage: "Internal server error " })
    }
}

exports.all = async (req, res) => {
    try {
        const userId = req.user.id;
        const existingUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        return res.status(200).json({ message: "This is the all data", existingUsers })
    } catch (err) {
        console.log(err);
    }
}

exports.profile = async (req, res) => {
    try {
        const loginUser = req.user
        const countTaskAssignedToMe = await AssignTask.countDocuments({ assignedTo: loginUser._id })
        const countTaskAssignedByMe = await AssignTask.countDocuments({ assignedBy: loginUser._id })
        const countPendingTask = await AssignTask.countDocuments({ assignedTo: loginUser._id, status: "Pending" })
        const countCompletedTask = await AssignTask.countDocuments({ assignedTo: loginUser._id, status: "Completed" })
        // const createdAt = await User.find({ _id: loginUser._id })
        return res.status(200).json({
            userDetail: loginUser, countTaskAssignedToMe, countTaskAssignedByMe, countPendingTask, countCompletedTask
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to load profile" });
    }
};

exports.assigntask = async (req, res) => {
    try {
        const {
            taskTitle,
            assignedTo,
            urgency,
            dueDate,
            color,
            taskDescription
        } = req.body;

        if (!taskTitle || !assignedTo || !urgency || !dueDate) {
            return res.status(400).json({ message: "Every field is required" });
        }

        const assignedBy = req.user.id;

        let uploadedFiles = [];
        console.log("req files", req.files);
        if (req.files) {
            uploadedFiles = await uploadImage(req.files);
        }

        const addTask = await AssignTask.create({
            taskTitle,
            assignedTo,
            assignedBy,
            urgency,
            dueDate,
            color,
            taskDescription,
            attachments: uploadedFiles.map(f => ({
                url: f.secure_url,
                public_id: f.public_id
            }))
        });

        const assignedToUser = await User.findById(assignedTo);
        const assignedByUser = await User.findById(assignedBy);

        if (assignedToUser && assignedByUser) {
            transporter.sendMail({
                from: `"Task Manager" <${process.env.EMAILID}>`,
                to: assignedToUser.email,
                subject: "📌 New Task Assigned",
                html: `
          <h3>New Task Assigned</h3>
          <p>Hello <b>${assignedToUser.name}</b>,</p>
          <p>You have been assigned a task by <b>${assignedByUser.name}</b>.</p>
          <p><b>Title:</b> ${addTask.taskTitle}</p>
          <p><b>Urgency:</b> ${addTask.urgency}</p>
          <p><b>Due Date:</b> ${new Date(addTask.dueDate).toDateString()}</p>
        `,
            }).catch(err => console.error("Mail Error:", err));
        }

        return res.status(201).json({
            message: "Task created successfully",
            task: addTask
        });

    } catch (err) {
        console.error("Assign Task Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.update = async (req, res) => {
    try {
        const { name, password, confirmPassword } = req.body;


        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Name is not valid" });
        }

        const updateData = {
            name: name.trim()
        };


        if (password || confirmPassword) {

            if (!password || !confirmPassword) {
                return res.status(400).json({
                    message: "Both password fields are required"
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Passwords do not match"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        console.log("req.user.id", req.user);
        const userId = req.user.id;

        await User.findByIdAndUpdate(
            userId,
            updateData,
        );

        return res.status(200).json({ message: "User updated successfully" });

    } catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.mytasks = async (req, res) => {
    try {
        // 1️ Logged-in user id 
        const userId = req.user._id;
        //find user lists except the one who is logged in only name and id will be coming 
        const userList = await User.find({ _id: { $ne: userId } }).select("name");
        //count how many tasks have been assigned to me 
        const countTaskAssignedToMe = await AssignTask.countDocuments({ assignedTo: userId })
        const countTaskAssignedByMe = await AssignTask.countDocuments({ assignedBy: userId })

        //now send the lists of the person lists in the database 
        const taskByPersonsToMe = await AssignTask.aggregate([
            { $match: { assignedTo: userId } },
            {
                $group: {
                    _id: "$assignedBy",
                    taskCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "authusers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    taskCount: 1
                }
            }
        ]);
        const taskByPersonsByMe = await AssignTask.aggregate([
            { $match: { assignedBy: userId } },
            {
                $group: {
                    _id: "$assignedTo",
                    taskCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "authusers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    taskCount: 1
                }
            }
        ]);

        const assignedToMe = await AssignTask
            .find({ assignedTo: userId })
            .populate([{ path: "assignedBy", select: "-password" }, { path: "assignedTo", select: "-password" }]); // who gave task

        const assignedByMe = await AssignTask
            .find({ assignedBy: userId })
            .populate([{ path: "assignedBy", select: "-password" }, { path: "assignedTo", select: "-password" }]); // who received task
        // .populate("assignedTo", "name email"); // who received task


        const urgency = await AssignTask.find()
        console.log("urgency", urgency);



        return res.status(200).json({

            userList,
            countTaskAssignedToMe,
            countTaskAssignedByMe,
            taskByPersonsToMe,
            taskByPersonsByMe,
            assignedToMe,
            assignedByMe,
            userId
        });

    } catch (err) {
        console.error("MYTASKS ERROR:", err);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const taskId = req.params.id;
        const updatedData = req.body;

        const task = await AssignTask.findById(taskId)
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name email");

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isAssignedByMe =
            task.assignedBy._id.toString() === loggedInUserId.toString();

        const isAssignedToMe =
            task.assignedTo._id.toString() === loggedInUserId.toString();

        if (!isAssignedByMe && !isAssignedToMe) {
            return res.status(403).json({
                message: "You are not authorized to update this task",
            });
        }

        let updateMessage = "";

        if (isAssignedToMe && !isAssignedByMe) {
            if (
                updatedData.status === "Completed" &&
                task.status === "Pending"
            ) {
                task.status = "Completed";
                await task.save();

                updateMessage = `Task "${task.taskTitle}" marked as Completed`;

                transporter.sendMail({
                    from: `"Task Manager" <${process.env.EMAILID}>`,
                    to: task.assignedBy.email,
                    subject: "Task Completed ",
                    html: `
                        <h3>Task Completed</h3>
                        <p><b>${task.assignedTo.name}</b> has completed the task:</p>
                        <p><b>${task.taskTitle}</b></p>
                    `,
                }).catch(err => console.error("Mail Error:", err));

                return res.status(200).json({
                    message: updateMessage,
                    task,
                });
            }

            return res.status(403).json({
                message: "Only Pending → Completed is allowed",
            });
        }

        if (isAssignedByMe) {
            const allowedFields = [
                "taskTitle",
                "taskDescription",
                "urgency",
                "status",
                "dueDate",
                "color",
            ];

            allowedFields.forEach((field) => {
                if (updatedData[field] !== undefined) {
                    task[field] = updatedData[field];
                }
            });

            await task.save();

            updateMessage = `Task "${task.taskTitle}" has been updated`;

            transporter.sendMail({
                from: `"Task Manager" <${process.env.EMAILID}>`,
                to: task.assignedTo.email,
                subject: "Task Updated ",
                html: `
                    <h3>Task Updated</h3>
                    <p>Your task has been updated by <b>${task.assignedBy.name}</b></p>
                    <p><b>${task.taskTitle}</b></p>
                    <p>Status: ${task.status}</p>
                `,
            }).catch(err => console.error("Mail Error:", err));

            return res.status(200).json({
                message: updateMessage,
                task,
            });
        }

    } catch (err) {
        console.error("Update Task Error:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const taskId = req.params.id;

        const task = await AssignTask.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const isAssignedByMe =
            task.assignedBy.toString() === loggedInUserId.toString();

        if (!isAssignedByMe) {
            return res.status(403).json({
                message: "Only task creator can delete this task"
            });
        }

        await AssignTask.findByIdAndDelete(taskId);

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (err) {
        console.error("Delete Task Error:", err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.practice = async (req, res) => {
    try {
        const formData = (req.formData)
        console.log("formData", req);
        const currentLoogedInUserID = req.user._id
        console.log(req.user._id);
        const { name } = await User.findById(currentLoogedInUserID)
        //all taks details including the task including my taks 
        const tasks = await AssignTask.find()
        //what is the number of tasks available in the tasks db 
        const totalTasksCount = await AssignTask.countDocuments()

        // total number of  task assigned to the loggedin user
        const totalTaskAssignedToMe = await AssignTask.countDocuments({ assignedTo: currentLoogedInUserID })
        // total number of tasks assigned by the logged in user

        const totalTaskAssignedByMe = await AssignTask.countDocuments({ assignedBy: currentLoogedInUserID })
        const detailsOfTask = await AssignTask.find({ assignedBy: currentLoogedInUserID }).populate([{ path: "assignedBy", select: "-password" }, { path: "assignedTo", select: "-password" }])
        //show all other users other than me 
        const otherUserNameThanMe = await User.find({ id: { $ne: currentLoogedInUserID } })

        return res.status(200).json({ name, tasks, totalTasksCount, totalTaskAssignedToMe, totalTaskAssignedByMe, otherUserNameThanMe, detailsOfTask })



    } catch (err) {
        console.error("practice ERROR:", err);
        return res.status(500).json({ message: "Internal server Error" });
    }



}





