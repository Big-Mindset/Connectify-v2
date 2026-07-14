"use client"
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {  useEffect,  useState } from "react"


export default function VerifyEmail() {
    let params = useSearchParams()
    let token = params.get("token")
    let router = useRouter()
    // console.log(data ,isPending)
    useEffect(() => {
            verifyEmail()
    }, [])
    let verifyEmail =  async ()=>{
         
        await authClient.verifyEmail({
            query : {
                token
            }
         },{
            onError : (ctx)=>{
                router.push("/login")
            },
            onSuccess : (ctx)=>{
                console.log(ctx)
             router.push("/")
            }
         })
        }

    return (
    <div className="flex justify-center items-center h-dvh">

    <div className=" bg-gradient-to-b w-full max-w-[500px]  from-[#2A2A2A] to-[#191919] shadow-[0.5px_-1px_5px_0.5px_gray]  rounded-lg p-2.5">
     
        <h1 className="font-bold text-2xl text-center">Verifying Email</h1>
       
     
          <div className="mt-3.5">
            <Loader2 className="animate-spin size-20  text-indigo-500 text-shadow-blue-300 mx-auto" />
        </div>
        
    
    </div>
    </div>
    )
}