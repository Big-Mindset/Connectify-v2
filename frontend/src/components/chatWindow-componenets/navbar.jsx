"use client"

import { BellOff,  Camera, ChevronDown, DoorClosed, EllipsisVerticalIcon, Flag, PhoneCall, Search, Text, Timer, Trash, Trash2, UserX } from "lucide-react";
import Avatar from "../Avatar";
import { useEffect, useRef, useState } from "react";
import OptionButton from "../option-button";
import MuteNotifications from "./navbar-components/mute-notifications";
import DisappearingMessages from "./navbar-components/disappearing-messages";
import { formateTime } from "@/lib/formateTime";
import { AnimatePresence , motion } from "framer-motion";
import { socketStore } from "@/store/socket";

export default function Navbar({receiverInfo}) {
    const [calltype, setCallType] = useState(false)
    const callRef = useRef()
    const [navOptions, setNavOptions] = useState(false)
    const [muteNotifications, setOpenMuteNotifications] = useState(false)
    const [disappearingMessageComp, setDisappearingMessageComp] = useState(false)
    const chatSettingRef = useRef(null)
    const audioCall = socketStore(s=>s.audioCall)
    useEffect(() => {
        let handleCallMenu = (e) => {
            if (callRef.current && !callRef.current.contains(e.target)) {
                setCallType(false)
            }
            if (chatSettingRef.current && !chatSettingRef.current.contains(e.target)) {
                setNavOptions(false)
            }
        }
        window.addEventListener("mousedown", handleCallMenu)
        return () => { window.removeEventListener("mosedown", handleCallMenu) }
    }, [])
    let chatOptions = [
        { text: "Close Chat", icon: <DoorClosed size={16} /> },
        { text: "Mute Notifications", icon: <BellOff size={16} /> },
        { text: "Disappearing Message", icon: <Timer size={16} /> },
        { text: "Clear Chat", icon: <Trash2 size={16} />, red: true },
        { text: "Delete Chat", icon: <Trash size={16} />, red: true },
        { text: "Report", icon: <Flag size={16} />, red: true },
        { text: "Block", icon: <UserX size={16} />, red: true }
    ];

    const handleChanges = (param) => {
        if (param === "Mute Notifications") {
            setOpenMuteNotifications(true)
        } else if (param === "Disappearing Message") {
            setDisappearingMessageComp(true)
        }
    }
    let online = true
    let handleAudioCall = async ()=>{
   
        audioCall(["FF17kgjOehECrwnXtVe8j1sRWxY5FR8V"])
    }
    return (
        <>
            <div className="relative shrink-0 z-50 bg-gray-1 border-b border-gray-6 ">
                <div className="py-2 px-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Avatar image={receiverInfo.image}  size={"size-12"} />
                            <div className="">
                                <p className="font-bold text-[0.96rem]">{receiverInfo?.name}</p>
                                <p className=" text-[0.8rem] text-gray-300 text-sm ">{receiverInfo.isOnline ? <span className="text-[0.7rem] uppercase font-bold tracking-wider">online</span> : formateTime(receiverInfo?.lastseen)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="relative">

                                <div className="border flex    cursor-pointer rounded-full   overflow-hidden duration-200  border-indigo-400">

                                    <div onClick={()=>handleAudioCall()} className="px-3.5 text-sm py-0.5 gap-1.5 duration-150 flex items-center hover:bg-indigo-600">
                                        <span>Audio Call</span>
                                        <PhoneCall size={15} />
                                    </div>

                                    <div ref={callRef} onClick={() => setCallType(prev => !prev)} className="h-[40px]  px-1.5 flex justify-center items-center hover:bg-indigo-700/90 border-indigo-400 border-l ">

                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                <div className={`absolute duration-200 ${calltype ? "-bottom-10 opacity-100" : "-bottom-0 scale-0 opacity-0"}  right-0 left-0 `}>

                                    <div  className="px-3.5 rounded-lg bg-indigo-500/50 cursor-pointer gap-2 text-sm py-2  duration-150 flex items-center justify-between hover:bg-indigo-600">
                                        <span>Video Call</span>
                                        <Camera size={15} />
                                    </div>
                                </div>

                            </div>
                            <div className="p-2.5 cursor-pointer hover:bg-gray-5 duration-100 rounded-full">
                                <Search size={15} />
                            </div>
                            <div ref={chatSettingRef} onClick={() => setNavOptions(prev => !prev)} className="relative p-2 duration-150 rounded-full hover:bg-gray-5 cursor-pointer">
                                <EllipsisVerticalIcon size={15} />
                                <AnimatePresence>

                            {navOptions &&
                                <motion.div
                                initial={{scale : 0.4 , opacity : 0}}
                                exit={{scale : 0.6 , opacity : 0}}
                                animate={{scale : 1 , opacity :  1}}
                                transition={{duration : 0.1}}
                                className={`absolute right-3  top-full mt-2 
                                    origin-top-right  z-50
                                    w-[220px] flex flex-col gap-2.5 p-2 rounded-lg 
                                    bg-gray-1 border border-gray-4 `}
                                    >

                                    {chatOptions.map((data) => {
                                        return (
                                            <div onClick={() => handleChanges(data.text)} key={data.text}>

                                                <OptionButton red={data.red} key={data.text} icon={data.icon} text={data.text} />
                                            </div>
                                        )
                                    })}
                                </motion.div>
                                }
                                    </AnimatePresence>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MuteNotifications setOpenMuteNotifcations={setOpenMuteNotifications} openMuteNotifications={muteNotifications} />
            <DisappearingMessages setDisappearingMessageComp={setDisappearingMessageComp} disappearingMessageComp={disappearingMessageComp} />

        </>
    )
}