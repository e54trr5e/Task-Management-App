const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const Task = require("../models/Task");

const {
  generatePlan,
  convertPlanToTasks,
  generateProductivityInsights,
} = require("../services/aiService");


// ======================================================
// PROTECT ALL AI ROUTES
// ======================================================
//
// authMiddleware:
// 1. Reads Bearer token
// 2. Verifies JWT
// 3. Sets req.userId
//
// ======================================================

router.use(authMiddleware);


// ======================================================
// GENERATE AI PLAN
// POST /api/ai/generate-plan
// ======================================================

router.post("/generate-plan", async (req, res) => {

  try {

    const { goal } = req.body;


    // ==========================================
    // VALIDATE GOAL
    // ==========================================

    if (
      !goal ||
      typeof goal !== "string" ||
      !goal.trim()
    ) {

      return res.status(400).json({

        message:
          "Please enter a goal",

      });

    }


    // ==========================================
    // LIMIT GOAL LENGTH
    // ==========================================

    if (
      goal.trim().length > 2000
    ) {

      return res.status(400).json({

        message:
          "Goal is too long",

      });

    }


    // ==========================================
    // GENERATE AI PLAN
    // ==========================================

    const plan =
      await generatePlan(
        goal.trim()
      );


    // ==========================================
    // RETURN PLAN
    // ==========================================

    return res.json({

      plan,

    });


  } catch (error) {

    console.error(
      "AI PLAN ERROR:",
      error
    );


    return res.status(500).json({

      message:
        error.message ||
        "Could not generate AI plan",

    });

  }

});


// ======================================================
// CONVERT AI PLAN TO STRUCTURED TASKS
// POST /api/ai/convert-to-tasks
// ======================================================

router.post("/convert-to-tasks", async (req, res) => {

  try {

    const { plan } = req.body;


    // ==========================================
    // VALIDATE PLAN
    // ==========================================

    if (
      !plan ||
      typeof plan !== "string" ||
      !plan.trim()
    ) {

      return res.status(400).json({

        message:
          "AI plan is required",

      });

    }


    // ==========================================
    // LIMIT PLAN LENGTH
    // ==========================================
    //
    // Prevent extremely large prompts from
    // being sent to Gemini.
    //
    // ==========================================

    if (
      plan.trim().length > 20000
    ) {

      return res.status(400).json({

        message:
          "AI plan is too long to convert",

      });

    }


    // ==========================================
    // CONVERT PLAN USING GEMINI
    // ==========================================

    const tasks =
      await convertPlanToTasks(
        plan.trim()
      );


    // ==========================================
    // VALIDATE AI RESULT
    // ==========================================

    if (
      !Array.isArray(tasks)
    ) {

      throw new Error(
        "AI returned an invalid task list"
      );

    }


    // ==========================================
    // RETURN STRUCTURED TASKS
    // ==========================================

    return res.json({

      tasks,

    });


  } catch (error) {

    console.error(
      "CONVERT TASKS ERROR:",
      error
    );


    return res.status(500).json({

      message:
        error.message ||
        "Could not convert plan to tasks",

    });

  }

});


// ======================================================
// GENERATE AI PRODUCTIVITY INSIGHTS
// POST /api/ai/productivity-insights
// ======================================================

