import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {username} from "better-auth/plugins"
import {prisma} from "../prismaClient.js"
import "dotenv/config"
import { verificationEmailTemplate } from "./verifications/emailVerification.js";
import { SendEmail } from "./verifications/sendEmail.js";
import { passwordResetEmailTemplate } from "./verifications/passwordResetTempelate.js";
console.log(process.env.GOOGLE_CLIENT_ID)

export const auth = betterAuth({
    database: prismaAdapter(prisma,{
        provider: "postgresql",
    }), 
    baseUrl : "http://localhost:8000",
    
    emailAndPassword : {
        enabled : true,
        autoSignIn : true,
        requireEmailVerification : true,
        resetPasswordTokenExpiresIn : 60 *20,
        minPasswordLength : 6,
        maxPasswordLength : 50,
        sendResetPassword  : ({user ,token , url})=>{
              SendEmail({
                    recipient : user.name,
                    to : user.email,
                    html : passwordResetEmailTemplate({email : user.email , name : user.name , resetLink : url}),
                    subject : "Reset your password"
                })
        }

    },
    socialProviders : {
        google : {
            clientId : process.env.GOOGLE_CLIENT_ID,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET
        },
        github : {
            clientId : process.env.GITHUB_CLIENT_ID,
            clientSecret : process.env.GITHUB_CLIENT_SECRET
        }
    },
    appName : "Whatsapp",
    emailVerification : {
        sendOnSignUp : true,
        sendOnSignIn : true,
        expiresIn : 60*20,
            // send email verification mail
            sendVerificationEmail : ({user ,token , url})=>{
          
                SendEmail({
                    recipient : user.name,
                    to : user.email,
                    html : verificationEmailTemplate({email : user.email , name : user.name , verificationLink : url}),
                    subject : "Is That You"
                })
            }
        
    },
    session : {
        expiresIn : 60 * 60 * 24 * 7,
        updateAge : 60 * 60 * 24 ,
        freshAge : 60 * 5,
        cookieCache : {
            enabled : true,
            maxAge : 2 * 60,
            strategy : "compact"
        }
    },
    plugins : [
        username({
            usernameValidator : async (username)=>{
               let doesExist =  await prisma.user.findUnique({
                    where : {
                        username : username
                    }
                })
                if (doesExist.id){
                    return false
                }
                return true
            }
        })
    ],
    baseURL : "http://localhost:3000"
});