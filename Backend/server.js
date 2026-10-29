const dns = require("dns");

// =========================
// DNS CONFIGURATION
// =========================

dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();


// =========================
// ROUTES
// =========================

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");


// =========================
// JOBS
// =========================

const startReminderJob = require("./jobs/reminderJob");
const startWeeklyReportJob = require("./jobs/weeklyReportJob");


// =========================
// CREATE APP
// =========================

const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());


// =========================
// MONGODB CONNECTION
// =========================

let connectionPromise = null;

async function connectDB() {

    // Already connected
    if (mongoose.connection.readyState === 1) {

        return;

    }


    // Connection is already being created
    if (connectionPromise) {

        return connectionPromise;

    }


    if (!process.env.MONGO_URI) {

        throw new Error(
            "MONGO_URI environment variable is missing"
        );

    }


    connectionPromise = mongoose.connect(
        process.env.MONGO_URI,
        {
            serverSelectionTimeoutMS: 10000,
        }
    );


    try {

        await connectionPromise;

        console.log(
            "MongoDB Connected"
        );

    } catch (error) {

        connectionPromise = null;

        console.error(
            "MongoDB connection error:",
            error
        );

        throw error;

    }

}


// =========================
// DATABASE MIDDLEWARE
// =========================
//
// API requests wait until MongoDB
// is connected before continuing.
// =========================

app.use("/api", async (req, res, next) => {

    try {

        await connectDB();

        next();

    } catch (error) {

        console.error(
            "Database unavailable:",
            error.message
        );


        return res.status(503).json({

            message:
                "Database connection unavailable",

        });

    }

});


// =========================
// API ROUTES
// =========================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/tasks",
    taskRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);


// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {

    res.send(
        "TaskFlow Backend Running"
    );

});


// =========================
// PORT
// =========================

const PORT =
    process.env.PORT || 5000;


// =========================
// LOCAL DEVELOPMENT
// =========================

if (process.env.VERCEL !== "1") {

    connectDB()
        .then(() => {

            startReminderJob();

            startWeeklyReportJob();


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

            console.error(
                "Failed to start server:",
                error.message
            );

            process.exit(1);

        });

}


// =========================
// EXPORT FOR VERCEL
// =========================

module.exports = app;