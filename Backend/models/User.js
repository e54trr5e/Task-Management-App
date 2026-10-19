const mongoose =
    require("mongoose");


const userSchema =
    new mongoose.Schema(
        {

            // =====================
            // NAME
            // =====================

            name: {
                type: String,
                required: true,
            },


            // =====================
            // EMAIL
            // =====================

            email: {
                type: String,
                required: true,
                unique: true,
            },


            // =====================
            // PASSWORD
            // =====================

            password: {
                type: String,
                required: true,
            },


            // =====================
            // ROLE
            // =====================

            role: {
                type: String,
                default: "Student",
            },


            // =====================
            // LOCATION
            // =====================

            location: {
                type: String,
                default: "",
            },


            // =====================
            // PREFERENCES
            // =====================

            preferences: {

                emailNotifications: {
                    type: Boolean,
                    default: true,
                },

                taskReminders: {
                    type: Boolean,
                    default: true,
                },

                weeklyReport: {
                    type: Boolean,
                    default: false,
                },

            },

        },

        {
            timestamps: true,
        }

    );


const User =
    mongoose.model(
        "User",
        userSchema
    );


module.exports = User;