"use client"


import Image from "next/image"
import Logo from "@/assets/logop.webp"
import { navigationStore } from "@/store/navigation-store"
import Avatar from "./Avatar"
import dynamic from "next/dynamic"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { userStore } from "@/store/user-store"
import OnlineStatus from "./OnlineStatus"
let UserProfile = dynamic(() => import("./User-Profile"),{ssr : false})
export const Sidebar = () => {
    const [openProfile, setOpenProfile] = useState(false)
    let selectedPage = navigationStore(s => s.selectedPage)
    let setSelectedPage = navigationStore(s => s.setSelectedPage)
    let session = userStore(s => s.session)
    let user = session?.user
    let handleOpenProfile = () => {
        setOpenProfile(true)
    }
 
    return (
        <>
            <AnimatePresence>

                {openProfile &&
                    <UserProfile setOpenProfile={setOpenProfile} />
                }
            </AnimatePresence>
            <div className="sidebar hidden  md:block  max-w-[60px] p-1 bg-black  w-full">
                <div className="h-full flex flex-col justify-between  items-center pb-2">

                    <div className="flex  flex-col gap-10 px-1 py-2">
                        <div onClick={() => setSelectedPage("main")} className={`${selectedPage === "main" ? "bg-indigo-200 ring-gray-700" : "bg-gray-700/50 hover:ring-indigo-400  ring-indigo-700"} p-2 size-11  ring cursor-pointer duration-200  rounded-full`}>

                            <Image src={Logo} alt="connectify-logo" className="bg-cover" width={100} height={100} />
                        </div>

                        <div className="flex relative flex-col items-center  w-full h-full ">
                            <div onClick={() => setSelectedPage("friends")} className={`rounded-xl ${selectedPage === "friends" ? "text-gray-50 bg-indigo-600" : "bg-gray-800/40 hover:bg-gray-800"}   cursor-pointer px-3 duration-200 py-2.5`}>

                                <i className="fas fa-user-friends text-sm " ></i>
                            </div>
                            {selectedPage === "friends" && (
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
                            )}
                        </div>
                    </div>
                   
                    <div onClick={handleOpenProfile} className="relative hover:ring-indigo-500 hover:ring-2 duration-100 cursor-pointer rounded-full">
                        <Avatar image={user?.image} />
                        <OnlineStatus isOnline={true}  />
                    </div>
                </div>
            </div>

        </>
    )
}