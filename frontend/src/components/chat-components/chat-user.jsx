

import { CheckCheck, MoreVerticalIcon, PinIcon } from "lucide-react";
import ChatSettings from "./chat-settings";
import Avatar from "../Avatar";
import { chatStore } from "@/store/chat-store";
import { socketStore } from "@/store/socket";
import { useEffect, useState } from "react";

export default function ChatUser({setChatSettings , chat  }) {
    let getChatById = chatStore(s=>s.getChatById)
    let selectedChat = chatStore(s=>s.selectedChat)
    let userData = chatStore(s=>s.participants.get(chat.userId))
    const handleGetChat = async ()=>{
        if (chat.id === selectedChat?.id) return
        await getChatById(chat.id , chat.userId)
        
    }
    return (
            <div onClick={handleGetChat} className={`  relative  ${selectedChat?.id === chat?.id ? "ring-2 ring-indigo-500 bg-gray-600/10" : "ring hover:ring-indigo-500"}  overflow-hidden flex px-2.5   group cursor-pointer duration-100 ring-gray-2 py-2 bg-[#00000094] rounded-lg items-center gap-2`}>
                <div onClick={(e) => {e.stopPropagation(),setChatSettings(prev=>!prev)}} className="bg-gray-800/30 backdrop-blur-2xl invisible group-hover:visible   absolute -right-5 top-0 p-1.5 duration-100 group-hover:right-0 rounded-full  ">
                    <MoreVerticalIcon size={12} className="text-purple-100" />
                </div>

                {/* <div className="absolute -top-1 right-0 rotate-45 p-1  bg-[#141414] rounded-full">
                    <PinIcon size={15} />
                    </div> */}
                    <div className="relative">

                <Avatar size={"size-10"} image={chat?.image || userData?.image} />
                {userData?.isOnline &&
                        <div className="size-2.5 border border-indigo-300 rounded-full bg-green-400 absolute right-0 bottom-0" /> 
                    }

                    </div>
                <div className="flex flex-col  w-full">
                    <div className="flex  items-center justify-between">
                        <p className="font-medium text-gray-300 font-semibold text-md">{chat?.name || userData?.name}</p>
                        {chat.lastMessage &&
                        <p className="text-gray-12 text-[0.7rem]">{chat.lastMessage.createdAt}</p>}
                    </div>
                    {chat.lastMessage ?
                    <div className="flex items-center justify-between">
                        <p className="text-[0.8rem] text-gray-300">{chat.lastMessage.content}</p>
                        <div className="flex items-center gap-2">
                            <CheckCheck size={19} className="text-blue-300" />

                        </div>

                    </div>
                  : <p className="text-sm text-gray-400 font-bold  ">{userData?.username}</p>}
                </div>
                {chat.unread_messageCount > 0 &&
                <div className="text-sm px-1.5 text-indigo-100 text-[0.8rem] mr-2  absolute ring ring-indigo-800 right-2  rounded-full bg-indigo-800">
                        {chat.unread_messageCount}
                </div>
                }
            
            </div>
    )
}