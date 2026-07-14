import { Axios } from "@/lib/axiosInstance"
import { create } from "zustand"
import { userStore } from "./user-store"
import { socketStore } from "./socket"
import { navigationStore } from "./navigation-store"
import { dbMessage } from "@/indexdb/indexdb-messagesRetry"
import axios from "axios"


let indexDb = new dbMessage()
export const chatStore = create((set, get) => ({

    replyingTo: {
        id: null,
        name: null
    },
    chats: [],
    setChats: (func) => {
        set((state) => ({
            chats: func(state.chats)
        }))
    },
    participants: new Map(),
    setParticipants: (userId, data) => set(state => ({
        participants: new Map(state.participants).set(userId, data)
    })),
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
    setSelectedChat: (chat) => {
        set({ selectedChat: { id: chat.id, userId: chat.userId } })
    },
    inviteComp: false,
    setInviteComp: (inviteComp) => set({ inviteComp }),
    messages: [],
    messagesRef: {},
    setMessagesRef: (messagesRef) => set({ messagesRef }),
    setMessages: (func) => {
        set(prev => ({
            messages: func(prev.messages)
        }))
    },
    typingIndicators: new Map(),
    setTypingIndicators: (func) => {
        set((state) => ({ typingIndicators: func(state.typingIndicators) }))
    },
    loading: false,
    setLoading: (loading) => set({ loading }),
    typingUsersInfo: "",
    setTypingUsersInfo: (typingUsersInfo) => set({ typingUsersInfo }),
    jumpingToMessageId: null,
    setJumpingToMessageId : (jumpingToMessageId) =>set({ jumpingToMessageId }),
    handleCreateGroup: async (data) => {
        let socket = socketStore.getState().socket
        let media = data.media
        let setChats = get().setChats
        let imageData = null

        try {


            if (media) {

                let formData = new FormData()
                formData.append("file", media)
                formData.append("upload_preset", "group-pfp")
                formData.append("folder", data.chatId)
                const res = await axios.post("https://api.cloudinary.com/v1_1/dsnrck9gn/auto/upload", formData)

                if (res.status === 200) {
                    let data = res.data

                    let secureUrl = data.secure_url
                    let publicId = data.public_id
                    imageData = { url: secureUrl, publicId, type: media.type, filename: media.name, size: media.size }

                }

            }
            let res = await Axios.post("/group/create", { ...data, media: imageData })

            if (res.status === 201) {
                let group = res.data.group
                setChats((prev) => {
                    return [group, ...prev]
                })
                socket.emit("group-created", { participantIds: data.participantIds, chatId: data.chatId })
            }
        } catch (error) {
            console.log(error?.response.data?.message || error.message)
        }
    },
    getChats: async () => {
        try {
            let setSearchTab = navigationStore.getState().setSearchTab
            let res = await Axios.get("/chat/chats")
            let participants = get().participants

            if (res.status === 200) {
                setSearchTab(false)
                let AllChats = res.data.chats
                let updatedData = AllChats.map((chat) => {

                    if (chat.isGroup) {
                        return chat
                    } else {
                        let dmUser = chat.userData

                        dmUser.isOnline = chat.isOnline

                        participants.set(dmUser.id, dmUser)
                        let data = {
                            id: chat.id,
                            userId: dmUser.id,
                            lastMessage: chat.lastMessage,
                            unread_messageCount: chat._count.messages,

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
    getChatById: async (chatInfo) => {

        try {
            let { chatId, userId, isGroup, fetchAgain, containerRef } = chatInfo
            if (!fetchAgain) {

                set({ loading: true })
            }
            let socket = socketStore.getState().socket
            let setChats = get().setChats
            let selectedPage = navigationStore.getState().selectedPage
            let setSelectedPage = navigationStore.getState().setSelectedPage
            let participants = get().participants

            if (selectedPage === "friends") {
                setSelectedPage("main")
            }
            let selectedChat = get().selectedChat
            if (selectedChat?.id === chatId && !fetchAgain) return



            if (!fetchAgain) {

                set({ messages: [] })
            }

            let res = await Axios.get(`/chat/${chatId}`)

            if (res.status === 200) {

                let { messages, participants: Participants } = res.data.chat

                if (!fetchAgain) {

                    if (isGroup) {
                        let updatedData = Participants.map(({ user }) => {
                            if (!participants.has(user.id)) {

                                participants.set(user.id, user)
                            }
                            return user
                        })

                        set({ selectedChat: { id: chatId, name: chatInfo.name, image: chatInfo?.image?.url, isGroup, total_members: Participants.length + 1, Participants: updatedData } })



                    } else {
                        set({ selectedChat: { id: chatId, isGroup, userId } })
                    }
                    socket.emit("join-chat", chatId)
                }


                let failedMessages = await indexDb.getAllMessages(chatId)
                messages.reverse()
                set({ messages: [...messages, ...failedMessages] })

                let updateStatus = await Axios.put(`/message/mark-asread?chatId=${chatId}`)

                if (updateStatus.status === 200) {
                    setChats((chats) => {
                        return chats.map((chat) => {
                            if (chat.id === chatId) {
                                return { ...chat, unread_messageCount: 0 }
                            }
                            return chat
                        })
                    })
                    let data = updateStatus.data
                    if (data === null) return
                    if (data.count > 0) {
                        let statusData = updateStatus.data
                        socket.emit("mark-asRead", { chatId, readAt: statusData.readAt })
                    }
                }
            }
        } catch (error) {
            console.log(error?.message || error?.response?.data?.message)
        } finally {
            set({ loading: false })
        }
    },
    getParticipants: () => {
        const selectedChat = get().selectedChat
        const participants = get().participants
        const session = userStore.getState().session
        const user = session.user
        const userData = {
            id: user.id,
            image: user.image,
            lastseen: user.lastseen,
            name: user.name,
            username: user.username
        }
        let chatParticipants = []
        if (selectedChat.isGroup) {
            chatParticipants = selectedChat.Participants
        } else {
            chatParticipants.push(participants.get(selectedChat.userId))
        }
        return [userData, ...chatParticipants]
    },
   
    LoadMoreMessage : async (type , order , messageId)=>{
        try {
            let chatId = get().selectedChat.id

            let msgId;
            if (type === "chat-messages"){
                let messages = get().messages
                msgId = order === "asc" ? messages[messages.length - 1].id : messages[0].id
            }else if (type === "chat-messages-search"){
                msgId = messageId
              
            }
            if (!msgId || !chatId) return true
            let res = await Axios.get(`/message/get-moreMessages?messageId=${msgId}&chatId=${chatId}&order=${order}&limit=${order === "asc" ? 31 : 30}`)

            if (get().selectedChat.id !== chatId) return

            if (res.status !== 200) return
            let { messages } = res.data
            return messages
        } catch (error) {
            console.log(error.message)
        }
    }
    ,
    JumpToMessage: async (data) => {
        
        try {
            const messages = get().messages
            let firstMessage = messages[0]
            let lastMessage = messages[messages.length - 1]
          
            if (data.createdAt >= firstMessage.createdAt && data.createdAt <= lastMessage.createdAt) {
                set({jumpingToMessageId :data.id })
                return
            }
            let res = await Axios.get(`/message/jump-message?chatId=${data.chatId}&messageId=${data.id}&limit=${20}`)
          
            if (res.status === 200) {
                let fetchedMessages = res.data.messages
                    set({messages : fetchedMessages})
                
                set({jumpingToMessageId :data.id })

            }
        } catch (error) {
            console.log(error?.response.data.message || error?.message)
        }
    },
    handleCloseChat: () => {
        try {
            let socket = socketStore.getState().socket
            let selectedChat = get().selectedChat
            socket.emit("leave-chat", selectedChat.id)
            set({ selectedChat: null })
            set({ messages: [] })
        } catch (error) {
            console.log(error.message)
        }
    },
    handleGroupCreated: async (chatId) => {
        const setChats = get().setChats
        try {
            let res = await Axios.get(`/chat/chatinfo?chatId=${chatId}`)
            if (res.status === 200) {
                let group = res.data.chat
                setChats((prev) => {
                    return [group, ...prev]
                })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

}))