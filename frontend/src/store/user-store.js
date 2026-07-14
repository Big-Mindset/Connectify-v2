import { Axios } from "@/lib/axiosInstance";
import { navigationStore } from "./navigation-store";
import toast from "react-hot-toast";
import { chatStore } from "./Chat-store";

const { create } = require("zustand");

export const userStore = create((set, get) => ({
    session: null,
    setSession: (session) => set({ session }),
    allFriends: [],
    setAllFriends: ((func) => {
        set(state => ({ allFriends: func(state.allFriends) }))
    }),
    pendingRequest: [],
    setPendingRequest: ((func) => {
        set(state => ({ pendingRequest: func(state.pendingRequest) }))
    }),
    onlineUsers: [],
    setOnlineUsers: ((func) => {
        set(state => ({ onlineUsers: func(state.onlineUsers) }))
    }),

    handleReceiveFriendRequest: async (payload) => {

        let selectedPage = navigationStore.getState().selectedPage
        let setPendingRequest = get().setPendingRequest

        try {
            if (selectedPage === "friends") {

                let res = await Axios.get(`/friendship/get-request?requestId=${payload.requestId}`)
                if (res.status === 200) {
                    let requestData = res.data.request
                    if (requestData.id) {
                        setPendingRequest((prev) => {
                            return [...prev, requestData]
                        })
                    }
                }
            } else {

                toast.success(`${payload.name} sent you a friend request`, { style: { background: "black" } })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    handleRejectCancelRequest: (data) => {
   
        let selectedPage = navigationStore.getState().selectedPage
        let setPendingRequest = get().setPendingRequest

        if (selectedPage === "friends") {

            setPendingRequest((prev) => {
                return prev.filter((request) => request.id !== data.requestId)
            })
        }
        if (data.event === "rejected") {
            toast(`${data.name} rejected your friend-request`)
        } else {
            toast(`${data.name} cancelled the friend-request`)

        }
    },
    handleAcceptRequest: async (data) => {
      
        let selectedPage = navigationStore.getState().selectedPage
        let setPendingRequest = get().setPendingRequest
        let setChats = chatStore.getState().setChats
        let participants = chatStore.getState().participants
        let res = await Axios.get(`/chat/chatinfo?chatId=${data.chatId}`)
  
        if (res.status === 200) {
            let chat = res.data.chat
            let dmUser = chat.userData
            participants.set(dmUser.id, dmUser)
            let chatData = {
                id: chat.id,
                userId: dmUser.id,
                name: dmUser.name,
                lastMessage: chat.lastMessage,
                unread_messageCount: chat.unread_messageCount,

            }
            setChats((prev) => {
                return [chatData, ...prev]
            })
            if (selectedPage === "friends") {
    
                setPendingRequest((prev) => {
                    return prev.filter((request) => request.id !== data.requestId)
                })
            }
            
            toast(`${dmUser.name} accepted your friend-request`)
        }

    }
}))