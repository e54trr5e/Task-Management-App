const cron = require("node-cron");

const User = require("../models/User");
const Task = require("../models/Task");

const {
    sendEmail,
} = require("../services/emailService");


// =================================
// WEEKLY REPORT JOB
// =================================

function startWeeklyReportJob() {

    // Runs every Sunday
    // at 9:00 AM India time

    cron.schedule(
        "0 9 * * 0",

        async () => {

            console.log(
                "Checking weekly reports..."
            );


            try {

                // =========================
                // FIND USERS
                // =========================

                const users =
                    await User.find({

                        "preferences.weeklyReport":
                            true,

                    });


                console.log(
                    `${users.length} user(s) have weekly reports enabled`
                );


                // =========================
                // CHECK EACH USER
                // =========================

                for (
                    const user of users
                ) {

                    // =========================
                    // GET ACTIVE USER TASKS
                    // =========================
                    //
                    // Soft-deleted tasks stay
                    // in MongoDB for future ML,
                    // but they should not affect
                    // the user's current report.
                    // =========================

                    const tasks =
                        await Task.find({

                            user:
                                user._id,

                            isDeleted: {

                                $ne:
                                    true,

                            },

                        });


                    // =========================
                    // TOTAL TASKS
                    // =========================

                    const totalTasks =
                        tasks.length;


                    // =========================
                    // COMPLETED
                    // =========================

                    const completedTasks =
                        tasks.filter(

                            (task) =>
                                task.status ===
                                "Completed"

                        ).length;


                    // =========================
                    // IN PROGRESS
                    // =========================

                    const inProgressTasks =
                        tasks.filter(

                            (task) =>
                                task.status ===
                                "In Progress"

                        ).length;


                    // =========================
                    // TO DO
                    // =========================

                    const todoTasks =
                        tasks.filter(

                            (task) =>
                                task.status ===
                                "To Do"

                        ).length;


                    // =========================
                    // HIGH PRIORITY
                    // =========================

                    const highPriorityTasks =
                        tasks.filter(

                            (task) =>
                                task.priority ===
                                "High"

                        ).length;


                    // =========================
                    // COMPLETION RATE
                    // =========================

                    let completionRate =
                        0;


                    if (
                        totalTasks > 0
                    ) {

                        completionRate =
                            Math.round(

                                (
                                    completedTasks /
                                    totalTasks
                                ) * 100

                            );

                    }


                    // =========================
                    // SEND EMAIL
                    // =========================

                    const emailSent =
                        await sendEmail(

                            user.email,

                            "Your Weekly TaskFlow Report",

                            `
                                <div
                                    style="
                                        font-family: Arial, sans-serif;
                                        max-width: 600px;
                                        margin: auto;
                                        padding: 20px;
                                    "
                                >

                                    <h2>
                                        TaskFlow Weekly Report
                                    </h2>


                                    <p>
                                        Hi ${user.name},
                                    </p>


                                    <p>
                                        Here is your weekly
                                        productivity summary.
                                    </p>


                                    <hr>


                                    <h3>
                                        Task Summary
                                    </h3>


                                    <p>

                                        <strong>
                                            Total Tasks:
                                        </strong>

                                        ${totalTasks}

                                    </p>


                                    <p>

                                        <strong>
                                            Completed:
                                        </strong>

                                        ${completedTasks}

                                    </p>


                                    <p>

                                        <strong>
                                            In Progress:
                                        </strong>

                                        ${inProgressTasks}

                                    </p>


                                    <p>

                                        <strong>
                                            To Do:
                                        </strong>

                                        ${todoTasks}

                                    </p>


                                    <p>

                                        <strong>
                                            High Priority:
                                        </strong>

                                        ${highPriorityTasks}

                                    </p>


                                    <hr>


                                    <h3>
                                        Completion Rate
                                    </h3>


                                    <h2>
                                        ${completionRate}%
                                    </h2>


                                    <p>
                                        Keep making progress
                                        with TaskFlow!
                                    </p>


                                    <hr>


                                    <p>
                                        TaskFlow
                                    </p>

                                </div>
                            `

                        );


                    // =========================
                    // EMAIL RESULT
                    // =========================

                    if (emailSent) {

                        console.log(
                            `Weekly report sent to: ${user.email}`
                        );

                    } else {

                        console.log(
                            `Weekly report failed for: ${user.email}`
                        );

                    }

                }


            } catch (error) {

                console.log(
                    "WEEKLY REPORT ERROR:",
                    error
                );

            }

        },


        // =========================
        // TIMEZONE
        // =========================

        {
            timezone:
                "Asia/Kolkata",
        }

    );


    console.log(
        "Weekly report job started"
    );

}


module.exports =
    startWeeklyReportJob; 