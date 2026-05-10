"use client"

import MainInput from "./chatWindow-componenets/main-input";
import Navbar from "./chatWindow-componenets/navbar";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { chatStore } from "@/store/chat-store";
let MediaShowcase = dynamic(() => import("./chatWindow-componenets/chat-message-components/media-showcase"))
import { socketStore } from "@/store/socket";
import { mediaStore } from "@/store/media-store";
import ConfirmMessageDeletion from "./chatWindow-componenets/confirm-messageDeletion";
import { messageSettingsStore } from "@/store/messageSettings-store";
import { AnimatePresence } from "framer-motion";
let ChatMessage = dynamic(() => import("./chatWindow-componenets/chat-message"))
export default function ChatWindow({ chatId }) {
    const setOpenMessageOptionId = messageSettingsStore(s=>s.setOpenMessageOptionId)
    const selectedChat = chatStore(state => state.selectedChat);
    const user = chatStore(s => s.participants.get(selectedChat.userId))
    const messages = chatStore(s => s.messages)
    const socket = socketStore(s => s.socket)
   const selectedMedia = mediaStore(s=>s.selectedMedia)
    const optionsRef = useRef(null)
    const plusRef = useRef(null)
    const handleMessageSent = messageSettingsStore(s => s.handleMessageSent)
    const MessagesContainerRef = useRef(null)
    const editingMessage = messageSettingsStore(s=>s.editingMessage)
    const deleteMessage = messageSettingsStore(s=>s.deleteMessage)
    useEffect(() => {
        const handleopenMessageOptionId = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target) && plusRef.current && !plusRef.current.contains(e.target)) {
                setOpenMessageOptionId(()=>null)
            }
        }
        window.addEventListener("mousedown", handleopenMessageOptionId)

        socket.on("message-sent", handleMessageSent)
        return () => {
            socket.off("message-sent", handleMessageSent)

            window.removeEventListener("mousedown", handleopenMessageOptionId)
        }
    }, [])

    useEffect(() => {
        if (editingMessage?.id) return
        let scrollHeight = MessagesContainerRef.current.scrollHeight
        MessagesContainerRef.current.scrollTo({
            top: scrollHeight,
        })
    }, [])
    return <div className="flex flex-col  bg-gray-3 h-dvh overflow-hidden  relative">


        {user &&
            <Navbar receiverInfo={user} />
        }
        <div className="flex-1 flex flex-col-reverse overflow-hidden">

            {selectedMedia &&
                <MediaShowcase mediaData={selectedMedia}  />
            }
            <AnimatePresence>
          {deleteMessage?.id && <ConfirmMessageDeletion />}
                </AnimatePresence>
            <div ref={MessagesContainerRef} className="main-content  overflow-y-scroll  min-h-0 flex flex-col gap-3 ">

                {messages?.map((message) => {
                    
                    return <ChatMessage plusRef={plusRef} key={message.id} message={message} optionsRef={optionsRef}   />
                })}
            </div>
        </div>
        <MainInput chatId={selectedChat.id} />
    </div>
}