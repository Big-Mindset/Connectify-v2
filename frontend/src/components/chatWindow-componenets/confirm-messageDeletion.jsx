import {motion } from "framer-motion"
import { chatMessageStore } from "@/store/chatMessage-store"
import { messageSettingsStore } from "@/store/messageSettings-store"
import { useEffect } from "react"

export default function ConfirmMessageDeletion() {
    let deleteMessage = messageSettingsStore(s => s.deleteMessage)
    let setDeleteMessage = messageSettingsStore(s => s.setDeleteMessage)
    let handleDeleteMessage = chatMessageStore(s=>s.handleDeleteMessage)

    useEffect(() => {
        if (!deleteMessage || !deleteMessage?.messageRef) return
        let message = document.querySelector(".message")
      
        message.innerHTML = deleteMessage.messageRef?.innerHTML
    }, [deleteMessage])
    return (
        <motion.div
        
        initial={{scale : 0.8 , opacity : 0}}
        animate={{scale : 1 , opacity : 1}}
        exit={{opacity : 0 , scale : 0.8}}
        className="fixed p-7 ring-2 ring-gray-4 rounded-lg  z-[200] bg-gray-2 left-1/2 top-1/2 -translate-1/2">
            <p className="text-gray-300  font-bold text-sm"><span className="tracking-wider text-indigo-300">Note</span> : <span className="text-gray-300/80">Once confrimed , the message will be deleted from everyone and the action is irreversable.</span></p>
               <p className="mt-2">
                <span className="text-sm font-bold text-yellow-500">Delete quickly : </span>
                <span className="text-sm tracking-wider text-gray-100/80">Hold shift to bypass the confirmation.</span>
            </p>
            <div className="message border-2 mt-8  pointer-events-none rounded-lg border-gray-4 mt-2">
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 w-full">
                <button
                onClick={()=>setDeleteMessage(null)}
                className="py-2 rounded-lg bg-zinc-800 border border-gray-5 hover:bg-zinc-700 text-zinc-200 font-medium transition-all cursor-pointer"
                >
                    Cancel
                </button>

                <button
                onClick={handleDeleteMessage}
                className="py-2 rounded-lg bg-red-400/80 border border-red-400 hover:bg-red-400 text-white font-medium transition-all cursor-pointer"
                >
                    Delete
                </button>
            </div>
         
        </motion.div>
    )
}