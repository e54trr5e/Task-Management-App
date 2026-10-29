// ======================================================
// GEMINI API CONFIGURATION
// ======================================================

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";



// ======================================================
// HELPER: CALL GEMINI API
// ======================================================

async function callGemini(prompt) {

    const apiKey =
        process.env.GEMINI_API_KEY;


    if (!apiKey) {

        throw new Error(
            "GEMINI_API_KEY is missing from .env"
        );

    }


    const maxAttempts = 3;


    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => {
                    controller.abort();
                },
                30000
            );


        try {

            const response =
                await fetch(
                    GEMINI_API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "x-goog-api-key":
                                apiKey,
                        },

                        body:
                            JSON.stringify({
                                contents: [
                                    {
                                        role: "user",

                                        parts: [
                                            {
                                                text:
                                                    prompt,
                                            },
                                        ],
                                    },
                                ],
                            }),

                        signal:
                            controller.signal,
                    }
                );


            clearTimeout(
                timeout
            );


            const data =
                await response.json();


            // ==========================================
            // GEMINI API ERROR
            // ==========================================

            if (!response.ok) {

                const message =
                    data?.error
                        ?.message ||
                    "Gemini API request failed";


                console.error(
                    `GEMINI API ERROR (attempt ${attempt}):`,
                    message
                );


                // Retry temporary server errors

                if (
                    response.status ===
                        503 &&
                    attempt <
                        maxAttempts
                ) {

                    await new Promise(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                1500 *
                                    attempt
                            )
                    );


                    continue;

                }


                throw new Error(
                    message
                );

            }



            // ==========================================
            // EXTRACT TEXT
            // ==========================================

            const text =
                data?.candidates?.[0]
                    ?.content?.parts
                    ?.map(
                        (part) =>
                            part.text ||
                            ""
                    )
                    .join("")
                    .trim();


            if (!text) {

                throw new Error(
                    "Gemini returned an empty response"
                );

            }


            return text;


        } catch (error) {

            clearTimeout(
                timeout
            );


            // ==========================================
            // REQUEST TIMEOUT
            // ==========================================

            if (
                error.name ===
                "AbortError"
            ) {

                if (
                    attempt <
                    maxAttempts
                ) {

                    console.log(
                        `Gemini request timed out. Retrying (${attempt}/${maxAttempts})...`
                    );


                    continue;

                }


                throw new Error(
                    "Gemini request timed out"
                );

            }



            // ==========================================
            // RETRY NETWORK ERROR
            // ==========================================

            if (
                attempt <
                    maxAttempts &&
                (
                    error.message
                        ?.includes(
                            "fetch"
                        ) ||
                    error.message
                        ?.includes(
                            "network"
                        )
                )
            ) {

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            1500 *
                                attempt
                        )
                );


                continue;

            }


            throw error;

        }

    }


    throw new Error(
        "Gemini request failed after multiple attempts"
    );

}



// ======================================================
// GENERATE NATURAL LANGUAGE AI PLAN
// ======================================================

async function generatePlan(
    goal
) {

    if (
        !goal ||
        typeof goal !==
            "string" ||
        !goal.trim()
    ) {

        throw new Error(
            "Goal is required"
        );

    }


    const prompt = `
You are TaskFlow AI, an intelligent productivity
planning assistant.

The user wants help planning the following goal:

"${goal.trim()}"

Create a practical and organized action plan.

RULES:

- Break the goal into realistic steps.
- Keep the plan clear and actionable.
- Use Markdown.
- Use headings where useful.
- Use bullet points or numbered steps.
- Keep the language simple.
- Do not create unnecessary steps.
- Do not claim that TaskFlow completed anything.
- Do not claim that tasks have already been saved.
- Do not return JSON.
- Return only the plan.

The plan should help the user understand exactly
what they should do to achieve the goal.
`;


    return await callGemini(
        prompt
    );

}



// ======================================================
// CONVERT AI PLAN TO STRUCTURED TASKS
// ======================================================

