import { Axios } from "@/lib/axiosInstance";
import Avatar from "../Avatar";
import toast from "react-hot-toast";
import { socketStore } from "@/store/socket";
import { userStore } from "@/store/user-store";
import { chatStore } from "@/store/chat-store";
import { useLoading } from "@/lib/loading_hook";
import { Loader2 } from "lucide-react";
export default function FriendRequest({ data, received }) {
    let user = data.user
    let setPendingRequest = userStore(s => s.setPendingRequest)
    let setChats = chatStore(s => s.setChats)
    let socket = socketStore(s => s.socket)
    let chatMembersIds = chatStore(s => s.chatMembersIds)
    let participants = chatStore(s => s.participants)
    let {loading , setLoading} = useLoading()
    const handleRejectRequest = async () => {
        try {
            let res;
            setLoading("rejecting-request")
            if (received) {

                res = await Axios.put(`/friendship/reject-request?requestId=${data.id}`)
            } else {
                res = await Axios.delete(`/friendship/cancel-request?id=${data.id}`)

            }
            if (res.status === 200) {
                socket.emit("reject-cancel-request", { userId: user.id, requestId: data.id, event: received ? "rejected" : "cancelled", name: user.name })
                setPendingRequest((prev) => {
                    return prev.filter(req => req.id !== data.id)
                })
            }
        } catch (error) {
            console.log(error.message)
            toast.error(error.response?.data?.message)
        }finally{
            setLoading("")
        }
    }

    const handleAcceptRequest = async () => {
        try {
            setLoading("accepting-request")
            let res = await Axios.post("/friendship/accept-request", { id: data.id })

            if (res.status === 201) {
                
                let chat = res.data.chat


                chatMembersIds.set(chat.id, chat.userData.userId)


                let dmUser = chat.userData
                participants.set(dmUser.id, dmUser)
                let chatData = {
                    id: chat.id,
                    userId: dmUser.id,
                    name: dmUser.name,
                    lastMessage: chat.lastMessage,
                    unread_messageCount: chat.unread_messageCount,

                }
                
                setPendingRequest((prev) => {
                    return prev.filter(req => req.id !== data.id)
                })
                setChats((prev) => {
                    return [chatData, ...prev]
                })
                socket.emit("accept-request",{chatId : chat.id,userId : dmUser.id , requestId : data.id})

            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }finally{
            setLoading("")
        }
    }
    console.log(data)
    return (
        <div className="flex justify-between  p-2 items-center ">

            <div className="flex items-center gap-2">

                <Avatar image={user.image} />
                <div className="flex flex-col text-sm">
                    <p className="font-medium font-bold">{user.name}</p>
                    <p className="text-gray-12">{user.username}</p>
                </div>
            </div>
            <div className="flex items-center text-gray-400 gap-2">
                <button disabled={loading === "accepting-request"} onClick={handleRejectRequest} className="bg-black group  relative hover:border-indigo-500 border-2 border-gray-900 cursor-pointer px-3 py-2 rounded-full">
                 
                    <i className="fa-regular fa-x"></i>
                    

                </button>

                <div className="relative">




                    {received &&
                        <button onClick={handleAcceptRequest} className="bg-black group  relative hover:border-indigo-500 border-2 border-gray-900 cursor-pointer px-3 py-2 rounded-full">
                             {loading === "accepting-request" ? <Loader2 className="animate-spin text-gray-300 " /> : 
                            <i className="fa-solid fa-check"></i>
                            }

                        </button>
                    }

                </div>
            </div>
        </div>
    )
}