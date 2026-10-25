const { Resend } = require("resend");

const resend =
    new Resend(
        process.env.RESEND_API_KEY
    );


async function sendEmail(
    to,
    subject,
    html
) {

    try {

        const {
            data,
            error,
        } = await resend.emails.send({

            from:
                "TaskFlow <onboarding@resend.dev>",

            to: to,

            subject: subject,

            html: html,

        });


        // Resend rejected email
        if (error) {

            console.log(
                "EMAIL ERROR:",
                error
            );

            return false;

        }


        // Email accepted
        console.log(
            "Email sent successfully:",
            data
        );

        return true;


    } catch (error) {

        console.log(
            "EMAIL ERROR:",
            error
        );

        return false;

    }

}


module.exports = {
    sendEmail,
};