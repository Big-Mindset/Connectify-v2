import Avatar from "@/components/Avatar";
import { Check } from "lucide-react";
 
export default function GroupUser({ user, isSelected, onToggle }) {
    return (
        <div
            onClick={() => onToggle(user.id)}
            className={`relative group ${isSelected ? "border-indigo-400 ring-indigo-500/30" : "border-gray-800 ring-gray-800 hover:bg-gray-800/60"
                } duration-200 border overflow-hidden flex px-2.5 ring-2 cursor-pointer py-2 bg-gray-900/60 rounded-lg items-center gap-2`}
        >
            <Avatar size={"size-10"} src={user.avatarUrl} />
            <div className="flex w-full justify-between px-2.5 items-center">
                <div className="min-w-0">
                    <p className="font-bold text-gray-200 truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm truncate">{user.bio || user.username}</p>
                </div>
                <div
                    className={`size-5 shrink-0 flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-500" : "border-gray-600 group-hover:border-indigo-400"
                        } relative rounded-md border duration-150`}
                >
                    {isSelected && <Check size={14} className="text-white" />}
                </div>
            </div>
        </div>
    );
}
 