"use client"

import MainInput from "./chatWindow-componenets/main-input";
import Navbar from "./chatWindow-componenets/navbar";
import dynamic from "next/dynamic";
import { use, useEffect, useLayoutEffect, useRef, useState, } from "react";
import { chatStore } from "@/store/Chat-store";
let MediaShowcase = dynamic(() => import("./chatWindow-componenets/chat-message-components/media-showcase"))
import { socketStore } from "@/store/socket";
import { mediaStore } from "@/store/media-store";
import ConfirmMessageDeletion from "./chatWindow-componenets/confirm-messageDeletion";
import { messageSettingsStore } from "@/store/messageSettings-store";
import { AnimatePresence } from "framer-motion";
import ScrollToPresent from "./chatWindow-componenets/ScrollToPresent";
import { userStore } from "@/store/user-store";
import ChatPlaceholder from "./chat-placeholder";
import { navigationStore } from "@/store/navigation-store";
import { SearchMessageTab } from "./chatWindow-componenets/chat-message-components/search-messagesTab";
let ChatMessage = dynamic(() => import("./chatWindow-componenets/chat-message"))
export default function ChatWindow() {
    const setOpenMessageOptionId = messageSettingsStore(s => s.setOpenMessageOptionId)
    const messages = chatStore(s => s.messages)
    const setMessages = chatStore(s => s.setMessages)
    const socket = socketStore(s => s.socket)
    const LoadMoreMessage = chatStore(s => s.LoadMoreMessage)
    const selectedMedia = mediaStore(s => s.selectedMedia)
    const optionsRef = useRef(null)
    const plusRef = useRef(null)
    const MessagesContainerRef = useRef(null)
    const deleteMessage = messageSettingsStore(s => s.deleteMessage)
    const reactMessage = messageSettingsStore(s => s.reactMessage)
    const setReactMessage = messageSettingsStore(s => s.setReactMessage)
    const session = userStore(s => s.session)
    const handleReceiveMessage = socketStore(s => s.handleReceiveMessage)
    const handleDeliverMessage = socketStore(s => s.handleDeliverMessage)
    const handleReadMessage = socketStore(s => s.handleReadMessage)
    const handleReactionUpdates = socketStore(s => s.handleReactionUpdates)
    const jumpingToMessageId = chatStore(s => s.jumpingToMessageId)
    const setJumpingToMessageId = chatStore(s => s.setJumpingToMessageId)
    const stopScroll = useRef(false)
    const scrollToPresent = useRef(null)
    const [scrollPresent, setScrollPresent] = useState(false)
    const [unseenMessagesLen, setUnseenMessagesLen] = useState(0)
    const OldloadingRef = useRef(false)
    const LatestloadingRef = useRef(false)
    const fetchLatest = useRef(false)
    const fetchOlder = useRef(true)
    const oldMessagesObserRef = useRef(null)
    const latestMessagesObserRef = useRef(null)
    const messagesRef = useRef({})
    const selectedChat = chatStore(s => s.selectedChat)
    const animationTimeout = useRef(null)
    const loading = chatStore(s => s.loading)
    const isInitialized = useRef(true)
    const searchTab = navigationStore(s => s.searchTab)
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
        isInitialized.current = true
    }, [selectedChat?.id])

    useLayoutEffect(() => {
        console.log("running")
        let container = MessagesContainerRef.current
        if (!container) return
        let scrollHeight = container.scrollHeight
        let scrollTop = container.scrollTop
        if (isInitialized.current) {
            console.log("updating the height")
            console.log(container.scrollTop, container.scrollHeight)
            container.scrollTop = container.scrollHeight;
            if (messages.length) isInitialized.current = false

            return
        }
        console.log(stopScroll.current)
        if (stopScroll.current) return
        container.scrollTop = container.scrollHeight;

    }, [messages?.length])

    useEffect(() => {
        if (!jumpingToMessageId) return
        fetchLatest.current = true
        fetchOlder.current = true
        stopScroll.current = true
        clearTimeout(animationTimeout.current)
        let selectedMessage = messagesRef.current[jumpingToMessageId]
        if (!selectedMessage) return
        selectedMessage?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        })
        let childDiv = selectedMessage.querySelector(".message-pointer")
        if (!childDiv) return
        childDiv.classList.remove("invisible")
        childDiv.classList.add("visible", "animate-pulse")
        animationTimeout.current = setTimeout(() => {

            childDiv.classList.remove("animate-pulse", "visible")
            childDiv.classList.add("invisible")

            setJumpingToMessageId(null)
        }, 1500);

        return () => {
            clearTimeout(animationTimeout.current)
            childDiv.classList.remove("animate-pulse", "visible")
            childDiv.classList.add("invisible")
            animationTimeout.current = null
        }
    }, [jumpingToMessageId])

    useEffect(() => {
        let container = MessagesContainerRef.current
        if (!container) return
        const type = "chat-messages"
        let observer = new IntersectionObserver(async (entries) => {
            entries.forEach(async (entry) => {

                if (entry.isIntersecting && entry.target === oldMessagesObserRef.current && fetchOlder.current && !OldloadingRef.current) {

                    if (fetchOlder?.current) {
                        OldloadingRef.current = true
                        const order = "desc"
                        let fetchedMessages = await LoadMoreMessage(type, order)
                        handleFetchedMessages(fetchedMessages, order)




                    }
                    OldloadingRef.current = false
                }
                else if (entry.isIntersecting && entry.target === latestMessagesObserRef.current && fetchLatest.current && !LatestloadingRef.current) {



                    if (fetchLatest.current) {
                        LatestloadingRef.current = true
                        let order = "asc"
                        let fetchedMessages = await LoadMoreMessage(type, order)
                        handleFetchedMessages(fetchedMessages, order)
                    }
                    LatestloadingRef.current = false

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
            let awayFromBottom = (scrollHeight - scrollTop) > 2000

            if (awayFromBottom) {
                stopScroll.current = true
            } else if (!awayFromBottom && !fetchLatest.current) {
                stopScroll.current = false

            }
            if (fetchLatest.current) {
                scrollToPresent.current = true
                setScrollPresent(true)
                return
            }
            if (awayFromBottom !== scrollToPresent.current) {
                scrollToPresent.current = awayFromBottom
                setScrollPresent(awayFromBottom)
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

    const handleFetchedMessages = (fetchedMessages, order) => {
        let MESSAGE_WINDOW = 60
        if (!fetchedMessages?.length) {
            if (order === "desc") {
                fetchOlder.current = false
            } else {
                fetchLatest.current = false

            }
            return
        }

        if (order === "desc") {

            setMessages(prev => {
                fetchedMessages.reverse()
                let merged = [...fetchedMessages, ...prev]
                if (merged.length > MESSAGE_WINDOW) {
                    merged = merged.slice(0, MESSAGE_WINDOW)
                    fetchLatest.current = true
                }
                return merged
            })
        }
        else {
            if (fetchedMessages.length < 31) {
                fetchLatest.current = false
            }
            setMessages(prev => {
                let merged = [...prev, ...fetchedMessages.slice(0, prev.length - 1)]

                if (merged.length > MESSAGE_WINDOW) {
                    merged = merged.slice(merged.length - MESSAGE_WINDOW)
                    fetchOlder.current = true

                }
                return merged
            })
        }
    }


    if (!selectedChat?.id) {
        return <ChatPlaceholder />
    }
    return <div className="flex h-full  min-h-0">

        <div className="flex flex-col flex-1 bg-gray-2 h-dvh overflow-hidden  relative">

            {(reactMessage?.id) && <div onClick={() => setReactMessage(null)} className="fixed inset-0 bg-gray-200 z-[2000] opacity-0">
            </div>}
            {selectedChat?.id &&
                <Navbar />
            }




            <div ref={MessagesContainerRef} className="min-h-0 h-full overflow-y-auto [&::-webkit-scrollbar]:w-1.5
            
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-zinc-700
            [&::-webkit-scrollbar-thumb]:rounded-full">
                {loading && "Loading Messages wait a moment"}
                {scrollPresent && <ScrollToPresent fetchOlder={fetchOlder} stopScroll={stopScroll} fetchLatest={fetchLatest} containerRef={MessagesContainerRef} />}
                {selectedMedia &&
                    <MediaShowcase mediaData={selectedMedia} />
                }
                <AnimatePresence>
                    {deleteMessage?.id && <ConfirmMessageDeletion />}
                </AnimatePresence>
                <div className="relative      main-content   scrollbar-thin  justify-end  min-h-full flex flex-col   gap-3 ">

                    <div ref={oldMessagesObserRef} className="p-1"></div>
                    {messages?.map((message) => {

                        return <ChatMessage messagesRef={messagesRef} plusRef={plusRef} key={message.id} message={message} optionsRef={optionsRef} />
                    })}
                    <div ref={latestMessagesObserRef} className="p-1"></div>
                    {/* <div className="bg-gradient-to-r from-red-400 to-red-300 text-center absolute bottom-0 left-0 right-0  font-bold text-gray-300 w-full ">new messages 1</div> */}
                </div>
            </div>
            <MainInput fetchLatest={fetchLatest} />
        </div>
        {searchTab &&
     
        <SearchMessageTab />
       
        }
    </div>
}