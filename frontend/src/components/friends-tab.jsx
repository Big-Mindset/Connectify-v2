"use client"

import { chatStore } from "@/store/chat-store";
import { EqualApproximately, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import FriendUser from "./friendsTab-components/friend-user";
import FriendRequest from "./friendsTab-components/friend-request";
import { Axios } from "@/lib/axiosInstance";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function FriendsTab() {
    const [allFriends, setAllFriends] = useState([])
    const [onlineUsers, setOnlineUsers] = useState(new Set())
    const [pendingRequest, setPendingRequest] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("online")
    const setInviteComp = chatStore(s => s.setInviteComp)
    let session = authClient.useSession()
    let userId = session.data.user.id
    useEffect(() => {
        let getAllFriends = async () => {
            if (allFriends?.length > 0) return
            try {

                let { data } = await Axios.get("/friendship/all-friends")
                setAllFriends(data.FriendRequests)
            } catch (error) {
                toast.error(error?.response?.data?.message || "Server error")
            }

        }
        let getRequests = async () => {
            if (pendingRequest.length > 0) return
            try {

                let { data } = await Axios.get("/friendship/get-requests")
                setPendingRequest(data.friendRequests)
            } catch (error) {
                toast.error(error?.response?.data?.message || "Server error")

            }
        }
        if (selectedCategory === "all") {
            getAllFriends()
        } else if (selectedCategory === "pending") {
            getRequests()
        }

    }, [selectedCategory])
    let requestSent = []
    let requestReceived = []
    pendingRequest.forEach((req) => {

        if (req.sender.id === userId) {
            let { sender, receiver, ...rest } = req
            requestSent.push({ ...rest, user: { ...receiver } })
        } else {
            let { receiver, sender, ...rest } = req
            requestReceived.push({ ...rest, user: { ...sender } })

        }
    })
    return (
        <div className="h-full flex flex-col gap-6 py-1 px-6 gap-2 ">
            <div className="Header flex flex-col gap-2">

                <div className=" flex items-center  ">
                    <div className="flex items-center   w-full gap-5   h-[60px] ">
                        <div className="flex items-center   cursor-pointer gap-2   py-1 rounded-lg">
                            <div className="flex items-center gap-1">

                                <i className="fa-sharp-duotone mb-0.5 text-gray-300 fa-solid fa-user-group" ></i>
                                <p className="text-[1.1rem] tracking-[3] mr-3" >Friends</p>
                            </div>

                            <div className="bg-gray-300 rounded-full size-2" />
                        </div>
                        <div className="flex items-center text-gray-300 gap-2">
                            {["online", "all", "pending"].map((value) => {
                                return (
                                    <button key={value} onClick={() => setSelectedCategory(value)} className={`px-4 capitalize ${selectedCategory === value ? " bg-gray-6 border-gray-900 text-gray-200" : "hover:bg-gray-5/70 hover:text-gray-50 "} py-0.5 cursor-pointer  duration-200 border  text-[1.06rem] border-transparent rounded-lg`}>
                                        {value}
                                    </button>
                                )
                            })}
                        </div>
                        <button onClick={() => setInviteComp(true)} className="px-2.5 py-1 flex items-center gap-1 duration-150 cursor-pointer border-2 border-indigo-700/50 hover:border-indigo-200 focus:border-indigo-300 hover:border-indigo-300 bg-indigo-500/90  rounded-lg">
                            <p>Add Friend</p>
                        </button>
                    </div>
                </div>
                <div className="Search">
                    <div className={`search-section  flex items-center ring ring-gray-3  gap-1   rounded-xl  px-2 overflow-hidden duration-50  ring-2 ring-gray-800  focus-within:ring-indigo-400  bg-gray-3`}>
                        <input type="text" placeholder="Start searching here" className="p-2 w-full placeholder:text-[0.9rem]  outline-none" />
                        <Search className="size-5" />
                    </div>
                </div>
            </div>
            {selectedCategory === "online" ?
                <div>
                    <div className="flex items-center text-sm gap-3">
                        <p>Online</p>
                        <span>-</span>
                        <span>{"2"}</span>
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        <FriendUser />
                    </div>
                </div>
                : selectedCategory === "all" ?
                    <div>
                        <div className="flex items-center text-sm gap-3">
                            <p>All friends</p>
                            <span>-</span>
                            <span>{"2"}</span>
                        </div>
                        <div className="flex flex-col gap-4 mt-2">
                            <FriendUser />
                        </div>

                    </div> : selectedCategory === "pending" && <div className="flex flex-col gap-2">
                        {pendingRequest.length === 0 ? <div></div> :
                            <>
                                {requestReceived.length === 0 ? null :
                                    <div className="flex flex-col">

                                        <div className="flex items-center text-sm gap-3">
                                            <p>Received</p>
                                            <span>-</span>
                                            <span>{"2"}</span>
                                        </div>
                                        <div className="flex flex-col gap-4 mt-2">
                                            {requestReceived.map((req) => {
                                                return <FriendRequest setPendingRequest={setPendingRequest} key={req.id} data={req} received={true} />

                                            })}
                                        </div>
                                    </div>
                                }
                                {requestSent.length === 0 ? null :

                                    <div className="flex flex-col">

                                        <div className="flex items-center text-sm gap-3">
                                            <p>Sent</p>
                                            <span>-</span>
                                            <span>{requestSent.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-4 mt-2">
                                            {requestSent.map((req) => {
                                                return <FriendRequest key={req.id} data={req} />

                                            })}
                                        </div>
                                    </div>
                                }
                            </>
                        }
                    </div>

            }
        </div>
    )
}