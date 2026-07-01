"use client"

import Avatar from "../Avatar"
import { Check, CheckCheck } from "lucide-react"
import MoreOptions from "./more-options"
import { AnimatePresence } from "framer-motion"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { chatStore } from "@/store/Chat-store"
import { formateTime } from "@/lib/formateTime"
import dynamic from "next/dynamic"
let RenderAudio = dynamic(() => import("../chat-components/renderAudioes"))
let MessageSettings = dynamic(() => import("./chat-message-components/message-settings"))
let RenderTwoFiles = dynamic(() => import("./chat-message-components/render-twoFiles"))

let FileShowcaseCard = dynamic(() => import("./chat-message-components/render-otherFiles"))
import { EditMessage } from "./chat-message-components/edit-message"
import { messageSettingsStore } from "@/store/messageSettings-store"
import EmojiPicker from "./Emoji-Picker"
import { userStore } from "@/store/user-store"
import { chatMessageStore } from "@/store/chatMessage-store"
import { messageStatus } from "@/lib/calculateStatus"
import ResendMessage from "./chat-message-components/resend-message"

function ChatMessage({ optionsRef, message, plusRef, key }) {

    const [messageHover, setMessageHover] = useState(false)
    const participants = chatStore(s => s.participants)
    const messagesProgress = chatMessageStore(s => s.messagesProgress)
    const editMessage = messageSettingsStore(s => s.editMessage)
    const replyMessage = messageSettingsStore(s => s.replyMessage)
    const setOpenMessageOptionId = messageSettingsStore(s => s.setOpenMessageOptionId)
    const openMessageOptionId = messageSettingsStore(s => s.openMessageOptionId)
    const deleteMessage = messageSettingsStore(s => s.deleteMessage)
    const MessageRef = useRef(null)
    const setDeleteMessage = messageSettingsStore(s => s.setDeleteMessage)
    const reactMessage = messageSettingsStore(s => s.reactMessage)
    const setReactMessage = messageSettingsStore(s => s.setReactMessage)
    const inputRef = messageSettingsStore(s => s.inputRef)
    const handleReaction = messageSettingsStore(s => s.handleReaction)
    const handleReactionFunc = messageSettingsStore(s => s.handleReactionFunc)
    const session = userStore(s => s.session)
    let twoFiles = message.media.filter(m => {
        if (m.type.startsWith("video") || m.type.startsWith("image")) return true
        return false
    })
    let OtherFiles = message.media.filter(m => {
        if (m.type.startsWith("video") || m.type.startsWith("image") || m.type.startsWith("audio")) return false
        return true
    })
    let audioes = message.media.filter(m => m.type.startsWith("audio"))
    const handleMoreOptions = () => {
        setOpenMessageOptionId((prev) => {
            if (prev === message.id) {
                return null
            }
            return message.id
        })
    }
    const progress = useMemo(() => {
        const fileProgress = messagesProgress?.[message.id];
        if (!fileProgress) return 0;
        const values = Object.values(fileProgress);
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }, [messagesProgress?.[message.id]]);


    useEffect(() => {
        if (!deleteMessage?.id || deleteMessage.id !== message.id) return
        setDeleteMessage({ ...deleteMessage, messageRef: MessageRef })
    }, [deleteMessage?.id])

    let currentUserId = session?.user?.id

    let status = messageStatus(message.status)
    
    let sender = useMemo(()=>{
        return currentUserId === message.senderId ? session.user : participants.get(message.senderId)
        
    },[])
    let replyToSender;
    if (message.replyTo !== null) {
        replyToSender = currentUserId === message.replyTo.senderId ? session.user : participants.get(message.replyTo.senderId)
    }
  
    return (
        <div ref={MessageRef} key={key} className=" relative"  >
            {message.id === reactMessage?.id &&
                <div ref={(e) => {

                    let rect1 = e?.getBoundingClientRect()
                    let rect2 = inputRef?.current?.getBoundingClientRect()
                    if (rect1 && rect2) {
                        if (!reactMessage?.top) {
                            if (rect1?.bottom > rect2?.bottom) {
                                setReactMessage({ ...reactMessage, top: true })

                            }
                        }
                    }
                }} className={`absolute  ${reactMessage?.left ? `left-20 ${reactMessage?.top ? "bottom-10" : ""}` : `${reactMessage?.top && "bottom-full"} right-40 `}  z-[60000]`}>

                    <EmojiPicker reactions={message.reactions} perLine={12} emojiSize={28} previewPosition={"none"} />
                </div>
            }
            <div
                onMouseEnter={() => setMessageHover(true)}
                onMouseLeave={() => setMessageHover(false)}
                className={`py-2 px-3.5 flex flex-col overflow-hidden ${replyMessage?.id === message.id ? "bg-blue-800/30 before:content-[''] before:w-0.5 before:bg-blue-600 before:bottom-0 before:top-0 before:absolute relative before:left-0 " : (openMessageOptionId === message.id || editMessage?.id === message.id || reactMessage?.id === message.id) ? "bg-gray-5" : "hover:bg-gray-3"}  relative group rounded-r-sm duration-150  max-w-[97%] w-full cursor-pointer `}>
                {
                    message?.replyTo !== null &&
                    <div className="flex items-center w-full ">
                        <div className="shrink-0 ml-4 w-12 h-4 mt-2 border-l-2 border-t-2 border-gray-500 rounded-tl-lg group/reply1 hover:border-indigo-200 duration-200" />

                        <div className="flex items-center gap-2 min-w-0 flex-1 px-2 py-1 rounded-lg">

                            <div className="flex items-center gap-0.5 text-gray-300/90 font-bold shrink-0">
                                <Avatar image={replyToSender?.image} size={"size-4"} textSize={"text-[0.8rem]"} />
                                <h3
                                    className="max-w-[80px] truncate"
                                    style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)' }}
                                >
                                    {replyToSender?.name}
                                </h3>
                            </div>

                            <div className="p-0.5 rounded-full bg-gray-300 shrink-0" />

                            <p
                                className="text-gray-300 flex-1 min-w-0 line-clamp-1 group-hover/reply1:text-gray-200"
                                style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)' }}
                            >
                                {message?.replyTo?.content}
                            </p>

                        </div>
                        {/* <div className="ml-4 relative bh-red- duration-200 group/reply1 hover:border-indigo-200 w-10 h-3 border-l-2 border-t-2 border-gray-500 rounded-tl-lg">

                        <div className="absolute -top-4 left-[55%] w-full ml-2 mb-1  px-3 py-1.5 rounded-lg text-[0.8rem] " />
                        
                            <div className="flex items-center gap-2 min-w-0 text-sm">

                                <div className="flex items-center gap-0.5 text-gray-300/90 font-bold ">
                                    <Avatar image={replyToSender?.image} size={"size-4"} />
                                    <h3>{replyToSender?.name}</h3>
                                </div>
                                <div className="p-0.5 rounded-full bg-gray-300">

                                </div>
                                <p className="text-gray-300 group-hover/reply1:text-gray-200">{message?.replyTo?.content}</p>
                            </div>

                    </div> */}
                    </div>
                }

                <div className={`flex   w-full gap-4`}>
                    {((messageHover || message.id === openMessageOptionId || reactMessage?.id === message.id) && (status && status !== "failed")) &&
                        <MessageSettings userId={session.user.id} handleMoreOptions={handleMoreOptions} plusRef={plusRef} message={message} />
                    }
                    {status === "failed" && <ResendMessage message={message} />}


                    <div className="relative">

                        <Avatar size={"size-11"} textSize={"text-[1.5rem]"} image={sender?.image} />
                    </div>

                    <div className="w-full   pt-1 ">

                        <div className="flex items-baseline   gap-2 w-full">
                            <h1 className="font-medium text-gray-300 font-semibold text-md min-w-0">
                                {sender?.name}
                            </h1>

                            <div className="flex items-center gap-1 text-gray-300 text-xs whitespace-nowrap">
                                <span>{formateTime(message.createdAt)}</span>
                                {message.senderId === session.user.id && (

                                    status === "sent" ? <Check size={14} className=" text-gray-400" /> : status === "delivered" ? <CheckCheck size={14} className=" text-gray-400" /> : status === "read" && <CheckCheck size={14} className=" text-green-400" />
                                )
                                }
                            </div>
                        </div>


                        {message.media.length > 0 &&
                            <div className="flex flex-col gap-1 ">
                                {
                                    !status  ?
                                        <div className="w-[300px] rounded-xl bg-zinc-900 p-3 shadow-lg">
                                            <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>

                                            <p className="text-xs text-zinc-400 mt-2 text-right">
                                                {Math.round(progress)}%
                                            </p>
                                        </div> :
                                        <div>
                                            {twoFiles.length > 0 &&

                                                <RenderTwoFiles files={twoFiles} multipleFiles={twoFiles.length > 1} deleteButton={message.media.length > 1} moreFiles={twoFiles.length - 4} />

                                            }

                                            {audioes.length > 0 &&
                                                <RenderAudio audioes={audioes} deleteButton={message.media.length > 1} />
                                            }
                                            <div className="flex flex-col">
                                                {OtherFiles.map((file) => {

                                                    return <FileShowcaseCard deleteButton={message.media.length > 1} key={file.id} file={file} />
                                                })}
                                            </div>
                                        </div>
                                }

                            </div>
                        }


                        {(editMessage?.id === message.id) ? <EditMessage /> :
                            <div className={` ${!status ?  "text-gray-300/60  font-semibold" : status === "failed" ? "text-red-300" :  "text-gray-300/90 "}   break-words  text-[0.95em]`}>
                                {message.content}
                                {message.createdAt !== message.updatedAt &&
                                    <span className="text-[0.75rem] text-gray-400 ml-1">(edited)</span>
                                }
                            </div>
                        }


                    </div>


                </div>
                {message.reactions.length > 0 && (
                    <div className="flex items-center gap-1 ml-14 mt-1 flex-wrap">
                        {message.reactions.map((reaction) => {
                            const reactedByMe = reaction.reactors?.some(r => r.userId === currentUserId)
                            return (
                                <button
                                    onClick={() => handleReactionFunc(reaction, message.id)}
                                    key={reaction.id}
                                    title={reaction.reactors?.map(r => r.user?.name).join(", ")}
                                    className={`group relative flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150
                        ${reactedByMe
                                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30"
                                            : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08] hover:border-white/[0.15]"
                                        }`}
                                >
                                    <span className="text-[1rem] leading-none">{reaction.emoji}</span>
                                    {reaction.reactors?.length > 0 && (
                                        <span className="tabular-nums">{reaction.reactors.length}</span>
                                    )}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => handleReaction(message, true)}
                            className="flex items-center justify-center w-7 h-7 rounded-full border border-white/[0.06] bg-white/[0.02] text-gray-500 hover:bg-white/[0.08] hover:text-gray-300 transition-all duration-150"
                        >
                            <i className="fa-solid fa-face-smile text-xs" />
                        </button>
                    </div>
                )}

            </div>


            <AnimatePresence>
                {(openMessageOptionId === message.id && status !== "failed") &&

                    <MoreOptions optionsRef={optionsRef} message={message} userId={session.user.id} />
                }

            </AnimatePresence>
        </div>


    )
}
export default memo(ChatMessage)