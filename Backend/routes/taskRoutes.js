const express = require("express");

const Task = require("../models/Task");
const User = require("../models/User");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    sendEmail,
} = require("../services/emailService");

const router = express.Router();


// ======================================================
// PROTECT ALL TASK ROUTES
// ======================================================

router.use(authMiddleware);


// ======================================================
// GET ALL ACTIVE TASKS FOR LOGGED-IN USER
// ======================================================

router.get("/", async (req, res) => {

    try {

        const tasks =
            await Task.find({

                user:
                    req.userId,

                // Do not send soft-deleted tasks
                // back to the frontend.

                isDeleted:
                    { $ne: true },

            }).sort({
                createdAt: -1,
            });


        return res.json(tasks);

    } catch (error) {

        console.error(
            "GET TASK ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Could not get tasks",
        });

    }

});


// ======================================================
// CREATE SINGLE TASK
// ======================================================

router.post("/", async (req, res) => {

    try {

        const {
            title,
            description,
            priority,
            status,
            dueDate,
        } = req.body;


        // --------------------------------------------------
        // Validate title
        // --------------------------------------------------

        if (
            !title ||
            typeof title !== "string" ||
            !title.trim()
        ) {

            return res.status(400).json({
                message:
                    "Task title is required",
            });

        }


        // --------------------------------------------------
        // Validate priority
        // --------------------------------------------------

        const allowedPriorities = [
            "High",
            "Medium",
            "Low",
        ];


        const finalPriority =
            allowedPriorities.includes(
                priority
            )
                ? priority
                : "Medium";


        // --------------------------------------------------
        // Validate status
        // --------------------------------------------------

        const allowedStatuses = [
            "To Do",
            "In Progress",
            "Completed",
        ];


        const finalStatus =
            allowedStatuses.includes(
                status
            )
                ? status
                : "To Do";


        // --------------------------------------------------
        // Prepare due date
        // --------------------------------------------------

        let finalDueDate = null;


        if (dueDate) {

            finalDueDate =
                new Date(dueDate);


            if (
                Number.isNaN(
                    finalDueDate.getTime()
                )
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Invalid due date",
                    });

            }

        }


        const now =
            new Date();


        // --------------------------------------------------
        // Create task
        // --------------------------------------------------

        const newTask =
            new Task({

                user:
                    req.userId,

                title:
                    title.trim(),

                description:
                    typeof description ===
                    "string"
                        ? description.trim()
                        : "",

                priority:
                    finalPriority,

                status:
                    finalStatus,

                dueDate:
                    finalDueDate,


                // ==========================================
                // ML HISTORY
                // ==========================================

                originalDueDate:
                    finalDueDate,

                completedAt:
                    finalStatus ===
                    "Completed"
                        ? now
                        : null,

                deadlineChangeCount:
                    0,

                statusHistory: [
                    {
                        status:
                            finalStatus,

                        changedAt:
                            now,
                    },
                ],


                // ==========================================
                // SOFT DELETE
                // ==========================================

                isDeleted:
                    false,

                deletedAt:
                    null,


                reminderSent:
                    false,

            });


        const savedTask =
            await newTask.save();


        console.log(
            "Task created:",
            savedTask.title
        );


        // --------------------------------------------------
        // Send task-created email
        // --------------------------------------------------

        try {

            const user =
                await User.findById(
                    req.userId
                );


            if (
                user &&
                user.email &&
                user.preferences
                    ?.emailNotifications
            ) {

                await sendEmail(

                    user.email,

                    "Task Created - TaskFlow",

                    `
                    <div
                        style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            line-height: 1.6;
                        "
                    >

                        <h2>
                            TaskFlow
                        </h2>

                        <p>
                            Hi ${user.name || "there"},
                        </p>

                        <p>
                            Your task has been
                            created successfully.
                        </p>

                        <div
                            style="
                                margin-top: 20px;
                                padding: 16px;
                                border: 1px solid #dddddd;
                                border-radius: 8px;
                            "
                        >

                            <h3>
                                ${savedTask.title}
                            </h3>

                            ${
                                savedTask.description
                                    ? `
                                    <p>
                                        ${savedTask.description}
                                    </p>
                                    `
                                    : ""
                            }

                            <p>
                                <strong>
                                    Priority:
                                </strong>

                                ${savedTask.priority}
                            </p>

                            <p>
                                <strong>
                                    Status:
                                </strong>

                                ${savedTask.status}
                            </p>

                            <p>
                                <strong>
                                    Due Date:
                                </strong>

                                ${
                                    savedTask.dueDate
                                        ? new Date(
                                            savedTask.dueDate
                                        ).toLocaleDateString()
                                        : "No due date"
                                }
                            </p>

                        </div>

                        <p>
                            Keep making progress!
                        </p>

                        <p>
                            TaskFlow
                        </p>

                    </div>
                    `
                );


                console.log(
                    "Manual task email sent successfully"
                );

            }

        } catch (emailError) {

            // Email failure should not
            // stop task creation.

            console.error(
                "MANUAL TASK EMAIL ERROR:",
                emailError
            );

        }


        return res
            .status(201)
            .json(savedTask);


    } catch (error) {

        console.error(
            "CREATE TASK ERROR:",
            error
        );


        return res
            .status(500)
            .json({
                message:
                    error.message ||
                    "Could not create task",
            });

    }

});


