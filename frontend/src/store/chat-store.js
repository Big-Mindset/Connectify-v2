import { Axios } from "@/lib/axiosInstance"
import { create } from "zustand"
import { userStore } from "./user-store"
import { socketStore } from "./socket"
// const messages = [
//   {
//     id: "m1",
//     senderId: "user1",
//     chatId: "dm1",
//     content: "Hey Ahmed, are you free today?",
//     replyToId: null,
//     replyTo: null,
//     replies: [],
//     sender: { id: "user1", name: "Ali", email: "ali@example.com" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:00:00Z"),
//     updatedAt: new Date("2026-02-15T09:00:00Z"),
//     media: [],
//     status: "READ"
//   },
//   {
//     id: "m2",
//     senderId: "user2",
//     chatId: "dm1",
//     content: "Yeah bro, what's up?",
//     replyToId: "m1",
//     replyTo: {
//       id: "m1",
//       content: "Hey Ahmed, are you free today?",
//       sender: { name: "Ali" },
//       media: [] // no media in original message
//     },
//     replies: [],
//     sender: { id: "user2", name: "Ahmed", email: "ahmed@example.com" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:02:00Z"),
//     updatedAt: new Date("2026-02-15T09:02:00Z"),
//     media: [],
//     status: "READ"
//   },
//   {
//     id: "m3",
//     senderId: "user1",
//     chatId: "dm1",
//     content: "Can we meet at 6 PM?",
//     replyToId: null,
//     replyTo: null,
//     replies: [],
//     sender: { id: "user1", name: "Ali" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:05:00Z"),
//     updatedAt: new Date("2026-02-15T09:05:00Z"),
//     media: [],
//     status: "DELIVERED"
//   },
//   {
//     id: "m4",
//     senderId: "user2",
//     chatId: "dm1",
//     content: "Sure 👍",
//     replyToId: "m3",
//     replyTo: {
//       id: "m3",
//       content: "Can we meet at 6 PM?",
//       sender: { name: "Ali" },
//       media: [] // no media in original message
//     },
//     replies: [],
//     sender: { id: "user2", name: "Ahmed" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:06:00Z"),
//     updatedAt: new Date("2026-02-15T09:06:00Z"),
//     media: [],
//     status: "READ"
//   },
//   {
//     id: "m5",
//     senderId: "user1",
//     chatId: "dm1",
//     content: null,
//     replyToId: null,
//     replyTo: null,
//     replies: [],
//     sender: { id: "user1", name: "Ali" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:10:00Z"),
//     updatedAt: new Date("2026-02-15T09:10:00Z"),
//     media: [
//       { id: "media1", type: "IMAGE", url: "https://example.com/meeting-location.jpg" }
//     ],
//     status: "SENT"
//   },
//   {
//     id: "m6",
//     senderId: "user2",
//     chatId: "dm1",
//     content: "Nice location 🔥",
//     replyToId: "m5",
//     replyTo: {
//       id: "m5",
//       content: null,
//       sender: { name: "Ali" },
//       media: [{ type: "IMAGE" }] // added media type info
//     },
//     replies: [],
//     sender: { id: "user2", name: "Ahmed" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:12:00Z"),
//     updatedAt: new Date("2026-02-15T09:12:00Z"),
//     media: [],
//     status: "READ"
//   }
// ];


export const chatStore = create((set, get) => ({
    replyingTo: {
        id: null,
        name: null
    },
    chats: [],
    participants: new Map(),
    setParticipants: (userId, data) => set(state => ({
        participants: new Map(state.participants).set(userId, data)
    })),
    chatMembersIds: new Map(),
    setChatMembersIds: (chatMembersIds) => set({ chatMembersIds }),
    setChats: (func) => {
        set((prev) => ({ chats: func(prev.chats) }))
    },
    filteredChats: [],
    setFilteredChats: (func) => {
        set((prev) => ({ filteredChats: func(prev.filteredChats) }))
    },
    setReplyingTo: (data) => {
        set({ replyingTo: data })
    },
    selectedChat: null,
    setSelectedChat: (chatId) => {
        set({selectedChat : chatId})
    },
    inviteComp: false,
    setInviteComp: (inviteComp) => set({ inviteComp }),
    messages: [],
    setMessages: (func) => {
        set(prev => ({
            messages: func(prev.messages)
        }))
    },
    getChats: async (userId) => {
        try {
            let res = await Axios.get("/chat/chats")
            if (res.status === 200) {
                let AllChats = res.data.allFriends
                let updatedData = AllChats.map((chat) => {
                    let chatMembersIds = get().chatMembersIds
                    let participants = get().participants
                    chatMembersIds.set(chat.id, chat.participants.map(({ user }) => user.id))

                    chat.participants.forEach(({ user }) => {
                        participants.set(user.id, { name: user.name, username: user.username, image: user.image, isOnline: chat.isOnline, lastseen: user.lastseen })
                    });
                    if (chat.isGroup) {
                        return chat
                    } else {
                        let { user } = chat.participants.find(({ user }) => user.id !== userId)

                        let data = {
                            id: chat.id,
                            userId: user.id,
                            lastMessage: chat.lastMessage,
                            unread_messageCount: chat._count.messages
                        }
                        return data
                    }
                })
                set({ chats: updatedData })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    getChatById: async (chatId , userId) => {
        try {
            let socket = socketStore.getState().socket
            let res = await Axios.get(`/chat/${chatId}`)
            if (res.status === 200) {
                let {messages , id} = res.data.chat
              
                socket.emit("join-chat", chatId)
                set({selectedChat :{id : id , userId : userId} })
                set({messages :messages.reverse() })
               
            }
        } catch (error) {
            console.log(error?.message || error?.response?.data?.message)
        }
    },

}))