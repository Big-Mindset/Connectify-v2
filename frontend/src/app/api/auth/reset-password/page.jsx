"use client"


import { zodResolver } from "@hookform/resolvers/zod"
import { resetPassword, signIn } from "@/zod/authValidations"
import { useState } from "react"
import { useLoading } from "@/lib/loading_hook"
import { Eye, EyeClosed, Loader2 } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { authClient } from "@/lib/auth-client"

export default function ResetPassword() {
    let searchParams = useSearchParams()
    let token = searchParams.get("token")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
    })
    const { loading, setLoading } = useLoading()
    let router = useRouter()
    let { handleSubmit, formState: { errors }, register } = useForm({
        resolver: zodResolver(resetPassword),
        defaultValues: {
            password: "",
            confirmPassword: ""
        },
    })
    const handleResetPassword = async (data) => {
        setLoading("reset-password")
        await authClient.resetPassword({
            token ,
            newPassword : data.password,
        },{
            onError : (ctx)=>{
                console.log(ctx)
                setError(ctx.error.message)
            },
            onSuccess : (ctx)=>{
                router.push("/login")
            }
        })
        setLoading(null)


    }
    return <div className="flex justify-center text-gray-200 items-center h-full">

        <div className="   mx-auto  bg-gray-2 border border-gray-3  rounded-lg p-2.5">
            <h1 className="text-center mt-1.5 font-bold text-2xl text-gray-300">Reset Password</h1>
          

            {error && <div className="text-red-300 text-center">{error}</div>}
            <form onSubmit={handleSubmit(handleResetPassword)} className="mt-1 w-[400px] flex flex-col gap-2.5 p-2">
                <div className=" space-y-2  rounded-md ">
                    <label htmlFor="password" className="text-sm text-gray-400 font-bold">Password</label>
                    <div>
                        <div className="relative " >

                            <input {...register("password")} type={showPassword.password ? "text" :"password"} placeholder="Enter new Password" id="password" className="w-full  placeholder:text-sm bg-[#1b1b1b] duration-200 rounded-lg p-2  bg-gray-4 outline-none ring-indigo-400 focus:ring-2" />
                            <div className="absolute cursor-pointer  right-0 -translate-1/2  top-1/2 " onClick={() => setShowPassword(prev => ({ ...prev, password: !prev.password }))}>

                                {showPassword.password ? <EyeClosed size={16} /> : <Eye size={16} />}
                            </div>
                        </div>
                        <p className="text-sm text-red-300">{errors?.password?.message}</p>
                    </div>

                </div>
                <div className=" space-y-2  rounded-md ">
                    <div className="flex justify-between items-center gap-1">
                        <label htmlFor="confirm-password" className="text-sm text-gray-400  font-bold">Confirm Password</label>
                    </div>
                    <div>
                        <div className="relative">

                            <input {...register("confirmPassword")} type={showPassword.confirmPassword ? "text" :"password"} id="confirmPassword" placeholder="Confirm the password" className="w-full placeholder:text-sm bg-[#1b1b1b] duration-200  bg-gray-4 rounded-lg p-2 outline-none ring-indigo-400 focus:ring-2" />
                            <div className="absolute text-gray-400  cursor-pointer right-0 -translate-1/2  top-1/2 " onClick={() => setShowPassword(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}>

                                {showPassword.confirmPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                            </div>
                        </div>
                        <p className="text-sm text-red-300">{errors?.confirmPassword?.message}</p>

                    </div>
                </div>
                <div className="mt-2">
                    <button disabled={loading === "reset-password"} className="bg-blue-500  hover:ring-2 ring-blue-300  focus:scale-[0.95] cursor-pointer  text-indigo-100  w-full p-2 rounded-lg ">{loading === "reset-password" ? <Loader2 className="mx-auto animate-spin  text-gray-200" /> : "Reset"}</button>
                </div>
            </form>



        </div>
    </div>
}