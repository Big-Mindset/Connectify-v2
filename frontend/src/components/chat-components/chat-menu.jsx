import {  Plus, SquareCheck, } from "lucide-react";

export default function ChatMenu({opened , ref , setCreateGroup , setOpenMenu}) {
    let handleNewGroup = ()=>{
        setCreateGroup(true)
        setOpenMenu(false)
    }
    return (
        <div ref={ref} className={`absolute origin-top-right duration-200 ${opened ? "scale-100 opacity-100" : "scale-0 opacity-0"} border border-gray-3 flex flex-col gap-2 bg-gray-1 right-[70%] top-full p-3 rounded-lg  w-[180px]`}>
            <div  onClick={handleNewGroup} className="flex text-sm px-3.5 hover:bg-indigo-800 hover:text-indigo-100 duration-150 cursor-pointer p-1.5 rounded-lg items-center gap-2.5">
               <Plus size={17} />
               <span>New Group</span>
            </div>
            <div className="flex text-sm px-3.5  hover:bg-indigo-800 hover:text-indigo-100 duration-150 cursor-pointer p-1.5 rounded-lg items-center gap-2.5">
               <SquareCheck size={17} />
                <span>Select Chats</span>
            </div>
        </div>
    )
}