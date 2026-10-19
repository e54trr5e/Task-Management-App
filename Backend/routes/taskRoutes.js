const express =
    require("express");

const Task =
    require("../models/Task");

const authMiddleware =
    require("../middleware/authMiddleware");


const router =
    express.Router();

const User =
    require("../models/User");

const {
    sendEmail,
} = require("../services/emailService");

// =============================
// PROTECT ALL TASK ROUTES
// =============================

router.use(
    authMiddleware
);


// =============================
// GET ALL USER TASKS
// =============================

router.get(
    "/",
    async (req, res) => {

        try {

            const tasks =
                await Task.find({

                    user:
                        req.userId,

                });


            res.json(tasks);


        } catch (error) {

            console.log(
                "GET TASK ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Could not get tasks",

                });

        }

    }
);


// =============================
// CREATE TASK
// =============================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                title,
                description,
                priority,
                status,
                dueDate,
            } = req.body;


            // Check title

            if (!title) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Task title is required",

                    });

            }


            // Create task

            const newTask =
                new Task({

                    user:
                        req.userId,

                    title:
                        title,

                    description:
                        description,

                    priority:
                        priority,

                    status:
                        status,

                    dueDate:
                        dueDate,

                });


            // Save task

            const savedTask =
                await newTask.save();


            // =============================
            // EMAIL NOTIFICATION
            // =============================

            const user =
                await User.findById(
                    req.userId
                );


            if (
                user &&
                user.preferences
                    ?.emailNotifications
            ) {

                await sendEmail(

                    user.email,

                    "Task Created - TaskFlow",

                    `
                        <h2>TaskFlow</h2>

                        <p>
                            Hi ${user.name},
                        </p>

                        <p>
                            Your task has been created successfully.
                        </p>

                        <h3>
                            ${savedTask.title}
                        </h3>

                        <p>
                            <strong>Priority:</strong>
                            ${savedTask.priority}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${savedTask.status}
                        </p>

                        <p>
                            <strong>Due Date:</strong>
                            ${savedTask.dueDate || "No due date"}
                        </p>

                        <p>
                            Keep making progress!
                        </p>

                        <p>
                            TaskFlow
                        </p>
                    `

                );

            }


            // Send task to frontend

            res
                .status(201)
                .json(
                    savedTask
                );


        } catch (error) {

            console.log(
                "SAVE TASK ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        error.message,

                });

        }

    }
);


// =============================
// UPDATE TASK
// =============================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const updateData = {
                ...req.body,

                reminderSent:
                    false,
            };


            const updatedTask =
                await Task.findOneAndUpdate(
                    {
                        _id:
                            req.params.id,

                        user:
                            req.userId,
                    },

                    updateData,

                    {
                        returnDocument:
                            "after",

                        runValidators:
                            true,
                    }
                );


            if (!updatedTask) {

                return res
                    .status(404)
                    .json({

                        message:
                            "Task not found",

                    });

            }


            res.json(
                updatedTask
            );


        } catch (error) {

            console.log(
                "UPDATE TASK ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        error.message,

                });

        }

    }
);


// =============================
// DELETE TASK
// =============================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const deletedTask =
                await Task
                    .findOneAndDelete({

                        _id:
                            req.params.id,

                        user:
                            req.userId,

                    });


            if (!deletedTask) {

                return res
                    .status(404)
                    .json({

                        message:
                            "Task not found",

                    });

            }


            res.json({

                message:
                    "Task deleted successfully",

            });


        } catch (error) {

            console.log(
                "DELETE TASK ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        error.message,

                });

        }

    }
);


module.exports = router;