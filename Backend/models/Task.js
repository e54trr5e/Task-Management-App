const mongoose =
    require("mongoose");


// ======================================================
// STATUS HISTORY SUB-SCHEMA
// ======================================================

const statusHistorySchema =
    new mongoose.Schema(
        {
            status: {

                type: String,

                enum: [
                    "To Do",
                    "In Progress",
                    "Completed",
                ],

                required: true,
            },

            changedAt: {

                type: Date,

                default: Date.now,
            },
        },
        {
            _id: false,
        }
    );



// ======================================================
// TASK SCHEMA
// ======================================================

const taskSchema =
    new mongoose.Schema(
        {

            // =====================
            // USER
            // =====================

            user: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                required: true,
            },


            // =====================
            // TITLE
            // =====================

            title: {

                type: String,

                required: true,
            },


            // =====================
            // DESCRIPTION
            // =====================

            description: {

                type: String,

                default: "",
            },


            // =====================
            // PRIORITY
            // =====================

            priority: {

                type: String,

                enum: [
                    "High",
                    "Medium",
                    "Low",
                ],

                default: "Medium",
            },


            // =====================
            // STATUS
            // =====================

            status: {

                type: String,

                enum: [
                    "To Do",
                    "In Progress",
                    "Completed",
                ],

                default: "To Do",
            },


            // =====================
            // CURRENT DUE DATE
            // =====================

            dueDate: {

                type: Date,

                default: null,
            },


            // ==================================================
            // ORIGINAL DUE DATE
            // ==================================================
            //
            // Stores the first deadline assigned to the task.
            // This should not change when the user later
            // changes the current deadline.
            //
            // ==================================================

            originalDueDate: {

                type: Date,

                default: null,
            },


            // ==================================================
            // COMPLETED AT
            // ==================================================
            //
            // Stores when the task was completed.
            //
            // ==================================================

            completedAt: {

                type: Date,

                default: null,
            },


            // ==================================================
            // DEADLINE CHANGE COUNT
            // ==================================================
            //
            // Number of times the deadline was changed.
            //
            // ==================================================

            deadlineChangeCount: {

                type: Number,

                default: 0,

                min: 0,
            },


            // ==================================================
            // STATUS HISTORY
            // ==================================================
            //
            // Example:
            //
            // To Do
            //    ↓
            // In Progress
            //    ↓
            // Completed
            //
            // Each change also stores its timestamp.
            //
            // ==================================================

            statusHistory: {

                type: [
                    statusHistorySchema,
                ],

                default: [],
            },


            // ==================================================
            // SOFT DELETE
            // ==================================================
            //
            // false:
            // Task is visible normally.
            //
            // true:
            // Task is hidden from the application but remains
            // stored in MongoDB for historical/ML purposes.
            //
            // ==================================================

            isDeleted: {

                type: Boolean,

                default: false,
            },


            // ==================================================
            // DELETED AT
            // ==================================================
            //
            // Stores when the user deleted the task.
            //
            // The document itself remains in MongoDB.
            //
            // ==================================================

            deletedAt: {

                type: Date,

                default: null,
            },


            // =====================
            // REMINDER SENT
            // =====================

            reminderSent: {

                type: Boolean,

                default: false,
            },

        },

        {

            // Automatically creates:
            //
            // createdAt
            // updatedAt

            timestamps: true,

        }
    );



// ======================================================
// CREATE TASK MODEL
// ======================================================

const Task =
    mongoose.model(
        "Task",
        taskSchema
    );



// ======================================================
// EXPORT MODEL
// ======================================================

module.exports =
    Task;