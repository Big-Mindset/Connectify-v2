
import { useForm } from "react-hook-form"
import { useEffect, useRef, useState } from "react"
import { useLoading } from "@/lib/loading_hook"
import { signUp } from "@/zod/authValidations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Axios } from "@/lib/axiosInstance"
import {  Check, Loader, Loader2, X } from "lucide-react"
import toast from "react-hot-toast"
import { OauthButtons } from "@/components/oauth-buttons"

export default function SingUp({ setLoginMethod, setEmail }) {
    const [error, setError] = useState("")
    const { loading, setLoading } = useLoading()
    const [userExist, setUserExist] = useState(null)
    const [selectedInput, setSelectedInput] = useState(null)
    const [passwordType, setPasswordType] = useState("password")
    let usernameRef = useRef(null)
    let { handleSubmit, formState: { errors }, register, watch } = useForm({
        resolver: zodResolver(signUp),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            username: ""
        },
    })
    let [displayName, username, password] = watch(["name", "username", "password"])
    username = username.trim()

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

    const handleSignUp = async (data) => {
        try {
            setLoading("sign-up")
        if (userExist) {
            setError("username must be unique")
            return
        }


            let res = await Axios.post("/user/sign-up", data)
            if (res.status === 409) {
                setError(res.data.message)
            } else if (res.status === 201 || res.data?.error === "EMAIL_NOT_VERIFIED"){
                setEmail(data.email)
                setLoginMethod("verify-email")
            }


        } catch (error) {
            toast.error(error?.response?.data?.message || error?.messasge)
        }finally{
                setLoading(null)

        }

    }

    return <div className=" bg-gradient-to-b  from-[#2A2A2A] to-[#191919] border-2 border-gray-4  rounded-lg p-5">
        <h1 className="text-center mt-1.5 font-bold text-2xl text-gray-300"> Create a account</h1>

        <div className="mt-3.5 p-2 text-center">
            <span className="text-gray-300">Already have an Account?</span><span onClick={() => setLoginMethod("sign-in")} className="hover:underline cursor-pointer text-blue-200"> Sign In</span>
        </div>

        <div className="text-red-300 text-center">{error}</div>

        <form onSubmit={handleSubmit(handleSignUp)} className="mt-1 w-[400px]   text-gray-200 flex flex-col gap-2.5 p-2">
            <div className="duration-500 transition-all overflow-hidden rounded-md ">
                <label htmlFor="name" className="text-sm text-gray-400 font-bold">DisplayName</label>
                <input onFocus={() => setSelectedInput("name")}  {...register("name", { onBlur: () => setSelectedInput(null) })} type="text" id="name" className="w-full  hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-gray-2 duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-5 outline-none" />
                {errors.name ? <div className="text-sm ml-1 text-red-200">
                    {errors.name.message}
                </div> :
                    <div
                        className={`transition-all duration-500 overflow-hidden ${(selectedInput === "name" && displayName === "") ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
                            }`}
                    >
                        <div className="text-sm ml-1 text-gray-400">
                            This is how others see you.
                        </div>
                    </div>}

            </div>

            <div className=" overflow-hidden rounded-md ">
                <label htmlFor="email" className="text-sm text-gray-400 font-bold">Email</label>
                <input  {...register("email")} type="email" id="email" className="w-full hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-gray-2 duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-5 outline-none" />

            </div>
            <div className=" duration-200 transition-all overflow-hidden rounded-md ">
                <label htmlFor="username" className="text-sm text-gray-400 font-bold">Username</label>
                <div className="relative">

                    <input onFocus={() => setSelectedInput("username")} onBlur={() => setSelectedInput(null)} value={username} {...register("username", { onBlur: () => setSelectedInput(null) })} type="text" id="name" className="w-full  hover:bg-[#181818] focus:bg-[#181818] placeholder:text-sm bg-gray-2 duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-5 outline-none" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2  ">
                        {username.length > 0 && <div>

                            {loading === "username" ? <div>
                                <Loader className="" />
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
                </div>
                {errors.username ? <div className="text-sm ml-1  text-red-200">
                    {errors.username.message}
                </div> :
                    <div
                        className={`transition-all duration-500 overflow-hidden ${(selectedInput === "username" && username === "") ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
                            }`}
                    >
                        <div className="text-sm ml-1 text-gray-400">
                            Please use letters, underscores_ and periods.
                        </div>
                    </div>
                }

            </div>
            <div className=" duration-200 transition-all overflow-hidden rounded-md ">
                <label htmlFor="password" className="text-sm text-gray-400  font-bold">Password</label>
                <div>
                    <input onFocus={() => setSelectedInput("password")} onBlur={() => setSelectedInput(null)} {...register("password", { onBlur: () => setSelectedInput(null) })} type={passwordType} id="password" className="w-full placeholder:text-sm focus:bg-[#181818] hover:bg-[#181818] bg-gray-2 duration-200  rounded-lg p-2 focus:border-indigo-500 border-2 border-gray-5 outline-none" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">

                    </div>
                </div>
                {errors.password ? <div className="text-sm ml-1 text-red-200">
                    {errors.password.message}
                </div> :

                    <div
                        className={`transition-all duration-500 overflow-hidden ${(selectedInput === "password" && password === "") ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
                            }`}
                    >
                        <div className="text-sm ml-1 text-gray-400">
                            Choose a strong password.
                        </div>
                    </div>
                }
            </div>
            <div className="mt-2">
                <button disabled={loading === "sign-up"} className="bg-violet-500   hover:bg-violet-600/90 ease-in focus:scale-[0.95] cursor-pointer duration-200 text-indigo-100  w-full p-2 rounded-lg ">{loading === "sign-up" ? <Loader2 className="mx-auto animate-spin  text-gray-200" /> : "Sign Up"}</button>
            </div>
        </form>
        <div className="relative w-[90%] mx-auto my-6">
            <div className="flex justify-between">

                <div className="h-[1px] bg-gradient-to-r w-[45%] from-gray-400 to-gray-500"></div>
                <div className="h-[1px] w-[45%] bg-gradient-to-r from-gray-400 to-gray-500"></div>
            </div>

            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     px-3 text-gray-300">
                OR
            </p>
        </div>

        <OauthButtons />


    </div>
}