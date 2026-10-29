require("dotenv").config();

const API_URL =
   "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

function wait(ms) {
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
}

async function testGemini() {

    console.log(
        "Gemini key loaded:",
        !!process.env.GEMINI_API_KEY
    );

    console.log("Testing Gemini REST API...");

    const maxAttempts = 3;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            console.log(
                `Attempt ${attempt}/${maxAttempts}`
            );

            const controller =
                new AbortController();

            const timeout =
                setTimeout(() => {
                    controller.abort();
                }, 30000);


            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-goog-api-key":
                            process.env.GEMINI_API_KEY,
                    },

                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text:
                                            "Reply with exactly: TaskFlow AI connected",
                                    },
                                ],
                            },
                        ],
                    }),

                    signal: controller.signal,
                }
            );


            clearTimeout(timeout);

            const data =
                await response.json();


            console.log(
                "HTTP Status:",
                response.status
            );


            if (response.ok) {

                const text =
                    data.candidates?.[0]
                        ?.content?.parts
                        ?.map(
                            (part) =>
                                part.text || ""
                        )
                        .join("");


                console.log("SUCCESS:");

                console.log(text);

                return;
            }


            // Retry temporary server errors
            if (
                response.status === 503 &&
                attempt < maxAttempts
            ) {

                const delay =
                    attempt * 3000;

                console.log(
                    `Gemini is busy. Retrying in ${
                        delay / 1000
                    } seconds...`
                );

                await wait(delay);

                continue;
            }


            console.log(
                "GEMINI API ERROR:"
            );

            console.log(
                JSON.stringify(
                    data,
                    null,
                    2
                )
            );

            return;


        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                console.log(
                    "Request timed out."
                );

            } else {

                console.log(
                    "REQUEST ERROR:",
                    error.message
                );

            }


            if (attempt < maxAttempts) {

                console.log(
                    "Retrying..."
                );

                await wait(
                    attempt * 3000
                );

            }

        }

    }


    console.log(
        "Gemini is currently unavailable after multiple attempts."
    );
}


testGemini();