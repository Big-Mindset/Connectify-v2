import { create } from "zustand"
import { chatStore } from "./chat-store"
import { socketStore } from "./socket"
import axios from "axios"
import { useRef } from "react"
import { Axios } from "@/lib/axiosInstance"
import { messageSettingsStore } from "./messageSettings-store"

export let chatMessageStore = create((set, get) => ({

    sendMessage : async (messageData, filePreview) => {

        let socket = socketStore.getState().socket
        let MembersIds = chatStore.getState().chatMembersIds.get(messageData.chatId)
        let setMessages = chatStore.getState().setMessages
        setMessages((messages) => {
            return [...messages, messageData]
        })
        let uploadedFiles = [];
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
                            console.log(percent)
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
                return { ...rest, url: data.secure_url, publicId: data.public_id }
            })
            setMessages((messages) => {
                return messages.map((msg) => {
                    if (msg.id === messageData.id) {
                        return { ...msg, media: completeMediaData }
                    }
                    return msg
                })
            })

            messageData.media = completeMediaData
        }

        let { progress, ...rest } = messageData
        socket?.emit("send-message", rest, MembersIds)
    },
    handleMessageSent: (messageId) => {
        let setMessages = chatStore.getState().setMessages

        setMessages((messages) => {
            return messages.map((msg) => {
                if (msg.id === messageId) {
                    return { ...msg, status: { ...msg.status, status: "sent" } }
                }
                return msg
            })
        })
    },
    handleEditMessage: async (content) => {
        let message = messageSettingsStore.getState().editMessage
        let handleDeleteMessage = messageSettingsStore.getState().handleDeleteMessage
        let setMessages = chatStore.getState().setMessages
        if (!content.trim() && !message.media ){
            handleDeleteMessage(message)
            return
        }
        
        try {

            let res = await Axios.put("/message/edit-message", { senderId: message.senderId, id: message.id, content })
            if (res.status === 200) {
                let {messageId , updatedAt} = res.data
                if (!messageId) {
                    console.log("error editing message")
                }
                setMessages((messages) => {
                    return messages.map((msg) => {
                        if (msg.id === messageId) {
                            return { ...msg, content  , updatedAt  }
                        }
                        return msg
                    })
                })
            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleDeleteMessage : async ()=>{
                let deleteMessage = messageSettingsStore.getState().deleteMessage
        let setDeleteMessage = messageSettingsStore.getState().setDeleteMessage
        let setMessages = chatStore.getState().setMessages
        
        try {

            let res = await Axios.delete(`/message/delete-message`, { data : {messageId : deleteMessage.id , senderId : deleteMessage.senderId}})
            if (res.status === 200){
                   setMessages((messages) => {
                    return messages.filter((msg) =>msg.id !== deleteMessage?.id)
                })
            }
            setDeleteMessage(null)
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    }

}))