const nodeMailer = require('nodemailer')
const User = require('../model/userModel')
const AssignTask = require('../model/assignTaskModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY
const emailId = process.env.EMAILID
const passkey = process.env.PASSKEY

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
        return res.status(500).json({ message: "Internal server error " })
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
        const assignedBy = req.user.id

        const addTask = await AssignTask.create({
            taskTitle,
            assignedTo,
            assignedBy,
            urgency,
            dueDate,
            color,
            taskDescription
        });

        // const transporter = nodeMailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: emailId,
        //         pass: passkey
        //     }
        // });
        // const userSendingMail = req.user.name
        // const mailIdOfReceipient = await User.findById(assignedTo)
        // const info = await transporter.sendMail({
        //     from: `${userSendingMail} <himanshukumar.a2@gmail.com>`,
        //     to: `${mailIdOfReceipient}`,
        //     subject: "Task Assigned to u",
        //     text: "You have been assigned a task!!",
        //     html: "<h1>Hey u have been assigned a task</h1> "
        // })

        return res.status(201).json({
            // message: "Task assigned successfully",
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
        // const personsAssignedToMe = await
        // 2️ Tasks ASSIGNED TO ME
        const assignedToMe = await AssignTask
            .find({ assignedTo: userId })
            .populate([{ path: "assignedBy", select: "-password" }, { path: "assignedTo", select: "-password" }]); // who gave task

        // 3️ Tasks ASSIGNED BY ME
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

        const task = await AssignTask.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isAssignedByMe =
            task.assignedBy.toString() === loggedInUserId.toString();

        const isAssignedToMe =
            task.assignedTo.toString() === loggedInUserId.toString();

        if (!isAssignedByMe && !isAssignedToMe) {
            return res.status(403).json({
                message: "You are not authorized to update this task",
            });
        }

        /* ===============================
           CASE 1: ASSIGNED TO ME
           Only status update allowed
           Pending → Completed
        ================================ */
        if (isAssignedToMe && !isAssignedByMe) {
            if (
                updatedData.status &&
                task.status === "Pending" &&
                updatedData.status === "Completed"
            ) {
                task.status = "Completed";
                await task.save();

                return res.status(200).json({
                    message: "Task marked as completed",
                    task,
                });
            }

            return res.status(403).json({
                message:
                    "Only Pending → Completed status update is allowed",
            });
        }

        /* ===============================
           CASE 2: ASSIGNED BY ME
           Full edit access
        ================================ */
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

            return res.status(200).json({
                message: "Task updated successfully",
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
        const currentLoogedInUserID = req.user._id
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