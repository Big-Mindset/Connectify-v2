import Avatar from "@/components/Avatar";
import { messageStatus } from "@/lib/calculateStatus";
import { Check, CheckCheck, ImageIcon } from "lucide-react";
import { formateTime } from "@/lib/formateTime"
import { userStore } from "@/store/user-store";
import { chatStore } from "@/store/Chat-store";

export let SearchedMessage = ({ message }) => {
    const session = userStore(s => s.session)
    let currentUserId = session?.user?.id
    let participants = chatStore(s=>s.participants)
    let status = messageStatus(message.status)
    let sender = currentUserId === message.senderId ? session.user : participants.get(message.senderId)
    let replyToSender;
    if (message.replyTo !== null) {
        replyToSender = currentUserId === message.replyTo.senderId ? session.user : participants.get(message.replyTo.senderId)
    }

    return (
        <div className="py-2 px-3.5 flex flex-col overflow-hidden border border-gray-700 relative group rounded-r-sm duration-150 w-full cursor-pointer">

            {message?.replyTo !== null && (
                <div className="flex items-center w-full overflow-hidden mb-1">

                    <div className="shrink-0 ml-4 w-12 h-4 mt-2 border-l-2 border-t-2 border-gray-500 rounded-tl-lg group/reply1 hover:border-indigo-200 duration-200" />

    
                    <div className="flex items-center gap-2 min-w-0 flex-1 px-2 py-1 rounded-lg">

                        <div className="flex items-center gap-0.5 text-gray-300/90 font-bold shrink-0">
                            <Avatar image={replyToSender?.image} size={"size-4"} />
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
                </div>
            )}

            <div className="flex w-full items-start gap-4">
                <div className="relative">
                    <Avatar size={"size-11"} image={sender?.image} />
                </div>

                <div className=" flex-1 min-w-[0] pt-1 ">
                    <div className="flex items-baseline gap-2 w-full">
                        <h1 className="font-medium text-gray-300 font-semibold text-md min-w-0">
                            {sender?.name}
                        </h1>
                        <div className="flex items-center gap-1 text-gray-300 text-xs whitespace-nowrap">
                            <span>{formateTime(message.createdAt)}</span>
                            {message.senderId === session.user.id && (
                                status === "sent" ? <Check size={14} className="text-gray-400" />
                                : status === "delivered" ? <CheckCheck size={14} className="text-gray-400" />
                                : status === "read" && <CheckCheck size={14} className="text-green-400" />
                            )}
                        </div>
                    </div>

                    <div className={`mb-2 ${message?.status === "PENDING" ? "text-gray-300/60 font-semibold" : "text-gray-300/90"} min-w-0 whitespace-pre-wrap break-all text-[0.95em]`}>
                        {message.content} {message._count.media > 0 && <span className="flex items-center">
                                <ImageIcon size={15} />
                                <p>{message._count.media}</p>
                                
                        </span>} 
                        {message.createdAt !== message.updatedAt &&
                            <span className="text-[0.75rem] text-gray-400 ml-1">(edited)</span>
                        }
                    </div>
                </div>
                   <p className="text-[0.7rem] font-bold tracking-widere hover:text-indigo-200 absolute  right-3  bottom-1 text-gray-400 text-nowrap">Jump to message</p>

            </div>

        </div>
    )
}