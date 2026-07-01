import { create } from "zustand"
import { chatStore } from "./Chat-store"
import { socketStore } from "./socket"
import axios from "axios"
import { Axios } from "@/lib/axiosInstance"
import { messageSettingsStore } from "./messageSettings-store"
import { userStore } from "./user-store"
import { dbMessage } from "@/indexdb/indexdb-messagesRetry"

let indexDb = new dbMessage()
export let chatMessageStore = create((set, get) => ({
    messagesProgress: {},
    sendMessage: async (messageData, isAttempt, fetchLatest) => {

        let socket = socketStore.getState().socket
        let selectedChat = chatStore.getState().selectedChat
        let setMessages = chatStore.getState().setMessages
        let filePreview = messageData.media


        if (!isAttempt && !fetchLatest?.current) {

            setMessages((messages) => {

                return [...messages, messageData]
            })
        } else {
            let currentDate = new Date()
            messageData.createdAt = currentDate
            messageData.updatedAt = currentDate

        }
        try {
            if (filePreview.length) {

                const uploads = filePreview.map((fileData) => {
                    const formData = new FormData();
                    formData.append("file", fileData.file);
                    formData.append("upload_preset", "message-media");
                    formData.append("folder", messageData.chatId);
                    return axios.post(
                        "https://api.cloudinary.com/v1_1/dsnrck9gn/auto/upload",
                        formData,
                        {

                            onUploadProgress: (event) => {
                                const percent = Math.round(
                                    (event.loaded * 100) / event.total
                                );
                                set(prev => {
                                    let prevPercentage = prev.messagesProgress?.[messageData.id] || {}
                                    return { messagesProgress: { ...prev.messagesProgress, [messageData.id]: { ...prevPercentage, [fileData.id]: percent } } }
                                }

                                )

                            }
                        }
                    );
                });

                const results = await Promise.all(uploads);
                let completeMediaData = filePreview.map((media, idx) => {
                    let { file, ...rest } = media
                    let data = results[idx].data
                    return { ...rest, url: data.secure_url, publicId: data.public_id, size: data.bytes }
                })
                if (!fetchLatest.current) {

                    setMessages((messages) => {
                        return messages.map((msg) => {
                            if (msg.id === messageData.id) {
                                return { ...msg, media: completeMediaData }
                            }
                            return msg
                        })
                    })
                }

                messageData.media = completeMediaData
            }

            let { progress, ...rest } = messageData
            let res = await Axios.post('/message/create-message', { ...rest, userId: selectedChat.userId })
            if (res.status === 201) {
                let message = res.data.message

                if (message?.id) {
                    if (isAttempt) {
                        await indexDb.deleteMessage(message.id)
                    }
                    let updatedMessage = get().handleMessageSent(message, isAttempt, fetchLatest)

                    socket?.emit("send-message", updatedMessage)
                }
                return { status: 200 }

            }
        } catch (error) {

            if (error?.response?.status === 429 && error?.response?.statusText === "Too Many Requests") {

                setMessages((messages) => {
                    return messages.filter((msg) => msg.id !== messageData.id)
                })
                return { status: 429 }
            } else if (error?.message === "Network Error") {
                if (isAttempt === "auto-retry") return "Network Error"
                let RetryMessage = get().RetryMessage
                RetryMessage(messageData)




            }
        }
    },
    handleMessageSent: (message, retryAttempt, fetchLatest) => {
        let setMessages = chatStore.getState().setMessages
        let setChats = chatStore.getState().setChats
        let lastMessage = null
        if (!fetchLatest?.current) {

            setMessages((messages) => {
                let updatedMessage = messages.map((msg) => {
                    if (msg.id === message.id) {

                        lastMessage = { ...msg, status: message.status }
                        return lastMessage
                    }
                    return msg
                })
                if (retryAttempt === "manual-retry") {
                    updatedMessage.sort((a, b) => b.createdAt - a.createdAt)
                }
                return updatedMessage
            })
        }
        setChats((chats) => {
            return chats.map((chat) => {
                if (chat.id === lastMessage.chatId) {
                    return { ...chat, lastMessage }
                }
                return chat
            })
        })
        return lastMessage
    },
    handleEditMessage: async (content) => {
        let message = messageSettingsStore.getState().editMessage
        let socket = socketStore.getState().socket
        let handleDeleteMessage = messageSettingsStore.getState().handleDeleteMessage
        let setMessages = chatStore.getState().setMessages
        let selectedChat = chatStore.getState().selectedChat
        if (!content.trim() && !message.media) {
            handleDeleteMessage(message)
            return
        }

        try {
            let editObject = { senderId: message.senderId, id: message.id, content }
            let res = await Axios.put("/message/edit-message", editObject)
            if (res.status === 200) {




                let { messageId, updatedAt } = res.data
                if (!messageId) {
                    console.log("error editing message")
                    return
                }

                setMessages((messages) => {
                    return messages.map((msg) => {
                        if (msg.id === messageId) {
                            return { ...msg, content, updatedAt }
                        }
                        return msg
                    })
                })
                socket.emit("send-message", { content, updatedAt, chatId: selectedChat.id, id: messageId })
            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleDeleteMessage: async () => {
        let deleteMessage = messageSettingsStore.getState().deleteMessage
        let setDeleteMessage = messageSettingsStore.getState().setDeleteMessage
        let handleDeleteMessageFromUI = messageSettingsStore.getState().handleDeleteMessageFromUI
        let socket = socketStore.getState().socket

        try {

            let res = await Axios.delete(`/message/delete-message`, { data: { messageId: deleteMessage.id, senderId: deleteMessage.senderId, chatId: deleteMessage.chatId } })

            if (res.status === 200) {
                let isLastMessage = handleDeleteMessageFromUI({ chatId: deleteMessage.chatId, id: deleteMessage.id })

                socket.emit("delete-message", { chatId: deleteMessage.chatId, id: deleteMessage.id, isLastMessage })
            }
            setDeleteMessage(null)
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleReaction: async (emoji) => {
        let reactMessage = messageSettingsStore.getState().reactMessage
        let setReactMessage = messageSettingsStore.getState().setReactMessage
        let updateMessageReactions = messageSettingsStore.getState().updateMessageReactions
        let selectedChat = chatStore.getState().selectedChat
        let session = userStore.getState().session
        let socket = socketStore.getState().socket
        let reactionData = {
            id: crypto.randomUUID(),
            emoji: emoji.native,
            name: emoji.name,
            messageId: reactMessage.id,
            reactors: [{
                id: crypto.randomUUID(),
                userId: session.user.id
            }]
        }
        try {
            let res = await Axios.post(`/message/create-reaction`, reactionData)
            if (res.status === 201) {
                socket.emit("reaction-updates", { action: "create", reaction: reactionData }, selectedChat.id)

                updateMessageReactions("create", { ...reactionData })

            }
            setReactMessage(null)
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleDeleteReaction: async (reactionId, messageId) => {
        let selectedChat = chatStore.getState().selectedChat

        let socket = socketStore.getState().socket
        let updateMessageReactions = messageSettingsStore.getState().updateMessageReactions

        try {
            let res = await Axios.delete(`/message/delete-reaction`, { data: { reactionId } })
            if (res.status === 200) {
                socket.emit("reaction-updates", { action: "delete", reaction: { reactionId, messageId } }, selectedChat.id)
                updateMessageReactions("delete", { reactionId, messageId })


            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleRemoveReaction: async (reactionProps) => {
        let updateMessageReactions = messageSettingsStore.getState().updateMessageReactions
        let selectedChat = chatStore.getState().selectedChat
        let socket = socketStore.getState().socket

        try {
            let res = await Axios.delete(`/message/remove-reaction`, { data: { id: reactionProps.reactorId } })
            if (res.status === 200) {
                socket.emit("reaction-updates", { action: "remove", reaction: { id: reactionProps.id, messageId: reactionProps.messageId, reactorId: reactionProps.reactorId } }, selectedChat.id)
                updateMessageReactions("remove", { ...reactionProps })

            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleAddReaction: async (reactionProps) => {
        let updateMessageReactions = messageSettingsStore.getState().updateMessageReactions
        let selectedChat = chatStore.getState().selectedChat
        let socket = socketStore.getState().socket

        try {
            let res = await Axios.post(`/message/add-reaction`, { reactionId: reactionProps.id, reactorId: reactionProps.reactorId })

            if (res.status === 201) {
                socket.emit("reaction-updates", { action: "add", reaction: { ...reactionProps } }, selectedChat.id)

                updateMessageReactions("add", { ...reactionProps })

            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },

    RetryMessage: async (messageData) => {
        let delay = 250
        let sleep = () => {
            delay *= 2
            let jitter = Math.random() * 500
            let totalDelay = delay + jitter
            new Promise((res) => {

                setTimeout(() => {
                    res()
                }, totalDelay)
            })
        }
        let MAX_ATTEMPTS = 3
        let sendMessage = get().sendMessage
        let setMessages = chatStore.getState().setMessages
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {

            let res = await sendMessage(messageData, "auto-retry")

            if (res.status === 200) {
                return
            } else if (res === "Network Error") {

                if (attempt === 3) {

                    setMessages((messages) => {
                        return messages.map((msg) => {
                            if (msg.id === messageData.id) {
                                return { ...msg, status: "FAILED", createdAt: null, updatedAt: null }
                            }
                            return msg
                        })
                    })
                    await indexDb.addMessage({ ...messageData, status: "FAILED", createdAt: null, updatedAt: null })

                    return
                }
                sleep()
            }
        }
    }

}))