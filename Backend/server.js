const dns = require("dns");

// DNS configuration for MongoDB Atlas
dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Load environment variables
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
// CREATE EXPRESS APP
// =========================

const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());


// =========================
// API ROUTES
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/ai", aiRoutes);


// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {

    res.send("TaskFlow Backend Running");

});


// =========================
// PORT
// =========================

const PORT = process.env.PORT || 5000;


// =========================
// CONNECT TO MONGODB
// =========================

async function connectDB() {

    try {

        // Avoid reconnecting if MongoDB
        // is already connected
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB Connected");

    } catch (error) {

        console.log(
            "MongoDB connection error:"
        );

        console.log(error);

    }

}


// =========================
// CONNECT DATABASE
// =========================

connectDB();


// =========================
// LOCAL DEVELOPMENT ONLY
// =========================

if (process.env.VERCEL !== "1") {

    // Start background jobs locally
    startReminderJob();

    startWeeklyReportJob();


    // Start Express server
    app.listen(PORT, () => {

        console.log(
            `Server running on port ${PORT}`
        );

    });

}


// =========================
// EXPORT FOR VERCEL
// =========================

module.exports = app;