async function convertPlanToTasks(
    plan
) {

    if (
        !plan ||
        typeof plan !==
            "string" ||
        !plan.trim()
    ) {

        throw new Error(
            "Plan is required"
        );

    }



    // ==================================================
    // CURRENT DATE
    // ==================================================

    const currentDate =
        new Date()
            .toISOString()
            .split("T")[0];



    const prompt = `
You are TaskFlow AI.

Convert the following productivity plan into
structured tasks that can be stored in a
task-management application.

CURRENT DATE:
${currentDate}

PLAN:

${plan.trim()}

Return ONLY a valid JSON array.

Do not use Markdown.

Do not use code fences.

Each object must have exactly these fields:

{
    "title": "Short task title",
    "description": "Useful task description",
    "priority": "High",
    "dueDate": "YYYY-MM-DD"
}

RULES:

1. title must be short and clear.

2. description should briefly explain what
   needs to be done.

3. priority must be exactly one of:
   "High"
   "Medium"
   "Low"

4. dueDate must use YYYY-MM-DD format.

5. Never generate a due date before:
   ${currentDate}

6. Assign realistic future dates.

7. Important or urgent tasks should generally
   receive higher priority.

8. Do not include status.

9. Do not include MongoDB IDs.

10. Do not include any text outside the JSON array.

11. Do not claim any task has already been completed.

12. Generate only useful actionable tasks.
`;



    let result =
        await callGemini(
            prompt
        );



    // ==================================================
    // REMOVE POSSIBLE MARKDOWN CODE BLOCKS
    // ==================================================

    result =
        result
            .replace(
                /```json/gi,
                ""
            )
            .replace(
                /```/g,
                ""
            )
            .trim();



    // ==================================================
    // FIND JSON ARRAY
    // ==================================================

    const arrayStart =
        result.indexOf("[");


    const arrayEnd =
        result.lastIndexOf("]");


    if (
        arrayStart === -1 ||
        arrayEnd === -1 ||
        arrayEnd <
            arrayStart
    ) {

        console.error(
            "INVALID GEMINI TASK RESPONSE:",
            result
        );


        throw new Error(
            "Gemini did not return a valid task array"
        );

    }


    const jsonText =
        result.substring(
            arrayStart,
            arrayEnd + 1
        );



    // ==================================================
    // PARSE JSON
    // ==================================================

    let parsedTasks;


    try {

        parsedTasks =
            JSON.parse(
                jsonText
            );

    } catch (error) {

        console.error(
            "TASK JSON PARSE ERROR:",
            error
        );


        console.error(
            "GEMINI RESPONSE:",
            result
        );


        throw new Error(
            "Could not parse AI generated tasks"
        );

    }



    if (
        !Array.isArray(
            parsedTasks
        )
    ) {

        throw new Error(
            "AI task response is not an array"
        );

    }



    // ==================================================
    // NORMALIZE TASKS
    // ==================================================

    const allowedPriorities = [
        "High",
        "Medium",
        "Low",
    ];


    const normalizedTasks =
        parsedTasks
            .map(
                (
                    task,
                    index
                ) => {

                    // ==================================
                    // TITLE
                    // ==================================

                    const title =
                        typeof task.title ===
                            "string"
                            ? task.title
                                .trim()
                            : "";


                    if (!title) {

                        return null;

                    }



                    // ==================================
                    // DESCRIPTION
                    // ==================================

                    const description =
                        typeof task.description ===
                            "string"
                            ? task.description
                                .trim()
                            : "";



                    // ==================================
                    // PRIORITY
                    // ==================================

                    let priority =
                        typeof task.priority ===
                            "string"
                            ? task.priority
                                .trim()
                            : "Medium";


                    if (
                        !allowedPriorities
                            .includes(
                                priority
                            )
                    ) {

                        priority =
                            "Medium";

                    }



                    // ==================================
                    // DUE DATE
                    // ==================================

                    let dueDate =
                        typeof task.dueDate ===
                            "string"
                            ? task.dueDate
                                .trim()
                            : "";


                    const validDateFormat =
                        /^\d{4}-\d{2}-\d{2}$/;


                    if (
                        !validDateFormat.test(
                            dueDate
                        )
                    ) {

                        // Fallback date:
                        // current date + task index + 1

                        const fallbackDate =
                            new Date();


                        fallbackDate.setDate(
                            fallbackDate
                                .getDate() +
                                index +
                                1
                        );


                        dueDate =
                            fallbackDate
                                .toISOString()
                                .split("T")[0];

                    }



                    // ==================================
                    // PREVENT PAST DATES
                    // ==================================

                    if (
                        dueDate <
                        currentDate
                    ) {

                        const fallbackDate =
                            new Date();


                        fallbackDate.setDate(
                            fallbackDate
                                .getDate() +
                                index +
                                1
                        );


                        dueDate =
                            fallbackDate
                                .toISOString()
                                .split("T")[0];

                    }



                    return {

                        title,

                        description,

                        priority,

                        dueDate,

                    };

                }
            )
            .filter(Boolean);



    if (
        normalizedTasks.length ===
        0
    ) {

        throw new Error(
            "AI did not generate any valid tasks"
        );

    }


    return normalizedTasks;

}



