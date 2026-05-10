
import { chatMessageStore } from "@/store/chatMessage-store"
import { messageSettingsStore } from "@/store/messageSettings-store"
import { useEffect, useState } from "react"

export let EditMessage = () => {
    const [inputText , setInputText] = useState("")
    let setEditMessage = messageSettingsStore(s=>s.setEditMessage)
    let editMessage = messageSettingsStore(s=>s.editMessage)
    let handleEditMessage = chatMessageStore(s=>s.handleEditMessage)
    useEffect(()=>{
        setInputText(editMessage.content)
    },[editMessage])
    let handleCancel = ()=>{
        setEditMessage({})
    }
    let handleSaveMessage = ()=>{
        handleEditMessage(inputText)
        handleCancel()
    }
    let handleKeyDown = ()=>{}
    let handleTyping = (e)=>{
        setInputText(e.target.value)
    }
    return (
        <div className="mt-1">
            <div className="w-full flex flex-col gap-1  focus-within:ring-indigo-400/40 focus-within:ring-2   ring ring-gray-7  rounded-lg overflow-hidden   bg-gray-2/80   "> 
                <input onKeyDown={handleKeyDown} value={inputText}  onChange={handleTyping} placeholder="Type a message" type="text" className="w-full  text-[0.95rem] p-3   caret-indigo-400 outline-none" />

            </div>
            <div>
             <p className="text-[0.8rem] text-gray-300">escape to <span onClick={handleCancel} className="text-indigo-400 hover:underline">cancel</span> enter to <span onClick={handleSaveMessage} className="text-indigo-400 hover:underline">save</span></p>
            </div>
        </div>
    )
}