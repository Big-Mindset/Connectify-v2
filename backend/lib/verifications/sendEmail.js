import { transporter } from "../services/nodemailer.js";
import dotenv from "dotenv"
dotenv.config()

export const SendEmail = async ({ to, subject, html, recipient }) => {
    try {
        
        let res = await transporter.sendMail({
            from: "Wad <wadoodmemon0@gmail.com>",
            to,
            subject,
            html,

        });
    } catch (error) {
        console.log(error.message)
    }
}