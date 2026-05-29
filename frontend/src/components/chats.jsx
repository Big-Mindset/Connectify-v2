"use client"

import { MoreVerticalIcon, Search, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import FilteredChats from "./chat-components/filteredChats";
import dynamic from "next/dynamic";
import ChatMenu from "./chat-components/chat-menu";
import { AnimatePresence } from "framer-motion";
import { chatStore } from "@/store/chat-store";
import { userStore } from "@/store/user-store";
import { socketStore } from "@/store/socket";
const CreateGroup = dynamic(() => import("./chat-components/create-group"))
const ChatSettings = dynamic(() => import("./chat-components/chat-settings"))
const ChatUser = dynamic(() => import("./chat-components/chat-user"))
const Invite = dynamic(() => import("./chat-components/invite"))
export default function Chats() {
    const [selectedChat, setSelectedChat] = useState("All")
    const [createGroup, setCreateGroup] = useState(false)
    const [hover, setHover] = useState(false)
    const [chatSettings, setChatSettings] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const childRef = useRef(null)
    const chatMenuRef = useRef(null)


    const setInviteComp = chatStore(s => s.setInviteComp)
    const inviteComp = chatStore(s => s.inviteComp)
    const getChats = chatStore(s => s.getChats)
    const chats = chatStore(s => s.chats)
    const filteredChats = chatStore(s => s.filteredChats)
    const setFilteredChats = chatStore(s => s.setFilteredChats)
    const session = userStore(s => s.session)
    const socket = socketStore(s => s.socket)
    const handleMarkAllAsRead = socketStore(s => s.handleMarkAllAsRead)
    const handleReceiveMessage = socketStore(s => s.handleReceiveMessage)
    const handleUpdateAllToDelivered = socketStore(s => s.handleUpdateAllToDelivered)
    const handleDeliverMessage = socketStore(s => s.handleDeliverMessage)
    const handleReadMessage = socketStore(s => s.handleReadMessage)

    let user = session?.user
    useEffect(() => {


        if (user?.id) {

            getChats(user?.id)
        }

    }, [session?.user?.id])
    useEffect(() => {
        if (!socket) return
        socket?.on("updateToDelivered",handleUpdateAllToDelivered)
        socket?.on("mark-asRead", handleMarkAllAsRead)
        socket?.on("message-delivered", handleDeliverMessage)
        socket.on("message-read",handleReadMessage)
        socket.on("send-message", handleReceiveMessage)
        
        
        return () => {
            
            socket.off("message-read",handleReadMessage)
            socket?.off("message-delivered", handleDeliverMessage)
            socket?.off("updateToDelivered",handleUpdateAllToDelivered)
            socket?.off("send-message", handleReceiveMessage)
            socket?.off("mark-asRead", handleMarkAllAsRead)

        }
    }, [socket])
    useEffect(() => {
        let handleCloseSettings = (e) => {
            if (childRef.current && !childRef.current.contains(e.target)) {
                setChatSettings(false)
            }
            if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) {
                setOpenMenu(false)
            }

        }

        window.addEventListener("mousedown", handleCloseSettings)
        return () => {
            window.removeEventListener("mousedown", handleCloseSettings)

        }
    }, [])

    useEffect(() => {
        filterMessages()

    }, [selectedChat, chats])


    const filterMessages = () => {

        if (selectedChat === "All") {
            setFilteredChats(() => chats)

        } else if (selectedChat === "Unread") {
            let filtered = chats.filter((chat) => {

                if (chat.lastMessage) {
                    if (chat.lastMessage.status.status === "Sent") {
                        return chat
                    }
                }
            })
            setFilteredChats(() => filtered)
        } else if (selectedChat === "Group") {
            let filtered = chats.filter((chat) => {

                if (chat.isGroup) return chat
            })
            setFilteredChats(() => filtered)
        }
    }


    const handleSearch = async (evt) => {
        let value = evt.target.value.trim().toLowerCase()
        if (!value) {
            filterMessages()
            return
        }
        setFilteredChats((prev) => {
            return prev.filter((chat) => {
                let name = chat.name || chat.user.name
                name = name.toLowerCase()
                return name.startsWith(value)
            })
        })
    }
    return <div className=" w-full border-r border-gray-6 h-full py-4 px-6 bg-gray-1  ">
        <AnimatePresence>

            {inviteComp &&
                <Invite openInvite={inviteComp} setOpenInvite={setInviteComp} />
            }
            {createGroup &&
                <CreateGroup setCreateGroup={setCreateGroup} createGroup={createGroup} />
            }
        </AnimatePresence>
        <div className="flex section-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-2xl bg-gradient-to-r from-blue-600 font-bold to-violet-300 text-transparent bg-clip-text  ">CONNECTIFY<span className="size-2 rounded-full  "></span></p>

                <div className="flex items-center gap-2">
                    <button onClick={() => setInviteComp(true)} className="px-2.5 py-1 text-sm flex items-center gap-1 duration-150 cursor-pointer border border-indigo-700/50 hover:bg-indigo-700  hover:border-indigo-700 bg-indigo-700/90  rounded-lg">
                        <p>Add Friend</p>
                    </button>
                    <div className="relative">

                        <button onClick={() => setOpenMenu(true)} className=" p-2 duration-150  hover:ring ring-gray-8 hover:bg-gray-4 cursor-pointer rounded-full">
                            <MoreVerticalIcon size={14} />

                        </button>
                        <ChatMenu setOpenMenu={setOpenMenu} ref={chatMenuRef} setCreateGroup={setCreateGroup} opened={openMenu} />
                    </div>
                </div>

            </div>
            <div className={`search-section ${hover ? " hover:ring-gray-500" : "focus-within:ring-indigo-400 "} flex items-center ring ring-gray-3  gap-1   rounded-full  px-2 overflow-hidden duration-50   focus-within:bg-gray-1 bg-gray-3`}>
                <input onChange={handleSearch} onFocus={() => setHover(false)} onBlur={() => setHover(true)} type="text" placeholder="Start searching here" className="p-2 w-full placeholder:text-[0.9rem]  outline-none" />
                <Search className="size-5" />
            </div>


            <div className="all-chats-section p-1">
                <span className="text-xl font-bold">Chats</span>
                <div className="flex mt-3 text-sm items-center gap-1.5">
                    {["All", "Unread", "Group", "Favourite"].map((name) => {
                        return <div key={name} onClick={() => setSelectedChat(name)}>

                            <FilteredChats name={name} selectedChat={selectedChat} />
                        </div>
                    })}

                </div>
                <div className="mt-6 ml-1.5 users-section flex flex-col gap-1.5 ">


                    <div className="relative ">

                        <AnimatePresence>
                            {
                                chatSettings &&
                                <ChatSettings childRef={childRef} chatSettings={chatSettings} />
                            }
                        </AnimatePresence>
                        <div className="flex flex-col gap-2">
                            {filteredChats.map((chat) => {
                                return <ChatUser key={chat.id} chat={chat} childRef={childRef} setChatSettings={setChatSettings} />
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
}