"use client"

import MainInput from "./chatWindow-componenets/main-input";
import Navbar from "./chatWindow-componenets/navbar";
import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState, } from "react";
import { chatStore } from "@/store/Chat-store";
let MediaShowcase = dynamic(() => import("./chatWindow-componenets/chat-message-components/media-showcase"))
import { socketStore } from "@/store/socket";
import { mediaStore } from "@/store/media-store";
import ConfirmMessageDeletion from "./chatWindow-componenets/confirm-messageDeletion";
import { messageSettingsStore } from "@/store/messageSettings-store";
import { AnimatePresence } from "framer-motion";
import ScrollToPresent from "./chatWindow-componenets/ScrollToPresent";
import { userStore } from "@/store/user-store";
let ChatMessage = dynamic(() => import("./chatWindow-componenets/chat-message"))
export default function ChatWindow() {
    const setOpenMessageOptionId = messageSettingsStore(s => s.setOpenMessageOptionId)
    const selectedChat = chatStore(state => state.selectedChat);
    const messages = chatStore(s => s.messages)
    const socket = socketStore(s => s.socket)
    const LoadMoreMessage = chatStore(s => s.LoadMoreMessage)
    const selectedMedia = mediaStore(s => s.selectedMedia)
    const optionsRef = useRef(null)
    const plusRef = useRef(null)
    const MessagesContainerRef = useRef(null)
    const deleteMessage = messageSettingsStore(s => s.deleteMessage)
    const reactMessage = messageSettingsStore(s => s.reactMessage)
    const setReactMessage = messageSettingsStore(s => s.setReactMessage)
    const session = userStore(s=>s.session)
    const handleReceiveMessage = socketStore(s => s.handleReceiveMessage)
    const handleDeliverMessage = socketStore(s => s.handleDeliverMessage)
    const handleReadMessage = socketStore(s => s.handleReadMessage)
    const handleReactionUpdates = socketStore(s => s.handleReactionUpdates)
    const stopScroll = useRef(false)
    const scrollToPresent = useRef(null)
    const [scrollPresent, setScrollPresent] = useState(false)
    let OldloadingRef = useRef(false)
    let LatestloadingRef = useRef(false)
    let fetchLatest = useRef(false)
    let fetchOlder = useRef(true)
    let oldMessagesObserRef = useRef(null)
    let latestMessagesObserRef = useRef(null)

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
    useLayoutEffect(() => {
        stopScroll.current = false
        OldloadingRef.current = false
        LatestloadingRef.current = false
        fetchLatest.current = false
        fetchOlder.current = true
    
    }, [selectedChat?.id])
    useLayoutEffect(() => {
        let container = MessagesContainerRef.current
        let scrollHeight = container.scrollHeight
        let scrollTop = container.scrollTop
        let max_height = (scrollHeight - scrollTop) > 1200
        if (max_height && messages[messages.length - 1]?.senderId !== session.user.id){
            // stuff to do
            return
        }
        if (!container || (fetchLatest.current || stopScroll.current)) return
        container.scrollTo({
            top: container.scrollHeight
        })
    }, [messages])

    useEffect(() => {
        let container = MessagesContainerRef.current
        if (!container) return
        let observer = new IntersectionObserver(async (entries) => {
            entries.forEach(async (entry) => {

                if (entry.isIntersecting && entry.target === oldMessagesObserRef.current && fetchOlder.current && !OldloadingRef.current) {
                    OldloadingRef.current = true
                    if (fetchOlder.current) {
                        stopScroll.current = true
                        console.log("fetching old messages")
                        await LoadMoreMessage("desc", fetchLatest, fetchOlder)

                        OldloadingRef.current = false


                    }
                }
                else if (entry.isIntersecting && entry.target === latestMessagesObserRef.current && fetchLatest.current && !LatestloadingRef.current) {


                    LatestloadingRef.current = true
                    if (fetchLatest.current) {
                        stopScroll.current = true
                        await LoadMoreMessage("asc", fetchLatest, fetchOlder)
                        LatestloadingRef.current = false
                    }

                }
            })

        }, { root: MessagesContainerRef.current, rootMargin: "200px" })
        observer.observe(oldMessagesObserRef.current)
        observer.observe(latestMessagesObserRef.current)
        // if (editingMessage?.id) return


        const handleopenMessageOptionId = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target) && plusRef.current && !plusRef.current.contains(e.target)) {
                setOpenMessageOptionId(() => null)
            }
        }

        const handleScroll = (e) => {

            let scrollTop = e.target.scrollTop  
            let scrollHeight = e.target.scrollHeight
            let showButton = (scrollHeight - scrollTop) > 1800
            
            if (showButton !== scrollToPresent.current) {

                scrollToPresent.current = showButton
                setScrollPresent(showButton)
            }
        }

        

        window.addEventListener("mousedown", handleopenMessageOptionId)
        container.scrollTo({
            top: container.scrollHeight
        })
        container.addEventListener("scroll", handleScroll)

        return () => {
            
            observer.disconnect()
            window.removeEventListener("mousedown", handleopenMessageOptionId)
            container?.removeEventListener("scroll", handleScroll)


        }
    }, [selectedChat?.id])




    return <div className="flex flex-col   bg-gray-2 h-dvh overflow-hidden  relative">

        {(reactMessage?.id) && <div onClick={() => setReactMessage(null)} className="fixed inset-0 bg-gray-200 z-[2000] opacity-0">
        </div>}
        {selectedChat?.id &&
            <Navbar />
        }




        <div className="flex-1 flex flex-col  overflow-hidden">
            {scrollPresent && <ScrollToPresent fetchOlder={fetchOlder} stopScroll={stopScroll} fetchLatest={fetchLatest} containerRef={MessagesContainerRef} />}
            {selectedMedia &&
                <MediaShowcase mediaData={selectedMedia} />
            }
            <AnimatePresence>
                {deleteMessage?.id && <ConfirmMessageDeletion />}
            </AnimatePresence>
            <div ref={MessagesContainerRef} className="[&::-webkit-scrollbar]:w-1.5
            
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-zinc-700
            [&::-webkit-scrollbar-thumb]:rounded-full      relative      main-content  overflow-y-scroll scrollbar-thin   min-h-0 flex flex-1 flex-col justify-end gap-3 ">

                <div ref={oldMessagesObserRef} className="p-1"></div>
                {messages?.map((message) => {
                    
                    return <ChatMessage plusRef={plusRef} key={message.id} message={message} optionsRef={optionsRef} />
                })}
                <div ref={latestMessagesObserRef} className="p-1"></div>
                {/* <div className="bg-gradient-to-r from-red-400 to-red-300 text-center absolute bottom-0 left-0 right-0  font-bold text-gray-300 w-full ">new messages 1</div> */}
            </div>
        </div>
        <MainInput fetchLatest={fetchLatest} chatId={selectedChat.id} />
    </div>
}