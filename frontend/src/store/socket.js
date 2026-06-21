
import { create } from "zustand"
import { io } from "socket.io-client"
import { chatStore } from "./chat-store"
import { messageSettingsStore } from "./messageSettings-store"
import { navigationStore } from "./navigation-store"
import { userStore } from "./user-store"
import { Axios } from "@/lib/axiosInstance"

export let socketStore = create((set, get) => ({

    socket: null,
    sessionStatus: null,
    connecting: false,
    setSessionStatus: (sessionStatus) => set({ sessionStatus }),
    connectSocket: (userId) => {
        if (!userId) return
        let { socket, connecting } = get()
        if (socket?.connected && socket.auth.userId === userId) {
            return
        }
        if (connecting) return
        set({ connecting: true })
        let sok = io("http://localhost:2525", {
            auth: {
                userId,
            }
        })
        let handleDeleteMessageFromUI = messageSettingsStore.getState().handleDeleteMessageFromUI
        let handleUpdateAllToDelivered = get().handleUpdateAllToDelivered
        let setParticipants = chatStore.getState().setParticipants
        let participants = chatStore.getState().participants
        let handleMarkAllAsRead = get().handleMarkAllAsRead
        let setOnlineUsers = userStore.getState().setOnlineUsers
        let heartbeat = null
        sok.on("connect", async () => {
            set({ connecting: false })
            set({ socket: sok })
            sok.emit("message-deliverd-all")

            clearInterval(heartbeat)
            heartbeat = setInterval(() => {
                sok.emit("heartbeat")

            }, 15000)
        })
        sok.on("disconnect", () => {
            set({ connecting: false })
            clearInterval(heartbeat)
            get().disconnectSocket()
        })
        sok.on("session:conflict", ({ message }) => {

            set({ sessionStatus: "session:conflict" })
        })
        sok.on("session:terminated", (message) => {

            set({ sessionStatus: "session:terminated" })
            get().disconnectSocket()
        })
        sok.on("mark-asRead", handleMarkAllAsRead)
        sok.on("updateToDelivered", handleUpdateAllToDelivered)

        sok.on("typing",(data)=>{

           let setTypingIndicators = chatStore.getState().setTypingIndicators
           setTypingIndicators((prev)=>{
            let typingIndicators = new Map(prev)
            let value = typingIndicators.get(data.chatId)
            if (!value){
                value = new Set()
            }
            value.add(data.userId)
            typingIndicators.set(data.chatId , value)
            return typingIndicators
           })

        })
        sok.on("stop-typing",(data)=>{
             let setTypingIndicators = chatStore.getState().setTypingIndicators
           setTypingIndicators((prev)=>{
            let typingIndicators = new Map(prev)
            let value = typingIndicators.get(data.chatId)
            if (!value){
                return prev
            }
            value.delete(data.userId)
            typingIndicators.set(data.chatId , value)
            if (value.size=== 0){
                typingIndicators.delete(data.chatId)
            }
            return typingIndicators
           })
            
        })

        sok.on("online-user", async (id) => {
            let user = participants.get(id)

            setParticipants(id, { ...(user || {}), isOnline: 1 })
            let selectedPage = navigationStore.getState().selectedPage

            if (selectedPage === "friends") {
                let res = await Axios.get(`/friendship/user-data?userId=${id}`)
               
                if (res.status === 200) {

                    setOnlineUsers((prev) => {
                        return [...prev, res.data.userData]
                    })
                }
            }
        })



        sok.on("offline-user", (id) => {
            let user = participants.get(id)
            setParticipants(id, { ...(user || {}), isOnline: 0 })

            setOnlineUsers((prev) => {
                return prev.filter((user)=>user.id !== id)
            })
        })


        let setChats = chatStore.getState().setChats

        sok.on("message-notification", (message) => {

            sok.emit("message-delivered", { chatId: message.chatId, id: message.id, senderId: message.senderId })
            setChats((chats) => {
                return chats.map((chat) => {
                    if (chat.id === message.chatId) {
                        return {
                            ...chat, lastMessage: { content: message.content, updatedAt: message.updatedAt, senderId: message.senderId, id: message.id, media: message.media?.map((media) => media.type), status: message.status, createdAt: message.createdAt, updatedAt: message.updatedAt }
                            , unread_messageCount: (chat.unread_messageCount || 0) + 1
                        }
                    }
                    return chat
                })
            })

        })
        sok?.on("delete-message", handleDeleteMessageFromUI)





    },
    handleMarkAllAsRead: (data) => {

        try {

            let setMessages = chatStore.getState().setMessages
            let setChats = chatStore.getState().setChats
            let selectedChat = chatStore.getState().selectedChat
            if (selectedChat?.id === data.chatId) {

                setMessages((messages) => {
                    return messages.map((msg) => {
                        return {
                            ...msg, status: msg.status.map((status) => {
                                if (status.userId === data.userId && status.status !== "READ") {
                                    return { ...status, readAt: data.readAt, status: "READ" }
                                }
                                return status
                            })
                        }
                    })
                })
            }
            setChats((chats) => {
                return chats.map((chat) => {
                    if (chat.id === data.chatId) {

                        return {
                            ...chat, lastMessage: {
                                ...chat.lastMessage, status: chat.lastMessage.status.map((status) => {
                                    if (status.userId === data.userId && status.status !== "READ") {
                                        return { ...status, readAt: data.readAt, status: "READ" }
                                    }
                                    return status
                                })
                            }
                        }
                    }
                    return chat
                })
            })
        } catch (error) {
            console.log(error.message)
        }

    },
    handleReceiveMessage: (message) => {
        let socket = get().socket
        let setChats = chatStore.getState().setChats
        let setMessages = chatStore.getState().setMessages
        if (message.createdAt === message.updatedAt) {

            socket.emit("message-read", { chatId: message.chatId, id: message.id, senderId: message.senderId })
            setChats((chats) => {
                return chats.map((chat) => {
                    if (chat.id === message.chatId) {
                        return { ...chat, lastMessage: message }
                    }
                    return chat
                })
            })

            setMessages((msgs) => {
                return [message, ...msgs]
            })
        } else {
            setMessages((msgs) => {
                return msgs.map((msg) => {
                    if (msg.id === message.id) {
                        return { ...msg, content: message.content, updatedAt: message.updatedAt }
                    }
                    return msg
                })
            })
            setChats((chats) => {
                return chats.map((chat) => {
                    if (chat.id === message.chatId) {
                        return { ...chat, lastMessage: { ...chat.lastMessage, content: message.content, updatedAt: message.updatedAt } }
                    }
                    return chat
                })
            })
        }




    },
    handleUpdateAllToDelivered: (prettyData, payload) => {
        let setMessages = chatStore.getState().setMessages
        let selectedChat = chatStore.getState().selectedChat
        let setChats = chatStore.getState().setChats
        let { deliveredAt, userId } = payload
        let selectedChatMessage = prettyData[selectedChat?.id]
        let uniqueId = crypto.randomUUID()
        if (selectedChatMessage && selectedChatMessage.length > 0) {
            let chatMessagesSet = new Set(selectedChatMessage)
            setMessages((msgs) => {
                return msgs.map((msg) => {
                    if (chatMessagesSet.has(msg.id)) {
                        let status = {
                            id: uniqueId,
                            deliveredAt,
                            userId,
                            status: "DELIVERED",

                        }
                        return {
                            ...msg, status: [...msg.status, status]
                        }
                    }
                    return msg
                })
            })
        }

        setChats((chats) => {
            return chats.map((chat) => {
                if (prettyData[chat.id]) {
                    let status = {
                        id: uniqueId,
                        deliveredAt,
                        userId,
                        status: "DELIVERED",

                    }
                    return { ...chat, lastMessage: { ...chat.lastMessage, status: [...chat.lastMessage.status, status] } }
                }
                return chat
            })
        })


    },
    handleDeliverMessage: (data) => {

        let setMessages = chatStore.getState().setMessages
        let setChats = chatStore.getState().setChats
        setChats((chats) => {
            return chats.map((chat) => {
                if (chat.id === data.chatId) {
                    return {
                        ...chat, lastMessage: {
                            ...chat.lastMessage, deliveredAt: chat.deliveredAt,
                            status: [...chat.lastMessage.status, data.status]
                        }
                    }
                }
                return chat
            })
        })

        setMessages((msgs) => {
            return msgs.map((msg) => {
                if (msg.id === data.messageId) {
                    return {
                        ...msg, status: [...msg.status, data.status]
                    }
                }
                return msg
            })
        })
    },
    handleReadMessage: (data) => {

        let setMessages = chatStore.getState().setMessages
        let setChats = chatStore.getState().setChats

        setChats((chats) => {
            return chats.map((chat) => {
                if (chat.id === data.chatId) {
                    return {
                        ...chat, lastMessage: {
                            ...chat.lastMessage,
                            status: [...chat.lastMessage.status, data.status]
                        }
                    }
                }
                return chat
            })
        })

        setMessages((msgs) => {
            return msgs.map((msg) => {
                if (msg.id === data.messageId) {
                    return {
                        ...msg, status: [...msg.status, data.status]
                    }
                }
                return msg
            })
        })
    },
    handleReactionUpdates: ({ action, reaction }) => {

        let updateMessageReactions = messageSettingsStore.getState().updateMessageReactions
        updateMessageReactions(action, reaction)

    },
    disconnectSocket: () => {

        set({ socket: null })
    },
}))