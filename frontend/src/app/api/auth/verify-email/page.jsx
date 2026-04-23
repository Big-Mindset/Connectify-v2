"use client"
import { authClient } from "@/lib/auth-client"
import { Loader2, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"


export default function VerifyEmail() {
    const [error , setError] = useState("")
    const [time , setTime] = useState(5)
    let timeout = useRef(null)
    let params = useSearchParams()
    let token = params.get("token")
    let router = useRouter()
    let session = authClient.useSession()
    useEffect(() => {
        
        console.log("useEffect no :1")
        console.log(session)
        if (session.data){
            router.push("/")
        }else if (!session.isPending && !session.data){
            console.log("running")
            verifyEmail()
            
        }

           
        
        return ()=>{
            if (timeout.current){
                clearInterval(timeout.current)
                timeout.current = null
            }
        }
    }, [session.data])
    let verifyEmail = useCallback( async ()=>{
        console.log("the func is running")
        if (!token) router.push("/login")
         await authClient.verifyEmail({
            query : {
                token
            }
         },{
            onError : (ctx)=>{
               setError(ctx.error.message)
               if (timeout.current){
                clearInterval(timeout.current)
               }
                timeout.current = setInterval(()=>{
                    console.log("timeInterval")
                   setTime((prev)=>{
                    if (prev === 1){
                        clearInterval(timeout.current)
                        timeout.current = null
                        return 0
                    }else{
                        return prev-1
                    }
                   }) 
                },1000)
            },
            onSuccess : ()=>{
             router.push("/")
            }
         })
    },[token])
    // useEffect(()=>{
    //     if (!time){
    //         router.push("/")
    //     }
    // },[time])
    return (
    <div className="flex justify-center items-center h-dvh">

    <div className=" bg-gradient-to-b w-full max-w-[500px]  from-[#2A2A2A] to-[#191919] shadow-[0.5px_-1px_5px_0.5px_gray]  rounded-lg p-2.5">
     
        <h1 className="font-bold text-2xl text-center">{error ? "Failed to verify email" : "Verifying Email"}</h1>
       
        {
            error ? <div className="text-red-300 text-center mt-3.5">{error} </div> :  <div className="mt-3.5">
            <Loader2 className="animate-spin size-20  text-indigo-500 text-shadow-blue-300 mx-auto" />
        </div>
        }
        {
            error && (
            <div>
                <div className="text-gray-200 text-center mt-1.5">Redirecting to login page in </div>
                <p className="text-4xl text-center">{time}</p>
            </div>
                )
        }
    </div>
    </div>
    )
}