router.post("/productivity-insights", async (req, res) => {

  try {


    // ==========================================
    // GET LOGGED-IN USER'S ACTIVE TASKS
    // ==========================================
    //
    // Soft-deleted tasks remain in MongoDB
    // for future ML/history purposes.
    //
    // They should NOT affect current
    // productivity analytics.
    //
    // ==========================================

    const tasks =
      await Task.find({

        user:
          req.userId,

        isDeleted: {

          $ne:
            true,

        },

      })
        .sort({

          createdAt:
            -1,

        })
        .lean();


    // ==========================================
    // USER HAS NO TASKS
    // ==========================================

    if (
      tasks.length === 0
    ) {

      return res.json({

        stats: {

          total:
            0,

          completed:
            0,

          pending:
            0,

          overdue:
            0,

          highPriorityPending:
            0,

          mediumPriorityPending:
            0,

          lowPriorityPending:
            0,

          completionRate:
            0,

        },


        insights: `## Overall Performance

You don't have any tasks yet, so there isn't enough task activity to analyze.

## Areas Requiring Attention

There are currently no tasks requiring attention.

## Recommended Focus

Create some tasks or use the AI Planner to generate a structured task plan.

## Productivity Pattern

There is not enough task data yet to identify a productivity pattern.

## Next Action

Create your first task and start tracking your progress.`,

      });

    }


    // ==========================================
    // START OF TODAY
    // ==========================================
    //
    // A task due today should NOT be
    // considered overdue.
    //
    // ==========================================

    const now =
      new Date();


    const startOfToday =
      new Date(

        now.getFullYear(),

        now.getMonth(),

        now.getDate(),

      );


    // ==========================================
    // TOTAL TASKS
    // ==========================================

    const total =
      tasks.length;


    // ==========================================
    // COMPLETED TASKS
    // ==========================================

    const completedTasks =
      tasks.filter(

        (task) =>
          task.status ===
          "Completed"

      );


    const completed =
      completedTasks.length;


    // ==========================================
    // PENDING TASKS
    // ==========================================
    //
    // Both:
    //
    // To Do
    // In Progress
    //
    // count as pending.
    //
    // ==========================================

    const pendingTasks =
      tasks.filter(

        (task) =>
          task.status !==
          "Completed"

      );


    const pending =
      pendingTasks.length;


    // ==========================================
    // OVERDUE TASKS
    // ==========================================

    const overdueTasks =
      pendingTasks.filter(

        (task) => {

          if (
            !task.dueDate
          ) {

            return false;

          }


          const dueDate =
            new Date(
              task.dueDate
            );


          if (
            Number.isNaN(
              dueDate.getTime()
            )
          ) {

            return false;

          }


          return (
            dueDate <
            startOfToday
          );

        }

      );


    const overdue =
      overdueTasks.length;


    // ==========================================
    // HIGH PRIORITY PENDING
    // ==========================================

    const highPriorityPending =
      pendingTasks.filter(

        (task) =>
          task.priority ===
          "High"

      ).length;


    // ==========================================
    // MEDIUM PRIORITY PENDING
    // ==========================================

    const mediumPriorityPending =
      pendingTasks.filter(

        (task) =>
          task.priority ===
          "Medium"

      ).length;


    // ==========================================
    // LOW PRIORITY PENDING
    // ==========================================

    const lowPriorityPending =
      pendingTasks.filter(

        (task) =>
          task.priority ===
          "Low"

      ).length;


    // ==========================================
    // COMPLETION RATE
    // ==========================================

    const completionRate =
      total > 0

        ? Math.round(

            (
              completed /
              total
            ) * 100

          )

        : 0;


    // ==========================================
    // FINAL STATISTICS
    // ==========================================

    const stats = {

      total,

      completed,

      pending,

      overdue,

      highPriorityPending,

      mediumPriorityPending,

      lowPriorityPending,

      completionRate,

    };


    // ==========================================
    // PRIORITY ORDER
    // ==========================================

    const priorityOrder = {

      High:
        1,

      Medium:
        2,

      Low:
        3,

    };


    // ==========================================
    // SORT RELEVANT PENDING TASKS
    // ==========================================
    //
    // Gemini does not need every task.
    //
    // Order:
    //
    // 1. Overdue
    // 2. High priority
    // 3. Medium priority
    // 4. Low priority
    // 5. Nearest deadline
    //
    // ==========================================

    const sortedRelevantTasks =
      [...pendingTasks]
        .sort(

          (a, b) => {


            // ==================================
            // PARSE DUE DATES
            // ==================================

            const aDue =
              a.dueDate

                ? new Date(
                    a.dueDate
                  )

                : null;


            const bDue =
              b.dueDate

                ? new Date(
                    b.dueDate
                  )

                : null;


            // ==================================
            // VALID DATES
            // ==================================

            const aValidDue =
              aDue &&
              !Number.isNaN(
                aDue.getTime()
              );


            const bValidDue =
              bDue &&
              !Number.isNaN(
                bDue.getTime()
              );


            // ==================================
            // CHECK OVERDUE
            // ==================================

            const aOverdue =
              aValidDue &&
              aDue <
                startOfToday;


            const bOverdue =
              bValidDue &&
              bDue <
                startOfToday;


            // ==================================
            // OVERDUE FIRST
            // ==================================

            if (
              aOverdue &&
              !bOverdue
            ) {

              return -1;

            }


            if (
              !aOverdue &&
              bOverdue
            ) {

              return 1;

            }


            // ==================================
            // PRIORITY SECOND
            // ==================================

            const aPriority =
              priorityOrder[
                a.priority
              ] || 4;


            const bPriority =
              priorityOrder[
                b.priority
              ] || 4;


            if (
              aPriority !==
              bPriority
            ) {

              return (
                aPriority -
                bPriority
              );

            }


            // ==================================
            // NEAREST DEADLINE THIRD
            // ==================================

            if (
              aValidDue &&
              bValidDue
            ) {

              return (
                aDue.getTime() -
                bDue.getTime()
              );

            }


            // ==================================
            // TASK WITH DEADLINE FIRST
            // ==================================

            if (
              aValidDue &&
              !bValidDue
            ) {

              return -1;

            }


            if (
              !aValidDue &&
              bValidDue
            ) {

              return 1;

            }


            return 0;

          }

        )


        // ==================================
        // SEND MAXIMUM 20 TASKS TO GEMINI
        // ==================================

        .slice(
          0,
          20
        );


    // ==========================================
    // GENERATE GEMINI PRODUCTIVITY INSIGHTS
    // ==========================================

    const insights =
      await generateProductivityInsights(

        stats,

        sortedRelevantTasks,

      );


    // ==========================================
    // SEND RESULT TO FRONTEND
    // ==========================================

    return res.json({

      stats,

      insights,

    });


  } catch (error) {

    console.error(
      "PRODUCTIVITY INSIGHTS ROUTE ERROR:",
      error
    );


    return res.status(500).json({

      message:
        error.message ||
        "Could not generate productivity insights",

    });

  }

});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports =
  router;