// ======================================================
// GENERATE AI PRODUCTIVITY INSIGHTS
// ======================================================

async function generateProductivityInsights(
    stats,
    relevantTasks = []
) {

    if (
        !stats ||
        typeof stats !==
            "object"
    ) {

        throw new Error(
            "Productivity statistics are required"
        );

    }



    // ==================================================
    // CURRENT DATE
    // ==================================================

    const currentDate =
        new Date()
            .toISOString()
            .split("T")[0];



    // ==================================================
    // PREPARE TASK INFORMATION FOR GEMINI
    // ==================================================

    const taskSummary =
        relevantTasks
            .slice(
                0,
                20
            )
            .map(
                (task) => {

                    let dueDate =
                        null;


                    if (
                        task.dueDate
                    ) {

                        const parsedDate =
                            new Date(
                                task.dueDate
                            );


                        if (
                            !Number.isNaN(
                                parsedDate
                                    .getTime()
                            )
                        ) {

                            dueDate =
                                parsedDate
                                    .toISOString()
                                    .split(
                                        "T"
                                    )[0];

                        }

                    }


                    return {

                        title:
                            task.title,

                        status:
                            task.status,

                        priority:
                            task.priority,

                        dueDate,

                    };

                }
            );



    // ==================================================
    // GEMINI PROMPT
    // ==================================================

    const prompt = `
You are TaskFlow AI, an intelligent productivity
analysis assistant.

Your job is to analyze task-management data
that has already been calculated by TaskFlow.

CURRENT DATE:
${currentDate}


PRODUCTIVITY STATISTICS:

Total Tasks:
${stats.total}

Completed Tasks:
${stats.completed}

Pending Tasks:
${stats.pending}

Overdue Tasks:
${stats.overdue}

High Priority Pending Tasks:
${stats.highPriorityPending}

Medium Priority Pending Tasks:
${stats.mediumPriorityPending}

Low Priority Pending Tasks:
${stats.lowPriorityPending}

Completion Rate:
${stats.completionRate}%


RELEVANT PENDING TASKS:

${JSON.stringify(
    taskSummary,
    null,
    2
)}


IMPORTANT:

The statistics above have already been calculated
by TaskFlow.

Do NOT recalculate them.

Analyze the statistics and task information and
provide useful productivity recommendations.


Return natural Markdown using exactly these
main sections:


## Overall Performance

Briefly explain the user's current productivity
based on the supplied statistics.


## Areas Requiring Attention

Identify the most important problems.

Use bullet points where useful.


## Recommended Focus

Recommend which pending tasks should receive
attention first.

Consider:

- overdue tasks
- high-priority tasks
- upcoming deadlines

Mention specific task titles when useful.


## Productivity Pattern

Describe useful patterns visible from the
supplied information.

Do not pretend to know historical behavior
that is not present in the supplied data.


## Next Action

Give one short and concrete action that the
user should take next.


RULES:

- Be practical.
- Be concise.
- Be encouraging but factual.
- Do not shame or criticize the user.
- Do not invent tasks.
- Do not invent deadlines.
- Do not invent statistics.
- Do not modify the supplied statistics.
- Do not recalculate the completion rate.
- Only mention task titles supplied above.
- Do not claim that you changed a task.
- Do not claim that you completed a task.
- Do not claim TaskFlow performed an action
  unless it appears in the supplied data.
- Do not include JSON.
- Return only the Markdown productivity analysis.
`;



    // ==================================================
    // CALL GEMINI
    // ==================================================

    const insights =
        await callGemini(
            prompt
        );


    return insights;

}



// ======================================================
// EXPORT FUNCTIONS
// ======================================================
//
// IMPORTANT:
// aiService.js must NOT require itself.
// aiRoutes.js imports these functions from here.
//
// ======================================================

module.exports = {
    generatePlan,
    convertPlanToTasks,
    generateProductivityInsights,
};