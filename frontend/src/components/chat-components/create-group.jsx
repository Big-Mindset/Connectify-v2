"use client"

import { Album, Camera, Check, CheckCheck, MoreVerticalIcon, X } from "lucide-react";
import Avatar from "../Avatar";
import ChatSettings from "./chat-settings";
import { useState } from "react";
import GroupUser from "./create-group-components/group-user";
import { motion } from "framer-motion"
export default function CreateGroup({ createGroup, setCreateGroup }) {
    const [selected, setSelected] = useState(false)
    const [usersAdded, setUsersAdded] = useState(false)
    return (
        <>
            {createGroup && <div className="absolute inset-0  bg-black/30  z-20"></div>}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transtiion={{ duration: 0.2 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={`border-gray-6   absolute bg-gray-2 border rounded-lg  z-50 left-1/2 w-full max-w-[500px] top-1/2 -translate-1/2`}>
                <div className="p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="">

                            <h1 className="font-bold text-xl">Create Group</h1>
                        </div>
                        <div onClick={() => setCreateGroup(false)} className="rounded-full cursor-pointer duration-100  hover:bg-gray-5 p-1">

                            <X className="size-5" />
                        </div>
                    </div>

                    {usersAdded ? (
                        <div className="mt-3 flex flex-col  gap-2">
                            <div className="size-30 self-center relative bg-gray-5 cursor-pointer border group border-indigo-400 relative rounded-full">
                                <label htmlFor="group-dp" className="group-hover:opacity-100 cursor-pointer inset-0 text-sm duration-200  opacity-0 absolute   items-center gap-0.5 flex items-center justify-center">

                                    <Camera />
                                    <span>Change</span>
                                </label>
                                <input type="file" className="hidden" id="group-dp" />
                            </div>
                            <div className="text-center">Group DP</div>
                            <form className="flex flex-col gap-3.5">

                                <div className="flex flex-col w-full gap-1.5">
                                    <label className="text-sm font-semibold" htmlFor="group-name">Name</label>
                                    <input type="text" id="group-name" className="outline-none bg-gray-2 ring ring-gray-7  focus:ring-indigo-400 hover:ring-indigo-500/50 rounded-full py-2 px-3 " />
                                </div>
                                <div className="flex flex-col w-full gap-1.5">
                                    <label className="text-sm font-semibold" htmlFor="group-description">Description</label>
                                    <textarea type="text" id="group-description" className="outline-none bg-gray-2 ring ring-gray-7  focus:ring-indigo-400 hover:ring-indigo-500/50 rounded-lg py-2 px-3 " />
                                </div>
                                <button className="mt-2 bg-indigo-500 hover:ring-indigo-500 hover:bg-indigo-700 duration-150 cursor-pointer ring rounded-full w-[40%] mx-auto p-2">Create Group</button>
                            </form>
                        </div>
                    ) :
                        (
                            <div className="space-y-2 mt-5">
                                <h1 className="font-medium ">Add Users</h1>
                                <div>
                                    <input type="text" placeholder="Search Users" className="w-full outline-none  placeholder:text-sm rounded-lg p-2 focus:ring-indigo-400  bg-black/40 duration-300 ring-gray-2  ring-2" />
                                </div>
                                <div className="mt-6 ml-1.5 users-section space-y-2.5">
                                    <GroupUser setSelected={setSelected} selected={selected} />
                                </div>
                                <div className="grid mt-5 grid-cols-2 gap-2.5">
                                    <button onClick={() => setCreateGroup(false)} className="p-2 bg-gray-600/40 hover:bg-gray-600/60 duration-200 cursor-pointer  rounded-lg ">Cancel</button>
                                    <button onClick={() => setUsersAdded(true)} className="p-2   bg-indigo-600  hover:bg-indigo-700 duration-200 cursor-pointer hover:text-indigo-50 rounded-lg ">Continue</button>
                                </div>


                            </div>
                        )}
                </div>
            </motion.div>
        </>
    )
}