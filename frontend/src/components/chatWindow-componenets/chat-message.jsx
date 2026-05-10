"use client"

import Avatar from "../Avatar"
import { CheckCheck } from "lucide-react"
import MoreOptions from "./more-options"
import { AnimatePresence } from "framer-motion"
import { memo, useEffect, useRef, useState } from "react"
import GirlImage from "@/assets/download.jpg"
import { chatStore } from "@/store/chat-store"
import { formateTime } from "@/lib/formateTime"
import dynamic from "next/dynamic"
let RenderAudio = dynamic(() => import("../chat-components/renderAudioes"))
let MessageSettings = dynamic(() => import("./chat-message-components/message-settings"))
let RenderTwoFiles = dynamic(() => import("./chat-message-components/render-twoFiles"))

let FileShowcaseCard = dynamic(() => import("./chat-message-components/render-otherFiles"))
import { EditMessage } from "./chat-message-components/edit-message"
import { messageSettingsStore } from "@/store/messageSettings-store"
import EmojiPicker from "./Emoji-Picker"

function ChatMessage({ optionsRef, message, plusRef, key }) {

    const [reacted, setReacted] = useState(false)
    const [messageHover, setMessageHover] = useState(false)
    const participants = chatStore(s => s.participants)
    const [progress, setProgress] = useState()
    const messagesProgress = messageSettingsStore(s => s.messagesProgress)
    const editMessage = messageSettingsStore(s => s.editMessage)
    const replyMessage = messageSettingsStore(s => s.replyMessage)
    const setOpenMessageOptionId = messageSettingsStore(s => s.setOpenMessageOptionId)
    const openMessageOptionId = messageSettingsStore(s => s.openMessageOptionId)
    const deleteMessage = messageSettingsStore(s=>s.deleteMessage)
    const MessageRef = useRef(null)
    const setDeleteMessage = messageSettingsStore(s=>s.setDeleteMessage)
    const reactMessage = messageSettingsStore(s=>s.reactMessage)
    const setReactMessage = messageSettingsStore(s=>s.setReactMessage)
    const inputRef = messageSettingsStore(s=>s.inputRef)
    const handleReaction = messageSettingsStore(s=>s.handleReaction)
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
    useEffect(() => {
        let progress = messagesProgress?.[message.id]
        let values = Object.values(progress || {})
        if (values) {

            let overallProgress = values.reduce((a, b) => a + b, 0)
            setProgress(overallProgress/values.length)
        }
    }, [messagesProgress?.[message.id]])


    useEffect(()=>{
        if (!deleteMessage?.id || deleteMessage.id !== message.id) return
       setDeleteMessage({...deleteMessage,messageRef : MessageRef})
    },[deleteMessage?.id])
    let sender = participants.get(message.senderId)
    let replyToSender;
    if (message.replyTo !== null) {
        replyToSender = participants.get(message.replyTo.senderId)
    }
    
    return (
        <div ref={MessageRef} key={key} className="relative" >
            {message.id === reactMessage?.id &&
             <div ref={(e)=>{
               
                let rect1 = e?.getBoundingClientRect()
                let rect2 = inputRef?.current?.getBoundingClientRect()
                if (rect1 && rect2){
                      if (!reactMessage?.top) {
                          if (rect1?.bottom > rect2?.bottom){
                              setReactMessage({...reactMessage , top : true})
                              console.log(reactMessage)
                            }
                        }
                }
             }} className={`absolute  ${reactMessage?.left ? `left-20 ${reactMessage?.top ? "bottom-10" : ""}` : `${reactMessage?.top && "bottom-full"} right-40 ` }  z-[60000]`}>

        <EmojiPicker reaction={true} emojiButtonRadius={100} perLine={17} emojiSize={30} previewPosition={"none"} />
       </div>
       }
            <div
                onMouseEnter={() => setMessageHover(true)}
                onMouseLeave={() => setMessageHover(false)}
                className={`py-2 px-3.5 flex flex-col overflow-hidden ${replyMessage?.id === message.id ? "bg-blue-800/30 before:content-[''] before:w-0.5 before:bg-blue-600 before:bottom-0 before:top-0 before:absolute relative before:left-0 " : (openMessageOptionId === message.id || editMessage?.id === message.id || reactMessage?.id === message.id) ? "bg-gray-5" : "hover:bg-gray-5"}  relative group rounded-r-sm duration-150  max-w-[97%] w-full cursor-pointer `}>
                {
                    message?.replyTo !== null &&

                    <div className="ml-4 relative duration-200 group/reply1 hover:border-indigo-200 w-10 h-3 border-l-2 border-t-2 border-gray-500 rounded-tl-lg">

                        <div className="absolute -top-4 left-[55%] w-full ml-2 mb-1  px-3 py-1.5 rounded-lg text-[0.8rem] whitespace-nowrap">
                            <div className="flex items-center gap-2">

                                <div className="flex items-center gap-0.5 text-gray-300/90 font-bold ">
                                    <Avatar image={replyToSender?.image} size={"size-4"} />
                                    <h3>{replyToSender?.name}</h3>
                                </div>
                                <div className="p-0.5 rounded-full bg-gray-300">

                                </div>
                                <p className="text-gray-300 group-hover/reply1:text-gray-200">{message?.replyTo?.content}</p>
                            </div>
                        </div>

                    </div>
                }

                <div   className={`flex   w-full gap-4`}>
                    {(messageHover || message.id === openMessageOptionId || reactMessage?.id === message.id) &&
                        <MessageSettings handleMoreOptions={handleMoreOptions} plusRef={plusRef} message={message} />
                    }


                    <div className="relative">

                        <Avatar size={"size-11"} image={sender?.image || GirlImage} />
                    </div>

                    <div className="w-full  pt-1 ">
                        <div className="flex items-baseline   gap-2 w-full">
                            <h1 className="font-medium text-gray-300 font-semibold text-md min-w-0">
                                {sender?.name}
                            </h1>

                            <div className="flex items-center gap-1 text-gray-300 text-xs whitespace-nowrap">
                                <span>{formateTime(message.createdAt)}</span>
                                <CheckCheck size={14} className=" text-gray-400" />
                            </div>
                        </div>
                        {message.media.length > 0 &&
                            <div className="flex flex-col gap-1 ">
                                {
                                    message.status.status === "pending" ?
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

                                                <RenderTwoFiles files={twoFiles.slice(0, 4)} multipleFiles={twoFiles.length > 1} deleteButton={message.media.length > 1} moreFiles={twoFiles.length - 4} />

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
                            <div className={` ${message.status.status === "pending" ? "text-gray-400 font-semibold" : "text-gray-300 "}   text-[0.95em]`}>
                                {message.content}
                                {message.createdAt !== message.updatedAt && 
                                <span className="text-[0.75rem] text-gray-400 ml-1">(edited)</span>
                                }
                            </div>
                        }
                        

                    </div>


                </div>
                {message.reactions.length > 0 &&
                <div className="flex gap-1 items-center">

                    <div className="flex items-center gap-1 ml-13 mt ">
                        {message.reactions.map((reaction)=>{
                            
                            return  <div key={reaction.id} className="px-1 border bg-indigo-400/20 border-indigo-500 rounded-lg ">
                            {reaction.emoji}
                        </div>
                        })}
                    </div>
                    <div onClick={()=>handleReaction(message , true)} className="px-1.5 py-0.5 hover:bg-gray-8 rounded-lg bg-gray-7">
                          <i className="fa-solid fa-face-smile"></i>
                    </div>
                        </div>
                }

            </div>
            <AnimatePresence>
                {openMessageOptionId === message.id &&

                    <MoreOptions optionsRef={optionsRef} message={message} />}
            </AnimatePresence>
        </div>


    )
}
export default memo(ChatMessage)