// ======================================================
// CREATE MULTIPLE AI-GENERATED TASKS
// ======================================================

router.post(
    "/bulk",
    async (req, res) => {

        try {

            const {
                tasks,
            } = req.body;


            // --------------------------------------------------
            // Validate tasks
            // --------------------------------------------------

            if (
                !Array.isArray(tasks) ||
                tasks.length === 0
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Tasks are required",
                    });

            }


            if (
                tasks.length > 50
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Maximum 50 tasks can be added at once",
                    });

            }


            const allowedPriorities = [
                "High",
                "Medium",
                "Low",
            ];


            const now =
                new Date();


            // --------------------------------------------------
            // Prepare AI tasks
            // --------------------------------------------------

            const preparedTasks =
                tasks.map(
                    (
                        task,
                        index
                    ) => {

                        if (
                            !task ||
                            !task.title ||
                            typeof task.title !==
                                "string" ||
                            !task.title.trim()
                        ) {

                            throw new Error(
                                `Task ${
                                    index + 1
                                } requires a title`
                            );

                        }


                        const priority =
                            allowedPriorities.includes(
                                task.priority
                            )
                                ? task.priority
                                : "Medium";


                        let taskDueDate =
                            null;


                        if (task.dueDate) {

                            taskDueDate =
                                new Date(
                                    task.dueDate
                                );


                            if (
                                Number.isNaN(
                                    taskDueDate
                                        .getTime()
                                )
                            ) {

                                throw new Error(
                                    `Task ${
                                        index + 1
                                    } has an invalid due date`
                                );

                            }

                        }


                        return {

                            user:
                                req.userId,

                            title:
                                task.title.trim(),

                            description:
                                typeof task.description ===
                                "string"
                                    ? task.description.trim()
                                    : "",

                            priority,

                            status:
                                "To Do",

                            dueDate:
                                taskDueDate,


                            // ==================================
                            // ML HISTORY
                            // ==================================

                            originalDueDate:
                                taskDueDate,

                            completedAt:
                                null,

                            deadlineChangeCount:
                                0,

                            statusHistory: [
                                {
                                    status:
                                        "To Do",

                                    changedAt:
                                        now,
                                },
                            ],


                            // ==================================
                            // SOFT DELETE
                            // ==================================

                            isDeleted:
                                false,

                            deletedAt:
                                null,


                            reminderSent:
                                false,

                        };

                    }
                );


            // --------------------------------------------------
            // Save tasks
            // --------------------------------------------------

            const savedTasks =
                await Task.insertMany(
                    preparedTasks
                );


            console.log(
                `${savedTasks.length} AI tasks created`
            );


            // --------------------------------------------------
            // Send ONE summary email
            // --------------------------------------------------

            try {

                const user =
                    await User.findById(
                        req.userId
                    );


                if (
                    user &&
                    user.email &&
                    user.preferences
                        ?.emailNotifications
                ) {

                    const taskList =
                        savedTasks
                            .map(
                                (
                                    task,
                                    index
                                ) => {

                                    return `
                                    <div
                                        style="
                                            margin-bottom: 14px;
                                            padding: 16px;
                                            border: 1px solid #dddddd;
                                            border-radius: 8px;
                                        "
                                    >

                                        <h3
                                            style="
                                                margin-top: 0;
                                                margin-bottom: 10px;
                                            "
                                        >
                                            ${index + 1}.
                                            ${task.title}
                                        </h3>

                                        ${
                                            task.description
                                                ? `
                                                <p>
                                                    ${task.description}
                                                </p>
                                                `
                                                : ""
                                        }

                                        <p>
                                            <strong>
                                                Priority:
                                            </strong>

                                            ${task.priority}
                                        </p>

                                        <p>
                                            <strong>
                                                Status:
                                            </strong>

                                            ${task.status}
                                        </p>

                                        ${
                                            task.dueDate
                                                ? `
                                                <p>
                                                    <strong>
                                                        Due Date:
                                                    </strong>

                                                    ${new Date(
                                                        task.dueDate
                                                    ).toLocaleDateString()}
                                                </p>
                                                `
                                                : ""
                                        }

                                    </div>
                                    `;

                                }
                            )
                            .join("");


                    await sendEmail(

                        user.email,

                        `${savedTasks.length} AI Tasks Created - TaskFlow`,

                        `
                        <div
                            style="
                                font-family: Arial, sans-serif;
                                max-width: 650px;
                                margin: auto;
                                line-height: 1.6;
                            "
                        >

                            <h2>
                                TaskFlow AI Planner
                            </h2>

                            <p>
                                Hi ${user.name || "there"},
                            </p>

                            <p>
                                Your AI plan has been
                                successfully converted
                                into

                                <strong>
                                    ${savedTasks.length}
                                    tasks.
                                </strong>
                            </p>

                            <p>
                                Here is your generated
                                task list:
                            </p>

                            ${taskList}

                            <p
                                style="
                                    margin-top: 24px;
                                "
                            >
                                All of these tasks have
                                been added to your
                                TaskFlow account.
                            </p>

                            <p>
                                Keep making progress!
                            </p>

                            <p>
                                TaskFlow
                            </p>

                        </div>
                        `
                    );


                    console.log(
                        "AI task summary email sent successfully"
                    );

                }

            } catch (emailError) {

                console.error(
                    "AI TASK EMAIL ERROR:",
                    emailError
                );

            }


            return res
                .status(201)
                .json({

                    message:
                        `${savedTasks.length} tasks created successfully`,

                    tasks:
                        savedTasks,

                });


        } catch (error) {

            console.error(
                "BULK TASK ERROR:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        error.message ||
                        "Could not create tasks",
                });

        }

    }
);


