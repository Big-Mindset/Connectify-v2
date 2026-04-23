"use client"

import Avatar from "../Avatar"
import { CheckCheck } from "lucide-react"
import MoreOptions from "./more-options"
import { AnimatePresence } from "framer-motion"
import { memo, useMemo, useState } from "react"
import GirlImage from "@/assets/download.jpg"
import { chatStore } from "@/store/chat-store"
import { formateTime } from "@/lib/formateTime"
import RenderAudio from "../chat-components/renderAudioes"
import MessageSettings from "./chat-message-components/message-settings"
import RenderTwoFiles from "./chat-message-components/render-twoFiles"
import FileShowcaseCard from "./chat-message-components/render-otherFiles"
import MediaShowcase from "./chat-message-components/media-showcase"
import { chatMessageStore } from "@/store/chatMessage-store"

function ChatMessage({ optionsRef, setMoreOptions, moreOptions, message, plusRef , key }) {

    const [reacted, setReacted] = useState(false)
    const [messageHover, setMessageHover] = useState(false)
    const selectedMedia = chatMessageStore((s)=>s.selectedMedia)

   
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
        setMoreOptions((prev) => {
            if (prev === message.id) {
                return null
            }
            return message.id
        })
    }
    
    console.log(message)
    return (
        <div key={key} className="relative" >
            <div
                onMouseEnter={() => setMessageHover(true)}
                onMouseLeave={() => setMessageHover(false)}
                className={`py-2 px-3.5 flex flex-col flex-col-reverse  relative group rounded-r-lg duration-150 ${moreOptions === message.id ? "bg-gray-5" : "hover:bg-gray-5"}  max-w-[97%] w-full cursor-pointer `}>
                {
                    message?.replyTo !== null &&

                    <div className="ml-4 relative duration-200 group/reply1 hover:border-indigo-200 w-10 h-3 border-l-2 border-t-2 border-gray-500 rounded-tl-lg">

                        <div className="absolute -top-4 left-[55%] w-full ml-2 mb-1  px-3 py-1.5 rounded-lg text-[0.8rem] whitespace-nowrap">
                            <div className="flex items-center gap-2">

                                <div className="flex items-center gap-0.5 text-gray-300/90 font-bold ">
                                    <Avatar size={"size-4"} />
                                    <h3>{message?.replyTo?.sender?.name}</h3>
                                </div>
                                <div className="p-0.5 rounded-full bg-gray-300">

                                </div>
                                <p className="text-gray-300 group-hover/reply1:text-gray-200">{message?.replyTo?.content}</p>
                            </div>
                        </div>

                    </div>
                }

                <div className={`flex   w-full gap-3`}>
                    {(messageHover || message.id === moreOptions) &&
                        <MessageSettings handleMoreOptions={handleMoreOptions} plusRef={plusRef} message={message} moreOptions={moreOptions} />
                    }


                    <div className="relative">

                        <Avatar size={"size-10"} image={message?.sender?.image || GirlImage} />
                    </div>

                    <div className="w-full">
                        <div className="flex items-baseline  gap-2 w-full">
                            <h1 className="font-semibold text-sm truncate min-w-0">
                                {message?.sender?.name}
                            </h1>

                            <div className="flex items-center gap-1 text-gray-300 text-xs whitespace-nowrap">
                                <span>{formateTime(message.createdAt)}</span>
                                <CheckCheck size={14} className=" text-gray-400" />
                            </div>
                        </div>
                        {message.media.length > 0 &&
                            <div className="flex flex-col gap-1 ">

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
                        {selectedMedia &&
                        <MediaShowcase  media={twoFiles}  />
                        }
                        <div className=" text-gray-200  text-[0.95em]">
                            {message.content}
                        </div>

                    </div>


                </div>
                {reacted &&
                    <div className="flex items-center gap-1 ml-13 mt ">
                        <div className="px-1 border bg-indigo-400/20 border-indigo-500 rounded-lg ">
                            😂
                        </div>
                    </div>
                }

            </div>
            <AnimatePresence>
                {moreOptions === message.id &&

                    <MoreOptions optionsRef={optionsRef} />}
            </AnimatePresence>
        </div>


    )
}
export default memo(ChatMessage)