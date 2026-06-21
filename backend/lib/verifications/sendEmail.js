import { transporter } from "../nodemailer.js";
import dotenv from "dotenv"
dotenv.config()

export const SendEmail = async ({ to, subject, html, recipient }) => {
    try {

        let res = await transporter.sendMail({
            from: "81dfa0001@smtp-brevo.com",
            to,
            subject,
            html,

        });
    } catch (error) {
        console.log(error.message)
    }
}