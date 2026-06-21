"use client"

import MainInput from "./chatWindow-componenets/main-input";
import Navbar from "./chatWindow-componenets/navbar";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, } from "react";
import { chatStore } from "@/store/chat-store";
let MediaShowcase = dynamic(() => import("./chatWindow-componenets/chat-message-components/media-showcase"))
import { socketStore } from "@/store/socket";
import { mediaStore } from "@/store/media-store";
import ConfirmMessageDeletion from "./chatWindow-componenets/confirm-messageDeletion";
import { messageSettingsStore } from "@/store/messageSettings-store";
import { AnimatePresence } from "framer-motion";
import EmojiPicker from "./chatWindow-componenets/Emoji-Picker";
import { chatMessageStore } from "@/store/chatMessage-store";
import { useLoading } from "@/lib/loading_hook";
let ChatMessage = dynamic(() => import("./chatWindow-componenets/chat-message"))
export default function ChatWindow({ chatId }) {
    const setOpenMessageOptionId = messageSettingsStore(s => s.setOpenMessageOptionId)
    const selectedChat = chatStore(state => state.selectedChat);
    const user = chatStore(s => s.participants.get(selectedChat.userId))
    const messages = chatStore(s => s.messages)
    const socket = socketStore(s => s.socket)
    const LoadMoreMessage = chatStore(s=>s.LoadMoreMessage)
    const selectedMedia = mediaStore(s => s.selectedMedia)
    const optionsRef = useRef(null)
    const plusRef = useRef(null)
    const handleMessageSent = chatMessageStore(s => s.handleMessageSent)
    const MessagesContainerRef = useRef(null)
    const editingMessage = messageSettingsStore(s => s.editingMessage)
    const deleteMessage = messageSettingsStore(s => s.deleteMessage)
    const reactMessage = messageSettingsStore(s => s.reactMessage)
    const setReactMessage = messageSettingsStore(s => s.setReactMessage)
    
    const handleReceiveMessage = socketStore(s => s.handleReceiveMessage)
    const handleDeliverMessage = socketStore(s => s.handleDeliverMessage)
    const handleReadMessage = socketStore(s => s.handleReadMessage)
    const handleReactionUpdates = socketStore(s => s.handleReactionUpdates)

    let loadingRef = useRef(false)
    let fetchMore = useRef(true)
    let obserRef = useRef(null)

    useEffect(() => {
        if (!socket) return
        
        socket?.on("message-delivered", handleDeliverMessage)
        socket?.on("message-read", handleReadMessage)
        socket?.on("send-message", handleReceiveMessage)
        socket?.on("reaction-updates", handleReactionUpdates)

        return () => {

            socket?.off("reaction-updates", handleReactionUpdates)
            socket.off("message-read", handleReadMessage)
            socket?.off("message-delivered", handleDeliverMessage)
            socket?.off("send-message", handleReceiveMessage)


        }
    }, [socket])
    useEffect(() => {
        
        let prevScrollHeight;
        let observer = new IntersectionObserver(async (entries)=>{
            if (entries[0].isIntersecting && !loadingRef.current && fetchMore.current){
               prevScrollHeight = MessagesContainerRef.current.scrollHeight
                
                loadingRef.current = true   
                let hasMore = await LoadMoreMessage()
                console.log(hasMore)
                if (!hasMore){
                    fetchMore.current = false
                }
                loadingRef.current = false
            }
        },{root : MessagesContainerRef.current , rootMargin : "200px"})
        observer.observe(obserRef.current)
        if (editingMessage?.id) return
        let scrollHeight = MessagesContainerRef.current.scrollHeight
        
        MessagesContainerRef.current.scrollTo({
            top: scrollHeight - (prevScrollHeight || 0),
        })

        const handleopenMessageOptionId = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target) && plusRef.current && !plusRef.current.contains(e.target)) {
                setOpenMessageOptionId(() => null)
            }
        }
        window.addEventListener("mousedown", handleopenMessageOptionId)

        return () => {
            observer.disconnect()
            window.removeEventListener("mousedown", handleopenMessageOptionId)
        }
    }, [])
    useEffect(()=>{
        loadingRef.current = ""
        fetchMore.current = true
    },[chatId])
  


    return <div className="flex flex-col   bg-gray-2 h-dvh overflow-hidden  relative">

        {(reactMessage?.id) && <div onClick={() => setReactMessage(null)} className="fixed inset-0 bg-gray-200 z-[2000] opacity-0">
        </div>}
        {user &&
            <Navbar receiverInfo={user} />
        }




        <div className="flex-1 flex flex-col-reverse overflow-hidden">

            {selectedMedia &&
                <MediaShowcase mediaData={selectedMedia} />
            }
            <AnimatePresence>
                {deleteMessage?.id && <ConfirmMessageDeletion />}
            </AnimatePresence>
            <div ref={MessagesContainerRef} className="main-content  overflow-y-scroll  min-h-0 flex flex-1 flex-col-reverse gap-3 ">
                {messages?.map((message) => {
                    
                    return <ChatMessage plusRef={plusRef} key={message.id} message={message} optionsRef={optionsRef} />
                })}
                <div ref={obserRef} className="p-1"></div>
            </div>
        </div>
        <MainInput chatId={selectedChat.id} />
    </div>
}