"use client"

import { MessageSquareOff, MoreVerticalIcon, Search } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ChatMenu from "./chat-components/chat-menu";
import { AnimatePresence } from "framer-motion";
import { chatStore } from "@/store/chat-store";
import { userStore } from "@/store/user-store";
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
    const [searchQuery, setSearchQuery] = useState("")

    const setInviteComp = chatStore(s => s.setInviteComp)
    const inviteComp = chatStore(s => s.inviteComp)
    const getChats = chatStore(s => s.getChats)
    const chats = chatStore(s => s.chats)
    const session = userStore(s => s.session)

    let user = session?.user
    useLayoutEffect(() => {
        if (user?.id !== null && !chats?.length) {
            getChats(user?.id)

        }
    }, [])
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

    let filteredChats = useMemo(() => {
        let result = chats
        if (selectedChat === "Unread") {
            result = result.filter((chat) => {
                if (!chat.lastMessage || chat.lastMessage?.senderId === session.user.id) return false
                let status = chat.lastMessage.status.find((status) => status.userId === session.user.id)

                if (status?.status && status?.status !== "READ") {
                    return true
                }
                return false
            })
        } else if (selectedChat === "Group") {
            result = result.filter((chat) => chat.isGroup)
        }
        if (searchQuery && result.length > 0) {
            result = result?.filter((chat) => {
                let name = chat?.name || chat?.user?.name
                
                return name.toLowerCase().includes(searchQuery.toLowerCase())
            })
        }
        return result
    }, [selectedChat, searchQuery, chats])

    let typingIndicators = chatStore(s=>s.typingIndicators)
    console.log(typingIndicators)

    return <div className=" w-full border-r border-gray-6 h-full py-4 px-6 bg-gray-1  ">
        <AnimatePresence>

            {inviteComp &&
                <Invite openInvite={inviteComp} setOpenInvite={setInviteComp} />
            }
            {createGroup &&
                <CreateGroup setCreateGroup={setCreateGroup} createGroup={createGroup} />
            }
        </AnimatePresence>
        <div className="flex section-1 flex-col h-full gap-4">
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
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setHover(false)} onBlur={() => setHover(true)} type="text" placeholder="Start searching here" className="p-2 w-full placeholder:text-[0.9rem]  outline-none" />
                <Search className="size-5" />
            </div>


            <div className="all-chats-section p-1 flex-1 ">
                <span className="text-xl font-bold">Chats</span>
                <div className="flex mt-3 text-sm items-center gap-1.5">
                    {["All", "Unread", "Group"].map((name) => {
                        return <div key={name} onClick={() => setSelectedChat(name)}>

                            <div className={`px-4 ${selectedChat === name ? "bg-indigo-700" : "hover:bg-indigo-700/70  bg-indigo-600/20"} py-1 cursor-pointer   rounded-lg`}>
                                {name}
                            </div>
                        </div>
                    })}

                </div>
                <div className="pt-6 ml-1.5 users-section flex flex-col gap-1.5 ">


                    <div className="relative ">

                        <AnimatePresence>
                            {
                                chatSettings &&
                                <ChatSettings childRef={childRef} chatSettings={chatSettings} />
                            }
                        </AnimatePresence>
                        {(!filteredChats?.length) ? <div className="flex justify-center mt-20 h-full">
                            <div className="flex flex-col items-center gap-2">
                                <div>
                                    <MessageSquareOff className="text-gray-300" />
                                </div>
                                <p className="tracking-wider font-bold text-gray-300">Chats not found</p>
                            </div>
                        </div> : <div className="flex flex-col gap-2">
                            {filteredChats.map((chat) => {
                                return <ChatUser key={chat.id} chat={chat} childRef={childRef} setChatSettings={setChatSettings} />
                            })}
                        </div>}

                    </div>
                </div>
            </div>
        </div>

    </div>
}