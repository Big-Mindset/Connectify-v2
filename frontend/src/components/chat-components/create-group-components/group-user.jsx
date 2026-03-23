import Avatar from "@/components/Avatar";
import { Check } from "lucide-react";

export default function GroupUser({setSelected , selected}) {
    return (
        <div className="relative ">
            <div onClick={() => setSelected(prev=>!prev)} className={`relative group ${selected ? "border-indigo-400" : "hover:bg-gray-2"}   duration-200 border border-gray-5 overflow-hidden flex px-2.5 ring-2  group cursor-pointer ring-gray-3 py-2 bg-gray-3    rounded-lg items-center gap-2`}>
                <Avatar size={"size-14"} />
                <div className="flex w-full justify-between px-2.5">
                    <div>

                        <p className="font-bold">Wadood</p>
                        <p className="text-gray-10 text-sm">Surviving not living...</p>
                    </div>
                    <div className={`size-5  ${selected && "bg-indigo-700"} relative rounded-lg self-center-safe border  hover:border-indigo-400`}>
                        {selected &&
                            <span className="absolute left-1/2 top-1/2 -translate-1/2"><Check size={16} /></span>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}