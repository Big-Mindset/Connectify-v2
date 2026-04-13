
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useLoading } from "@/lib/loading_hook"
import { signUp } from "@/zod/authValidations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Axios } from "@/lib/axiosInstance"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { authClient } from "@/lib/auth-client"
import { OauthButtons } from "@/components/oauth-buttons"

export default function SingUp({ setLoginMethod, setEmail }) {
    const [error, setError] = useState("")
    const { loading, setLoading } = useLoading()
    
    let { handleSubmit, formState: { errors }, register } = useForm({
        resolver: zodResolver(signUp),
        defaultValues: {
            email: "",
            password: "",
            name: ""
        },
    })
    const handleSignUp = async (data) => {
        setLoading("sign-up")
        await authClient.signUp.email({
            ...data
        }, {
            onError: (ctx) => {
                if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
                    toast.error(ctx.error.message)

                    setEmail(data.email)
                    setLoginMethod("verify-email")
                }else{

                    setError(ctx.error.message)
                }
            },
            onSuccess: (ctx) => {
                setError(null)
                toast.success("Account created")
                setLoginMethod("verify-email")

            }
        })
        setLoading(null)



    }
    const handleSocialLogin = async (provider)=>{
        await authClient.signIn.social({
            provider,
            callbackURL : "/",
        })
    }
    return <div className=" bg-gradient-to-b  from-[#2A2A2A] to-[#191919] shadow-[0.5px_-1px_5px_0.5px_gray]  rounded-lg p-2.5">
        <h1 className="text-center mt-1.5 font-bold text-2xl text-gray-300"> Sign Up</h1>
        <div className="flex gap-1 flex-col w-[100px] text-white mx-auto">

            <hr className="border " />
            <hr className="border " />
        </div>
        <div className="mt-3.5 p-2 text-center">
            <span className="text-gray-300">Already have an Account?</span><span onClick={() => setLoginMethod("sign-in")} className="hover:underline cursor-pointer text-blue-200"> Sign In</span>
        </div>
        <div className="text-red-300 text-center">{error}</div>

        <form onSubmit={handleSubmit(handleSignUp)} className="mt-1 w-[400px] flex flex-col gap-2.5 p-2">
            <div className=" space-y-2 overflow-hidden rounded-md ">
                <label htmlFor="name" className="text-sm text-gray-400 font-bold">Name</label>
                <input {...register("name")} type="text" placeholder="Enter your name" id="name" className="w-full hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-[#1b1b1b] duration-200  rounded-lg p-2 focus:border-border-accent border outline-none" />
            </div>
            <div className=" space-y-2 overflow-hidden rounded-md ">
                <label htmlFor="email" className="text-sm text-gray-400 font-bold">Email</label>
                <input {...register("email")} type="email" placeholder="Enter your email" id="email" className="w-full hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-[#1b1b1b] duration-200  rounded-lg p-2 focus:border-border-accent border outline-none" />
            </div>
            <div className=" space-y-2 overflow-hidden rounded-md ">
                <label htmlFor="password" className="text-sm text-gray-400  font-bold">Password</label>
                <input {...register("password")} type="password" id="password" placeholder="Enter your password" className="w-full placeholder:text-sm focus:bg-[#181818] hover:bg-[#181818] bg-[#1b1b1b] duration-200  rounded-lg p-2 focus:border-border-accent border outline-none" />
            </div>
            <div className="mt-2">
                <button disabled={loading === "sign-up"} className="bg-blue-500   hover:bg-violet-600/90 ease-in focus:scale-[0.95] cursor-pointer duration-200 text-indigo-100  w-full p-2 rounded-lg ">{loading === "sign-up" ? <Loader2 className="mx-auto animate-spin  text-gray-200" /> : "Sign Up"}</button>
            </div>
        </form>
        <div className="relative w-[90%] mx-auto my-6">
            <div className="flex justify-between">

                <div className="h-[1px] bg-gradient-to-r w-[45%] from-gray-400 to-gray-500"></div>
                <div className="h-[1px] w-[45%] bg-gradient-to-r from-gray-400 to-gray-500"></div>
            </div>

            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     px-3 text-gray-600">
                OR
            </p>
        </div>

            <OauthButtons />
      

    </div>
}