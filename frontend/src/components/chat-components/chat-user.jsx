

import { Check, CheckCheck, Image, ImageIcon, MoreVerticalIcon } from "lucide-react";
import Avatar from "../Avatar";
import { chatStore } from "@/store/chat-store";
import { formateTime } from "@/lib/formateTime";
import { messageStatus } from "@/lib/calculateStatus";
import { userStore } from "@/store/user-store";
import { useEffect, useMemo } from "react";

export default function ChatUser({ setChatSettings, chat }) {
    let getChatById = chatStore(s => s.getChatById)
    let selectedChat = chatStore(s => s.selectedChat)
    let participants = chatStore(s=>s.participants)
    let userData = chatStore(s => s.participants.get(chat.userId))
    let session = userStore(s => s.session)
    let typingIndicators = chatStore(s=>s.typingIndicators.get(chat.id))
    let setTypingUsersInfo = chatStore(s=>s.setTypingUsersInfo)
    const handleGetChat = async () => {
        await getChatById(chat.id, chat.userId)

    }
    let status = messageStatus(chat?.lastMessage?.status)
    let typingUsers = useMemo(()=>{
        let names = []
        let text = ""
        if (typingIndicators){

            for (let userId of [...typingIndicators].slice(0,3)){
                let p = participants.get(userId)
                names.push(p.name)
            }
            if (!names.length) return null
            if (names.length === 1){
                text =  `${names[0]} is typing...`
            }else if (names.length === 2){
                text= `${names[0]},${names[1]} are typing...`

            }else if (names.length === 3){
                text =  `${name[0]},${names[1]} and ${names[2]} are typing...`
            }else{
                text =  `Many people are typing...`
            }
        }
      
        return text

    },[typingIndicators])
    useEffect(()=>{
          if (chat.id === selectedChat?.id){

            setTypingUsersInfo(typingUsers)
        }
    },[typingUsers , selectedChat?.id , chat?.id])
    return (
        <div onClick={handleGetChat} className={`  relative  ${selectedChat?.id === chat?.id ? "ring-2 ring-indigo-500 bg-gray-600/10" : "ring hover:ring-indigo-500"}  flex px-2.5   group cursor-pointer duration-100 ring-gray-2 py-2 bg-[#00000094] rounded-lg items-center gap-2`}>
            <div onClick={(e) => { e.stopPropagation(), setChatSettings(prev => !prev) }} className="bg-gray-800/30 backdrop-blur-2xl invisible group-hover:visible   absolute -right-5 top-0 p-1.5 duration-100 group-hover:right-0 rounded-full  ">
                <MoreVerticalIcon size={12} className="text-purple-100" />
            </div>

            {/* <div className="absolute -top-1 right-0 rotate-45 p-1  bg-[#141414] rounded-full">
                    <PinIcon size={15} />
                    </div> */}
            <div className="relative shrink-0">

                <Avatar size={"size-10"} image={chat?.image || userData?.image} />
                {userData?.isOnline === 1 &&
                    <div className="size-2.5 border border-indigo-300 rounded-full bg-green-400 absolute right-0 bottom-0" />
                }

            </div>
            <div className="flex flex-col flex-1 min-w-0 ">
                <div className="flex  items-center justify-between">
                    <p className="font-medium text-gray-300/90 font-semibold text-md">{chat?.name || userData?.name}</p>
                    {(chat.lastMessage && !typingUsers) &&
                        <p className="text-gray-12 text-[0.7rem]">{formateTime(chat.lastMessage.createdAt)}</p>}
                </div>
                    
                {typingUsers ? <div className="animate-pulse text-[0.8rem] text-gray-400 font-bold  ">
                    {typingUsers}
                </div>
                : chat.lastMessage ?
                    <div className="flex items-center  justify-between">
                        <div className="flex items-center  min-w-[0] flex-1 gap-0.5">

                            {
                                chat?.lastMessage?.media?.length > 0 &&
                                <div className="text-gray-400">
                                    <ImageIcon size={15} />
                                </div>
                            }
                            <p className="text-[0.8rem] truncate ml-0.5   min-w-[0] flex-1 text-gray-400">{chat.lastMessage.content}</p>
                            {!chat.lastMessage.content &&
                                <span className="text-gray-300 text-[0.8rem]">{chat?.lastMessage?.media[0]?.type}</span>
                            }
                        </div>
                        {session.user.id === chat.lastMessage?.senderId &&
                            <div className="flex items-center gap-2">
                                {status === "sent" ? <Check size={14} className=" text-gray-400" /> : status === "delivered" ? <CheckCheck size={14} className=" text-gray-400" /> : status === "read" && <CheckCheck size={14} className=" text-green-400" />}
                            </div>
                        }

                    </div>
                    : <p className="text-sm text-gray-400 font-bold  ">{userData?.username}</p>
}
            </div>
            {chat.unread_messageCount > 0 &&
                <div className="text-sm px-1.5 text-indigo-100 text-[0.8rem] mr-2  absolute ring ring-indigo-800 right-2  rounded-full bg-indigo-800">
                    {chat.unread_messageCount}
                </div>
            }

        </div>
    )
}