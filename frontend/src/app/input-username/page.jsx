              "use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader, X } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameValidation } from "@/zod/authValidations";
import { Axios } from "@/lib/axiosInstance";
import { useLoading } from "@/lib/loading_hook";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ChooseUsernamePage() {
    const [userExist, setUserExist] = useState(false)
    let {data , isPending } = authClient.useSession()
   
    let {loading , setLoading} = useLoading()
    let { register, watch, reset, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(usernameValidation),
        defaultValues: {
            username: ""
        }
    })
    let router = useRouter()
    
    let usernameRef = useRef(null)
    const onSubmit = async (data) => {
        setLoading("username-submit")
        await authClient.updateUser({
        username : data.username
    },{onSuccess : ()=>router.push("/")})
        setLoading("")
    };
    let username = watch("username")

    useEffect(() => {
        if (!username.trim()) return
        clearTimeout(usernameRef.current)
        setLoading("username")
        usernameRef.current = setTimeout(async () => {
            setLoading(null)

            let user = await Axios.get(`/user/user-exist?username=${username}`)

            setUserExist(!!user.data.userId)
        }, 400)
        return () => {
            clearTimeout(usernameRef.current)
        }
    }, [username])
    useEffect(()=>{
        if (!isPending && !data) {
            router.push("/login")
            return 
        }
        if (data?.user?.username){
            router.push("/")
        }
    },[isPending])

    return (
        <div className="h-dvh w-full bg-slate-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-md rounded-3xl border border-indigo-500/20 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl"
            >
                <div className="mb-6">


                    <h1 className="text-2xl font-semibold text-white">
                        Choose your username
                    </h1>

                    <p className="mt-2 text-sm text-slate-400 leading-6">
                        You must set a username before continuing. This is required to use the platform.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Username
                        </label>
                        <div className="flex items-center justify-between gap-2">

                            <input
                                {...register("username")}
                                id="username"
                                placeholder="Enter username"
                                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                            />

                            {(username.length &&  !errors?.username) > 0 && <div>

                                {loading === "username" ? <div>
                                    <Loader className="text-white" />
                                </div> : <div>
                                    {userExist ? <div>
                                        <div className="p-1 bg-red-600 rounded-full">

                                            <X className="text-red-300 size-[1rem]" />
                                        </div>
                                    </div> : <div className="p-1 border border-indigo-500 bg-indigo-300 rounded-full">

                                        <Check className="text-gray-700 size-[1rem]" />
                                    </div>
                                    }

                                </div>}
                            </div>
                            }
                        </div>
                        {errors.username ? <div className="text-sm ml-1  text-red-200">
                            {errors.username.message}
                        </div> :
                            <div
                                className={`transition-all duration-500 overflow-hidden ${(username === "") ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="text-sm ml-1 text-gray-400">
                                    Please use letters, underscores_ and periods.
                                </div>
                            </div>
                        }

                    </div>

                    <button
                        disabled={loading === "usernmae-submit"}
                        type="submit"
                        className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/30"
                    >
                        {loading === "username-submit" ? <Loader className="animate-spin text-gray-300 " /> : "Continue"}
                        
                    </button>
                </form>
            </motion.div>
        </div>
    );
}