// ======================================================
// UPDATE ACTIVE TASK
// ======================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const {
                title,
                description,
                priority,
                status,
                dueDate,
            } = req.body;


            // ==================================================
            // GET EXISTING ACTIVE TASK
            // ==================================================

            const existingTask =
                await Task.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.userId,

                    isDeleted:
                        { $ne: true },

                });


            if (!existingTask) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Task not found",
                    });

            }


            // --------------------------------------------------
            // TITLE
            // --------------------------------------------------

            if (
                title !== undefined
            ) {

                if (
                    typeof title !==
                        "string" ||
                    !title.trim()
                ) {

                    return res
                        .status(400)
                        .json({
                            message:
                                "Task title cannot be empty",
                        });

                }


                existingTask.title =
                    title.trim();

            }


            // --------------------------------------------------
            // DESCRIPTION
            // --------------------------------------------------

            if (
                description !==
                undefined
            ) {

                existingTask.description =
                    typeof description ===
                    "string"
                        ? description.trim()
                        : "";

            }


            // --------------------------------------------------
            // PRIORITY
            // --------------------------------------------------

            if (
                priority !==
                undefined
            ) {

                const allowedPriorities = [
                    "High",
                    "Medium",
                    "Low",
                ];


                if (
                    !allowedPriorities.includes(
                        priority
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            message:
                                "Invalid priority",
                        });

                }


                existingTask.priority =
                    priority;

            }


            // ==================================================
            // STATUS + STATUS HISTORY
            // ==================================================

            if (
                status !==
                undefined
            ) {

                const allowedStatuses = [
                    "To Do",
                    "In Progress",
                    "Completed",
                ];


                if (
                    !allowedStatuses.includes(
                        status
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            message:
                                "Invalid status",
                        });

                }


                const oldStatus =
                    existingTask.status;


                // Only record if status actually changed.

                if (
                    status !==
                    oldStatus
                ) {

                    existingTask.status =
                        status;


                    existingTask
                        .statusHistory
                        .push({

                            status,

                            changedAt:
                                new Date(),

                        });


                    // ------------------------------------------
                    // Mark completed
                    // ------------------------------------------

                    if (
                        status ===
                        "Completed"
                    ) {

                        existingTask
                            .completedAt =
                            new Date();

                    }


                    // ------------------------------------------
                    // Reopen task
                    // ------------------------------------------

                    if (
                        oldStatus ===
                            "Completed" &&
                        status !==
                            "Completed"
                    ) {

                        existingTask
                            .completedAt =
                            null;

                    }

                }

            }


            // ==================================================
            // DUE DATE HISTORY
            // ==================================================

            if (
                dueDate !==
                undefined
            ) {

                const newDueDate =
                    dueDate
                        ? new Date(
                            dueDate
                        )
                        : null;


                if (
                    newDueDate &&
                    Number.isNaN(
                        newDueDate.getTime()
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            message:
                                "Invalid due date",
                        });

                }


                const oldDueDate =
                    existingTask.dueDate;


                const oldTime =
                    oldDueDate
                        ? new Date(
                            oldDueDate
                        ).getTime()
                        : null;


                const newTime =
                    newDueDate
                        ? newDueDate
                            .getTime()
                        : null;


                // Only process when deadline
                // actually changes.

                if (
                    oldTime !==
                    newTime
                ) {

                    // ------------------------------------------
                    // OLD TASK MIGRATION
                    // ------------------------------------------
                    //
                    // Older tasks may not have
                    // originalDueDate.
                    //
                    // ------------------------------------------

                    if (
                        !existingTask
                            .originalDueDate &&
                        oldDueDate
                    ) {

                        existingTask
                            .originalDueDate =
                            oldDueDate;

                    }


                    // ------------------------------------------
                    // FIRST DEADLINE
                    // ------------------------------------------

                    if (
                        !existingTask
                            .originalDueDate &&
                        !oldDueDate &&
                        newDueDate
                    ) {

                        existingTask
                            .originalDueDate =
                            newDueDate;

                    } else {

                        // --------------------------------------
                        // GENUINE DEADLINE CHANGE
                        // --------------------------------------

                        existingTask
                            .deadlineChangeCount =
                            (
                                existingTask
                                    .deadlineChangeCount ||
                                0
                            ) + 1;

                    }


                    existingTask.dueDate =
                        newDueDate;


                    // New deadline means reminder
                    // may need to be sent again.

                    existingTask.reminderSent =
                        false;

                }

            }


            // ==================================================
            // SAVE
            // ==================================================

            const updatedTask =
                await existingTask.save();


            console.log(
                "Task updated:",
                updatedTask.title
            );


            return res.json(
                updatedTask
            );


        } catch (error) {

            console.error(
                "UPDATE TASK ERROR:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        error.message ||
                        "Could not update task",
                });

        }

    }
);


// ======================================================
// SOFT DELETE TASK
// ======================================================
//
// IMPORTANT:
//
// We DO NOT use:
//
// Task.findOneAndDelete()
//
// because that would permanently destroy the historical
// information needed for ML.
//
// Instead:
//
// isDeleted = true
// deletedAt = current time
//
// ======================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const task =
                await Task.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.userId,

                    isDeleted:
                        { $ne: true },

                });


            if (!task) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Task not found",
                    });

            }


            // ==========================================
            // SOFT DELETE
            // ==========================================

            task.isDeleted =
                true;

            task.deletedAt =
                new Date();


            await task.save();


            console.log(
                "Task soft deleted:",
                task.title
            );


            return res.json({
                message:
                    "Task deleted successfully",
            });


        } catch (error) {

            console.error(
                "DELETE TASK ERROR:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        error.message ||
                        "Could not delete task",
                });

        }

    }
);


module.exports = router;