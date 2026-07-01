import { chatStore } from "@/store/Chat-store";
import HoverText from "../hover-text";
import { chatMessageStore } from "@/store/chatMessage-store";

export default function ResendMessage({ message }) {
    let setMessages = chatStore(s => s.setMessages)
    let sendMessage = chatMessageStore(s => s.sendMessage)
    const handleResendMessage = () => {
        setMessages((prev) => {
            return prev.map((msg) => {
                if (msg.id === message.id) {

                    let updatedMessage = {...msg , status : "PENDING"}
                    sendMessage(updatedMessage , "manual-retry")
                    return updatedMessage
                }
                return msg
            })
        })
    }
    const handleRemoveMessage = () => {
        setMessages((prev) => {
            return prev.filter((msg) => msg.id !== message.id)
        })
    }
    return (
        <div className={`absolute   right-0 top-0 bg-gray-4 p-1 rounded-lg`}>
            <div className="flex items-center gap-2">
                <div onClick={handleResendMessage} className="group/reaction relative hover:bg-gray-3 p-0.5 whitespace-nowrap rounded-lg  hover:text-white text-gray-12 duration-150 hover:scale-[1.08]">
                    <HoverText  groups={"group-hover/reaction:visible group-hover/reaction:opacity-100"} />

                    <i className="fa-solid fa-arrow-rotate-right"></i>
                </div>
                <div onClick={handleRemoveMessage} className="group/reaction relative hover:bg-gray-3 p-0.5 whitespace-nowrap rounded-lg  hover:text-white text-gray-12 duration-150 hover:scale-[1.08]">
                    <HoverText groups={"group-hover/reaction:visible group-hover/reaction:opacity-100"} />

                    <i className="fa-solid fa-x"></i>
                </div>
            </div>
        </div>
    )
}