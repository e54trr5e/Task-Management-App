const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();


// =================================
// ROUTES
// =================================

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");


// =================================
// JOBS
// =================================

const startReminderJob =
    require("./jobs/reminderJob");

const startWeeklyReportJob =
    require("./jobs/weeklyReportJob");


// =================================
// CREATE EXPRESS APP
// =================================

const app = express();


// =================================
// MIDDLEWARE
// =================================

app.use(cors());

app.use(express.json());


// =================================
// API ROUTES
// =================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/tasks",
    taskRoutes
);


// =================================
// HOME ROUTE
// =================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "TaskFlow Backend Running"
        );

    }
);


// =================================
// PORT
// =================================

const PORT =
    process.env.PORT || 5000;


// =================================
// CONNECT TO MONGODB
// =================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB Connected"
        );


        // =========================
        // START TASK REMINDER JOB
        // =========================

        startReminderJob();


        // =========================
        // START WEEKLY REPORT JOB
        // =========================

        startWeeklyReportJob();


        // =========================
        // START SERVER
        // =========================

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.log(
            "MongoDB connection error:"
        );

        console.log(error);

    });