import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {prisma} from "../services/prismaClient.js"
import "dotenv/config"
import { verificationEmailTemplate } from "../verifications/emailVerification.js";
import {SendEmail} from "../verifications/sendEmail.js"
import { passwordResetEmailTemplate } from "../verifications/passwordResetTempelate.js";
import { createAuthMiddleware } from "better-auth/api";


export const auth = betterAuth({
    appName : "Connectify",
    database: prismaAdapter(prisma,{
        provider: "postgresql",
    }),
    logger : {
        level : "debug"
    },
    baseURL : "http://localhost:3000",
    trustedOrigins : ["http://localhost:3000"],
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
    account : {
        accountLinking : {
            enabled : true,
            trustedProviders : ["google" , "github"],
            
        },
        
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
    rateLimit : {
        max : 40,
        window : 60,
        customRules : {
            "/reset-password" : {
                max : 10,
                window : 60
            },
            "/verify-email" : {
                max : 10,
                window : 60
            }
        }
    },
    emailVerification : {
        sendOnSignUp : true,
        
            sendVerificationEmail : async function({token , url , user}){
               
                console.log(url , token)
                await SendEmail({
                    recipient : user.name,
                    to : user.email,
                    html : verificationEmailTemplate({email : user.email , name : user.name , verificationLink : url}),
                    subject : "Is That You"
                })
            },
          
    },

    session : {
        expiresIn : 60 * 60 * 24 * 7,
        updateAge : 60 * 60 * 24 ,
        freshAge : 60 * 60 * 24 * 5,
        cookieCache : {
            enabled : true,
            maxAge : 2 * 60,
            strategy : "compact",
            
        }
    },
    user : {
        additionalFields : {
            username : {
                type : "string",
                required : true,
                unique : true,
            },
            bio : {
                type : "string",
            }
        }
    },
    
    
    // plugins : [
    //     username({
    //         usernameValidator : async (username)=>{
    //            let doesExist =  await prisma.user.findUnique({
    //                 where : {
    //                     username : username
    //                 }
    //             })
    //             if (doesExist.id){
    //                 return false
    //             }
    //             return true
    //         },
            
    //     })
    // ],
});
console.log(auth.options.account)