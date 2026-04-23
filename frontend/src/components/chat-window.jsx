"use client"

import MainInput from "./opened-chat/main-input";
import Navbar from "./opened-chat/navbar";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { chatStore } from "@/store/chat-store";
import { authClient } from "@/lib/auth-client";
let ChatMessage = dynamic(()=>import("./opened-chat/chat-message"))
export default function ChatWindow({chatId}) {
    const [moreOptions, setMoreOptions] = useState(null)
    const chat = chatStore(state => state.selectedChat);
    // const participants = chatStore(state => state.);
    const session = authClient.useSession()




    const optionsRef = useRef(null)
    const plusRef = useRef(null)

    const MessagesContainerRef = useRef(null)

    useEffect(()=>{
        const handleMoreOptions = (e)=>{
            if (optionsRef.current && !optionsRef.current.contains(e.target) && plusRef.current && !plusRef.current.contains(e.target)){
                setMoreOptions(null)
            }
        }
        window.addEventListener("mousedown",handleMoreOptions)
        return ()=>{

            window.removeEventListener("mousedown",handleMoreOptions)
        }
    },[])

    useEffect(()=>{
        let scrollHeight = MessagesContainerRef.current.scrollHeight
        MessagesContainerRef.current.scrollTo({
            top :scrollHeight,
        })
    },[chat.messages])

    return <div className="flex flex-col  bg-gray-3 h-dvh overflow-hidden  relative">

            <Navbar receiverInfo={chat.user} />
        

        <div ref={MessagesContainerRef} className="main-content overflow-y-scroll min-h-0 flex flex-col  flex-1">

            {chat?.messages?.map((message) => {

                return <ChatMessage  plusRef={plusRef} key={message.id} message={message} optionsRef={optionsRef} setMoreOptions={setMoreOptions} moreOptions={moreOptions} />
            })}
        </div>
        <MainInput user={session.data?.user} chatId={chat.id} />
    </div>
}