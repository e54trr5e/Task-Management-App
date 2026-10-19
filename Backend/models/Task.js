const mongoose =
    require("mongoose");


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
                default: "Medium",
            },


            // =====================
            // STATUS
            // =====================

            status: {
                type: String,
                default: "To Do",
            },


            // =====================
            // DUE DATE
            // =====================

            dueDate: {
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
            timestamps: true,
        }

    );


const Task =
    mongoose.model(
        "Task",
        taskSchema
    );


module.exports = Task;