"use client"

import { useEffect, useState } from "react"
import SignIn from "./components/sign_in"
import SingUp from "./components/sign_up"
import EmailVerification from "./components/email-verification"
import { useRouter } from "next/navigation"
import ForgotPassword from "./components/forgot-password"
import { authClient } from "@/lib/auth-client"


export default function Login() {
    const [loginMethod , setLoginMethod] = useState("sign-in")
    const [email , setEmail] = useState("")
    let session = authClient.useSession()
   
    let router = useRouter()
    let getsession = async ()=>{
        let session = await authClient.getSession()
        
    }
    useEffect(()=>{
        getsession()
        if (session && session.data !== null){
            router.push("/")
        }
    },[session])
    let methods = ["sign-in","sign-up","forgot-password", "verify-email"]
    useEffect(()=>{
        if (!methods.includes(loginMethod)){
            setLoginMethod("sign-in")
        }
    },[loginMethod])
    return (
        <div className="h-full flex justify-center items-center">
            {loginMethod === "sign-in" ? 
            <SignIn setLoginMethod={setLoginMethod} setEmail={setEmail} /> 
            : loginMethod === "sign-up" ?  
            <SingUp setLoginMethod={setLoginMethod} setEmail={setEmail} /> : loginMethod === "forgot-password" ? <ForgotPassword setLoginMethod={setLoginMethod} /> : loginMethod === "verify-email" &&  <EmailVerification email={email} />}
        </div>
    )
}