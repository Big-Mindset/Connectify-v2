import { transporter } from "../nodemailer.js";
import dotenv from "dotenv"
dotenv.config()
console.log({
  host: process.env.SMTP_HOST,
  user: process.env.SMTP_USER
});
export const SendEmail = async ({ to, subject, html, recipient }) => {
    try {

        await transporter.verify();
        console.log("SMTP OK");
        let res = await transporter.sendMail({
            from: "81dfa0001@smtp-brevo.com",
            to,
            subject,
            html,

        });
        console.log(res)
    } catch (error) {
        console.log(error.message)
    }
}