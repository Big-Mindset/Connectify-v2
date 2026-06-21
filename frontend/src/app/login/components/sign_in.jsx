
import Image from "next/image"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signIn } from "@/zod/authValidations"
import { useState } from "react"
import { useLoading } from "@/lib/loading_hook"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { OauthButtons } from "@/components/oauth-buttons"

export default function SignIn({setLoginMethod , setEmail}){
    const [error , setError] = useState("")
    const {loading , setLoading} = useLoading()
    let router = useRouter()
    let {handleSubmit , formState : {errors}, register} = useForm({
        resolver : zodResolver(signIn),
        defaultValues : {
            email : "",
            password : ""
        },
    })
      const handleSignIn = async (data)=>{
          await authClient.signIn.email({
              ...data
          },{
            onError : (ctx)=>{
                if (ctx.error.code === "EMAIL_NOT_VERIFIED"){
                    toast.error(ctx.error.message)
                
                    setEmail(data.email)
                    setLoginMethod("verify-email")
                }else{
                    console.log(ctx)
                    if (ctx?.error?.status === 429){
                        setError(ctx?.error.error)
                    }else{

                        setError(ctx.error?.message)
                    }
                }
            },
            onSuccess : (ctx)=>{
                console.log(ctx)

                setError(null)
                // router.push("/")
            },onRequest : ()=>{
                setLoading("sign-in")

            }
          })
          setLoading(null)
          
          
           
        }
    return <div className=" bg-gradient-to-b  from-[#2A2A2A] to-[#191919] border border-gray-5  rounded-lg p-5">
        <h1 className="text-center mt-1.5 font-bold text-2xl text-gray-300">Welcome back</h1>
    
        <div className="mt-3.5 p-2 text-center">
            <span className="text-gray-300">Don't have an Account?</span><span onClick={()=>setLoginMethod("sign-up")} className="hover:underline cursor-pointer text-blue-200"> Sign up</span>
        </div>
        {error &&<div className="text-red-300 text-center">{error}</div>}
        <form onSubmit={handleSubmit(handleSignIn)} className="mt-1 w-[400px] flex flex-col text-gray-200 gap-2.5 p-2">
            <div className=" space-y-2 overflow-hidden rounded-md">
                <label htmlFor="email" className="text-sm text-gray-400 font-bold">Email</label>
                <div>

                <input {...register("email")} type="email"  id="email" className="w-full  hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-[#1b1b1b] duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-6 outline-none" />
                <p className="text-sm text-red-300">{errors?.email?.message}</p>
                </div>
                
            </div>
            <div className=" space-y-2 overflow-hidden rounded-md ">
                <div className="flex justify-between items-center gap-1">
                <label htmlFor="password" className="text-sm text-gray-400  font-bold">Password</label>
                <p onClick={()=>setLoginMethod("forgot-password")} className="text-sm hover:underline text-gray-200  cursor-pointer">Forgot Password</p>
                </div>
                <div>

                <input {...register("password")} type="password" id="password"  className="w-full  hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-[#1b1b1b] duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-6 outline-none" />
                <p className="text-sm text-red-300">{errors?.password?.message}</p>
                </div>
            </div>
            <div className="mt-2">
                <button disabled={loading === "sign-in"} className="bg-violet-500   hover:bg-violet-600/90 ease-in focus:scale-[0.95] cursor-pointer duration-200 text-indigo-100  w-full p-2 rounded-lg ">{loading === "sign-in" ? <Loader2 className="mx-auto animate-spin  text-gray-200" /> : "Sign In"}</button>
            </div>
        </form>
        <div className="relative w-[90%] mx-auto my-6">
            <div className="flex justify-between">

                <div className="h-[1px] bg-gradient-to-r w-[45%] from-gray-400 to-gray-500"></div>
                <div className="h-[1px] w-[45%] bg-gradient-to-r from-gray-400 to-gray-500"></div>
            </div>

            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2  px-3 text-gray-300">OR</p>
        </div>

      <OauthButtons />

    </div>
}