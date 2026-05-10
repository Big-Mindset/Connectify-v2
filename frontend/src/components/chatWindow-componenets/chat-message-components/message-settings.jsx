

import { messageSettingsStore } from "@/store/messageSettings-store"
import HoverText from "../hover-text"



export default function MessageSettings({ handleMoreOptions, plusRef, message }) {

    let openMessageOptionId = messageSettingsStore(s => s.openMessageOptionId)
    let handleEditMessage = messageSettingsStore(s=>s.handleEditMessage)
    let handleReplyMessage = messageSettingsStore(s=>s.handleReplyMessage)
  

   
    
    return <div className={`absolute   right-0 top-0 bg-gray-4 p-1 rounded-lg`}>
        <div className="flex items-center gap-2">

            <div className="flex  items-center gap-0.5">
                <div onClick={() => setReacted(true)} className="p-0.5 hover:scale-[1.08]">
                    😂
                </div>
                <div className="p-0.5  hover:scale-[1.08] ">
                    😘
                </div>
                <div className="p-0.5  hover:scale-[1.08] ">
                    💕
                </div>
                <div>

                </div>
            </div>
            <div className="flex  items-center gap-0.5">
                <div className="group/reaction relative hover:bg-gray-3 p-0.5 whitespace-nowrap rounded-lg  hover:text-white text-gray-12 duration-150 hover:scale-[1.08]">
                    <HoverText text={"Add Reaction"} groups={"group-hover/reaction:visible group-hover/reaction:opacity-100"} />

                    <i className="fa-solid fa-face-grin-wide"></i>
                </div>

                <div onClick={()=>handleEditMessage(message)} className="group/edit  hover:bg-gray-3 p-0.5 rounded-lg  hover:text-white text-gray-12 duration-150 hover:scale-[1.08]">
                    <HoverText text={"Edit"} groups={"group-hover/edit:visible group-hover/edit:opacity-100"} />

                    <i className="fa-solid fa-pen"></i>
                </div>
                <div onClick={()=>handleReplyMessage(message)} className="group/reply hover:bg-gray-3 p-0.5 rounded-lg  hover:text-white text-gray-12 duration-150 hover:scale-[1.08]">
                    <HoverText text={"Reply"} groups={"group-hover/reply:visible group-hover/reply:opacity-100"} />

                    <i className="fa-solid fa-reply"></i>
                </div>
                <div ref={(val) => {
                    if (message.id === openMessageOptionId) {
                        plusRef.current = val
                    }
                }} onClick={handleMoreOptions} className="relative group/more hover:bg-gray-3 p-0.5 rounded-lg  hover:text-white text-gray-12 duration-150 hover:scale-[1.08]">
                    <HoverText text={"More"} groups={"group-hover/more:visible group-hover/more:opacity-100"} />

                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </div>
            </div>
        </div>
    </div>
}