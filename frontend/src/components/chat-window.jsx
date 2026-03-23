"use client"

import MainInput from "./opened-chat/main-input";
import Navbar from "./opened-chat/navbar";
import ChatMessage from "./opened-chat/chat-message";
import { useEffect, useRef, useState } from "react";
import { chatStore } from "@/store/chat-store";
import { authClient } from "@/lib/auth-client";
export default function ChatWindow({chatId}) {
    const [moreOptions, setMoreOptions] = useState(null)
    const messages = chatStore(state => state.chatInfo.messages);
    const participants = chatStore(state => state.chatInfo.participants);
    const session = authClient.useSession()
    const [receiverInfo, setReceiverInfo] = useState(null)




    const optionsRef = useRef(null)
    const plusRef = useRef(null)

    const MessagesContainerRef = useRef(null)
    useEffect(() => {
        console.log("in the useEffect")
        if (session && session.data) {
            let participant = participants.find(
                (participant) => participant.userId !== session?.data?.id
            )
            setReceiverInfo(participant.user)
        }
    }, [session, session.isPending])

    useEffect(()=>{
        const handleMoreOptions = (e)=>{
            console.log(plusRef , optionsRef)
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
    },[messages])

    return <div className="flex flex-col  bg-gray-3 h-dvh overflow-hidden  relative">

            <Navbar receiverInfo={receiverInfo} />
        

        <div ref={MessagesContainerRef} className="main-content overflow-y-scroll min-h-0 flex flex-col  flex-1">

            {messages.map((message) => {

                return <ChatMessage plusRef={plusRef} key={message.id} message={message} optionsRef={optionsRef} setMoreOptions={setMoreOptions} moreOptions={moreOptions} />
            })}
        </div>

        <MainInput userId={session.data?.user?.id} />
    </div>
}