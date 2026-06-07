
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { emailSchema, signIn } from "@/zod/authValidations"
import { useState } from "react"
import { useLoading } from "@/lib/loading_hook"
import { Loader2, X } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ForgotPassword({setLoginMethod}){
    const [error , setError] = useState("")
    
    const {loading , setLoading} = useLoading()
    let router = useRouter()
    let {handleSubmit , formState : {errors}, register,reset} = useForm({
        resolver : zodResolver(emailSchema),
        defaultValues : {
            email : "",
        },
    })
      const handleCheckEmail = async (data)=>{
        setLoading("checking-email")
           await authClient.requestPasswordReset({
            email : data.email,
           },{
            onError : (ctx)=>{
                 if (ctx?.error?.status === 429){
                        setError(ctx?.error.error)
                    }else{

                        setError(ctx.error.message)
                    }
            },
            onSuccess : (ctx)=>{
               toast.success(ctx.data.message)
               reset()
            }
           })
        setLoading(null)

        }
    return <div className=" bg-gradient-to-b max-w-[450px] from-[#2A2A2A] to-[#191919] border-gray-5 border-2  rounded-lg p-2.5">
       <div onClick={()=>setLoginMethod("sign-in")} className="hover:bg-gray-700 duration-200 w-fit cursor-pointer rounded-full p-1"><X size={20} /></div>
        
        
        <h1 className="text-center mt-1.5 font-bold text-2xl text-gray-300 mb-2"> Forgot Password?</h1>
        <p className="text-gray-400   text-center">Enter your email here then you will get verification email to reset your password</p>
        {error &&<div className="text-red-300 text-center">{error}</div>}
        <form onSubmit={handleSubmit(handleCheckEmail)} className="mt-1 text-gray-300 flex flex-col gap-2.5 p-2">
            <div className=" space-y-2 overflow-hidden rounded-md ">
                <label htmlFor="email" className="text-sm text-gray-400 font-bold">Email</label>
                <div>

                <input {...register("email")} type="email" placeholder="Enter your email" id="email" className="w-full  hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-[#1b1b1b] duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-6 outline-none" />
                <p className="text-sm text-red-300">{errors?.email?.message}</p>
                </div>
                
            </div>
         
            <div className="mt-2">
                <button disabled={loading === "checking-email"} className="bg-violet-500   hover:bg-violet-600/90 ease-in focus:scale-[0.95] cursor-pointer duration-200 text-indigo-100  w-full p-2 rounded-lg ">{loading === "checking-email" ? <Loader2 className="mx-auto animate-spin  text-gray-200" /> : "Continue"}</button>
            </div>
        </form>
      


    </div>
}