"use client"

import { messageSettingsStore } from "@/store/messageSettings-store"
import {  useLayoutEffect, useState } from "react"


export default function MoreOptions({ optionsRef, message }) {
    let inputRef = messageSettingsStore(s => s.inputRef)
    const [isTouching , setIsTouching] = useState(null)
    useLayoutEffect(() => {

        if (inputRef?.current && optionsRef?.current) {

            let rect1 = inputRef.current.getBoundingClientRect()
            let rect2 = optionsRef.current.getBoundingClientRect()
            const isTouching =
                rect1.bottom >= rect2.top &&
                rect1.top <= rect2.bottom &&
                rect1.right >= rect2.left &&
                rect1.left <= rect2.right;
            setIsTouching(isTouching)
        }
    }, [])
    return (
        <div
            ref={optionsRef}
            className={`absolute z-40 ${isTouching ? "bottom-full" : "top-[9%]"} border border-gray-7  right-17 rounded-sm  bg-gray-5 w-[200px] p-2  `}>
            <div className="flex flex-col gap-0.5 text-[0.8rem]">

                <Option message={message} text={"Edit"} icon={<i className="fa-solid fa-pen"></i>} />
                <Option message={message} text={"Reply"} icon={<i className="fa-solid fa-reply"></i>} />
                <Option message={message} text={"Reaction"} icon={<i className="fa-solid fa-face-surprise"></i>} />
                <Option text={"Forward"} icon={<i className="fa-solid fa-share"></i>} />

                <hr className="border border-gray-7 my-1.5" />
                <Option message={{content : message.content}} text={"Copy text"} icon={<i className="fa-solid fa-copy"></i>} />
                <Option text={"Pin message"} icon={<i className="fa-solid fa-thumbtack"></i>} />

                <hr className="border border-gray-7 my-1.5" />
                <Option message={message} text={"Delete"} red={true} icon={<i className="fa-solid fa-trash"></i>} />

            </div>
        </div>
    )
}

function Option({ text, icon, red, message }) {
    let setOpenMessageOptionId = messageSettingsStore(s => s.setOpenMessageOptionId)
    let handleEditMessage = messageSettingsStore(s => s.handleEditMessage)
    let handleReplyMessage = messageSettingsStore(s => s.handleReplyMessage)
    let handleDeleteMessage = messageSettingsStore(s => s.handleDeleteMessage)
    let handleReaction = messageSettingsStore(s => s.handleReaction)
    let handleMessageSettings = () => {
        text = text.toLowerCase().trim()

        if (text === "edit") {
            handleEditMessage(message)

        } else if (text === "reply") {
            handleReplyMessage(message)
        } else if (text === "delete") {
            handleDeleteMessage(message)
        }else if (text === "reaction"){
            handleReaction(message)
        }else if (text === "copy text"){
            navigator.clipboard.writeText(message.content)
        }

        setOpenMessageOptionId(() => null)
    }
    return <div onClick={handleMessageSettings} className={`flex group cursor-pointer items-center justify-between rounded-lg py-2 px-3 
                 ${red ? "hover:bg-red-500/10 text-red-300" : "hover:bg-indigo-500/20 text-gray-100"} 
                 transition duration-150`}>
        <span>{text}</span>
        <div className="opacity-80 group-hover:opacity-100">{icon}</div>
    </div>
}