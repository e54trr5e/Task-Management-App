const cron = require("node-cron");

const Task = require("../models/Task");
const User = require("../models/User");

const {
    sendEmail,
} = require("../services/emailService");


// =================================
// TASK REMINDER JOB
// =================================

function startReminderJob() {

    // Runs every day at 9:00 AM
    // India time

    cron.schedule(
        "0 9 * * *",

        async () => {

            console.log(
                "Checking task reminders..."
            );


            try {

                // =========================
                // TOMORROW START
                // =========================

                const tomorrowStart =
                    new Date();

                tomorrowStart.setDate(
                    tomorrowStart.getDate() + 1
                );

                tomorrowStart.setHours(
                    0,
                    0,
                    0,
                    0
                );


                // =========================
                // TOMORROW END
                // =========================

                const tomorrowEnd =
                    new Date(
                        tomorrowStart
                    );

                tomorrowEnd.setHours(
                    23,
                    59,
                    59,
                    999
                );


                // =========================
                // FIND ACTIVE TASKS
                // =========================

                const tasks =
                    await Task.find({

                        dueDate: {

                            $gte:
                                tomorrowStart,

                            $lte:
                                tomorrowEnd,

                        },

                        reminderSent:
                            false,

                        status: {

                            $ne:
                                "Completed",

                        },


                        // =====================
                        // IGNORE DELETED TASKS
                        // =====================
                        //
                        // Deleted tasks remain
                        // in MongoDB for ML
                        // history, but should
                        // never receive reminders.
                        //
                        // $ne: true also supports
                        // old tasks that do not
                        // have isDeleted yet.
                        // =====================

                        isDeleted: {

                            $ne:
                                true,

                        },

                    });


                console.log(
                    `${tasks.length} task(s) found for reminders`
                );


                // =========================
                // CHECK EACH TASK
                // =========================

                for (
                    const task of tasks
                ) {

                    // Find task owner

                    const user =
                        await User.findById(
                            task.user
                        );


                    if (!user) {

                        continue;

                    }


                    // =========================
                    // CHECK USER PREFERENCE
                    // =========================

                    if (
                        !user.preferences
                            ?.taskReminders
                    ) {

                        console.log(
                            `Task reminders disabled for ${user.email}`
                        );

                        continue;

                    }


                    // =========================
                    // FORMAT DUE DATE
                    // =========================

                    const formattedDate =
                        new Date(
                            task.dueDate
                        )
                            .toLocaleDateString(
                                "en-IN",
                                {

                                    day:
                                        "numeric",

                                    month:
                                        "long",

                                    year:
                                        "numeric",

                                    timeZone:
                                        "Asia/Kolkata",

                                }
                            );


                    // =========================
                    // SEND EMAIL
                    // =========================

                    const emailSent =
                        await sendEmail(

                            user.email,

                            `Task Reminder - ${task.title}`,

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
                                        TaskFlow Reminder
                                    </h2>


                                    <p>
                                        Hi ${user.name},
                                    </p>


                                    <p>
                                        Your task is due tomorrow.
                                    </p>


                                    <h3>
                                        ${task.title}
                                    </h3>


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


                                    <p>

                                        <strong>
                                            Due Date:
                                        </strong>

                                        ${formattedDate}

                                    </p>


                                    <p>
                                        Don't forget to complete
                                        your task before the
                                        deadline.
                                    </p>


                                    <hr>


                                    <p>
                                        TaskFlow
                                    </p>

                                </div>
                            `

                        );


                    // =========================
                    // EMAIL SUCCESS
                    // =========================

                    if (emailSent) {

                        task.reminderSent =
                            true;


                        await task.save();


                        console.log(
                            `Reminder sent for: ${task.title}`
                        );

                    } else {

                        console.log(
                            `Reminder failed for: ${task.title}`
                        );

                    }

                }


            } catch (error) {

                console.log(
                    "REMINDER JOB ERROR:",
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
        "Task reminder job started"
    );

}


module.exports =
    startReminderJob;