const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
]);

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

app.get("/", (req, res) => {

    res.send(
        "TaskFlow Backend Running"
    );

});


// =================================
// PORT
// =================================

const PORT =
    process.env.PORT || 5000;


// =================================
// CONNECT TO MONGODB
// =================================

async function connectDB() {

    try {

        if (
            mongoose.connection.readyState === 1
        ) {
            return;
        }

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB Connected"
        );

    } catch (error) {

        console.log(
            "MongoDB connection error:"
        );

        console.log(error);

    }

}


// =================================
// CONNECT DATABASE
// =================================

connectDB();


// =================================
// LOCAL DEVELOPMENT ONLY
// =================================

if (process.env.VERCEL !== "1") {

    // Start reminder cron job
    startReminderJob();

    // Start weekly report cron job
    startWeeklyReportJob();


    // Start local Express server
    app.listen(
        PORT,
        () => {

            console.log(
                `Server running on port ${PORT}`
            );

        }
    );

}


// =================================
// EXPORT EXPRESS APP FOR VERCEL
// =================================

module.exports = app;
