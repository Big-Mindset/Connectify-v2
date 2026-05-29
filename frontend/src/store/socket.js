import { Peer } from "peerjs"

import { create } from "zustand"
import { io } from "socket.io-client"
import { getPeerId } from "@/app/action/getPeerId"
import { chatStore } from "./chat-store"
import { chatMessageStore } from "./chatMessage-store"

export let socketStore = create((set, get) => ({

    socket: null,
    peer: null,
    audioStream: null,
    connectSocket: (userId) => {
        if (!userId) return
        let socket = get().socket
        if (socket?.connected) {
            return
        }
        let sok = io("http://localhost:2525", {
            auth: {
                userId,
            }
        })
        let setParticipants = chatStore.getState().setParticipants
        let participants = chatStore.getState().participants
        sok.on("connect", async () => {
            sok.emit("message-deliverd-all", null)
            sok.on("online-user", (id) => {
                let user = participants.get(id)
                setParticipants(id, { ...user, isOnline: true })
            })
            sok.on("offline-user", (id) => {
                let user = participants.get(id)

                setParticipants(id, { ...user, isOnline: false })
            })


            let setChats = chatStore.getState().setChats

            sok.on("message-notification", (message) => {
                sok.emit("message-delivered", { chatId: message.chatId, id: message.id, senderId: message.senderId })
                setChats((chats)=> {
                    return chats.map((chat) => {
                        if (chat.id === message.chatId) {
                            return { ...chat, lastMessage: { ...chat.lastMessage, content: message.content, updatedAt: message.updatedAt } }
                        }
                        return chat
                    })
                })

            })



        })
        set({ socket: sok })
    },
    handleMarkAllAsRead: (data) => {

        try {


            let setMessages = chatStore.getState().setMessages
            let setChats = chatStore.getState().setChats
            let selectedChat = chatStore.getState().selectedChat
            if (selectedChat.id !== data.chatId) return
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
    handleUpdateAllToDelivered: (data) => {
        let setMessages = chatStore.getState().setMessages
        let selectedChat = chatStore.getState().selectedChat

        if (selectedChat.id === data.chatId) {

            setMessages((msgs) => {
                return msgs.map((msg) => {
                    if (data.messages[msg.id]) {
                        let status = {
                            id: crypto.randomUUID(),
                            deliveredAt: data.deliveredAt,
                            userId: data.userId,
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
    disconnectSocket: () => {
        let socket = get().socket
        if (socket?.connected) {
            socket?.disconnect()
        }
        set({ socket: null })
    },
    Peer: async (userId) => {
        if (get().peer) {
            return
        }
        var peer = new Peer(userId, {
            host: "localhost",
            port: 2525,
            path: "/peerjs"

        });

        set({ peer: peer })
        let stream = get().audioStream
        peer.on("open", async (id) => {
            get().socket?.emit("register-peer-socket", id)
            if (!stream) {

                // stream = await navigator.mediaDevices.getUserMedia({
                //     audio: true
                // })
            }
            set({ audioStream: stream })

        })
        peer.on("call", (call) => {
            call.answer(stream)
            call.on("stream", (remoteStream) => {
            });
        })
        peer.on("close", () => {
            set({ peer: null })
        })

    },
    audioCall: async (userIds) => {
        let stream = get().audioStream
        let peer = get().peer
        let peerIds = await getPeerId(userIds)
        peerIds.forEach((id) => {
            let call = peer.call(id, stream)
            call.on("stream", (stream) => {
            })
        })
    }
}))