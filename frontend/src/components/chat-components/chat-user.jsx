import { CheckCheck, MoreVerticalIcon } from "lucide-react";
import ChatSettings from "./chat-settings";
import Avatar from "../Avatar";

export default function ChatUser({setChatSettings }) {
    return (
            <div className="relative overflow-hidden flex px-2.5 ring-2 hover:ring-indigo-500 group cursor-pointer ring-gray-2 py-2 bg-[#00000094] rounded-lg items-center gap-2">
                <div onClick={() => setChatSettings(prev=>!prev)} className="backdrop-blur-2xl invisible group-hover:visible   absolute -right-5 top-0 p-1.5 duration-100 group-hover:right-0 rounded-full  ">
                    <MoreVerticalIcon size={12} className="text-purple-100" />
                </div>

                {/* <div className="absolute -top-1 right-0 rotate-45 p-1  bg-[#141414] rounded-full">
                    <PinIcon size={15} />
                    </div> */}
                <Avatar size={"size-12"} />
                <div className="flex flex-col w-full">
                    <div className="flex  items-center justify-between">
                        <p className="font-bold">Wadood</p>
                        <p className="text-gray-12 text-sm">12:30 PM</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-100">Hey whatsapp!!</p>
                        <div className="flex items-center gap-2">
                            <CheckCheck size={19} className="text-blue-300" />

                        </div>

                    </div>
                </div>
            </div>
    )
}