"use client"

import { SendHorizonal, X } from "lucide-react";
import { motion } from "framer-motion"
import { Axios } from "@/lib/axiosInstance";
import toast from "react-hot-toast";
export default function Invite({ openInvite, setOpenInvite }) {
    const handleRequest = async (e) => {
        e.preventDefault()
        let value = e.target[0].value

        try {

            let res = await Axios.post(`/friendship/send-request`, {
                username: value
            })
            toast.success(res.data.message)
            e.target[0].value = ""

        } catch (error) {
            toast.error(error?.response?.data?.message || "Error sending friend request")
        }
    }
    return (
        <>
            {openInvite &&
                <div className={`absolute bg-black/20 inset-0 z-40`}></div>
            }
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="fixed bg-gray-1/60 z-50 left-1/2 w-full max-w-[500px] top-1/2 -translate-1/2">
                <div className={`w-full duration-200    ease-in-out p-4  ring ring-gray-4 rounded-lg`}>
                    <div className="flex w-full items-center justify-between">
                        <h1 className="font-bold text-xl">Add Friend</h1>
                        <div onClick={() => setOpenInvite(false)} className="rounded-full cursor-pointer duration-100  hover:bg-gray-5 p-1">

                            <X className="size-5" />
                        </div>
                    </div>
                    <div className="my-7">
                        <form onSubmit={handleRequest} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium" htmlFor="username">Username</label>
                                <input type="text" placeholder="Only username" className="outline-none placeholder:text-sm bg-gray-2   hover:bg-gray-5/40 focus:bg-gray-5/40  rounded-lg border border-blue-300/40 focus:border-cyan-600 p-2 " />
                            </div>
                            <button type="submit" className="p-2 bg-cyan-600 w-full flex item-center justify-center mx-auto  gap-3 hover:bg-cyan-500  duration-200 cursor-pointer  rounded-lg ">
                                <p className="">Send Request</p>
                                <SendHorizonal size={20} />
                            </button>
                        </form>
                    </div>

                </div>
            </motion.div>
        </>
    )
}