import { create } from "zustand"
import { chatStore } from "./chat-store"
import { socketStore } from "./socket"
import axios from "axios"
import { useRef } from "react"
import { Axios } from "@/lib/axiosInstance"
import { messageSettingsStore } from "./messageSettings-store"
import { userStore } from "./user-store"

export let chatMessageStore = create((set, get) => ({
    messagesProgress : {},
    sendMessage: async (messageData, filePreview) => {

        let socket = socketStore.getState().socket
        let MembersIds = chatStore.getState().chatMembersIds.get(messageData.chatId)
        let selectedChat = chatStore.getState().selectedChat
        let setMessages = chatStore.getState().setMessages
        setMessages((messages) => {
            return [messageData , ...messages]
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
        let res = await Axios.post('/message/create-message',{...rest , userId : selectedChat.userId}) 
        if (res.status === 201){
            let message = res.data.message
       
             if (message?.id){
                let updatedMessage = get().handleMessageSent(message)
           
                socket?.emit("send-message", MembersIds , updatedMessage)
            }
        }
    },
    handleMessageSent: (message) => {
        let setMessages = chatStore.getState().setMessages
        let setChats = chatStore.getState().setChats
        let lastMessage = null

        setMessages((messages) => {
            return messages.map((msg) => {
                if (msg.id === message.id) {
                    lastMessage = { ...msg, status: message.status }
                    return lastMessage
                }
                return msg
            })
        })
        setChats((chats)=>{
            return chats.map((chat)=>{
                if (chat.id === lastMessage.chatId){
                    return {...chat , lastMessage }
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
        let MembersIds = chatStore.getState().chatMembersIds.get(selectedChat?.id)
        if (!content.trim() && !message.media) {
            handleDeleteMessage(message)    
            return
        }

        try {
            let editObject =  { senderId: message.senderId, id: message.id, content }
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
                socket.emit("send-message",MembersIds , {content , updatedAt , chatId : selectedChat.id , id : messageId})
            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleDeleteMessage: async () => {
        let deleteMessage = messageSettingsStore.getState().deleteMessage
        let setDeleteMessage = messageSettingsStore.getState().setDeleteMessage
        let setMessages = chatStore.getState().setMessages
        let socket = socketStore.getState().socket
        try {

            let res = await Axios.delete(`/message/delete-message`, { data: { messageId: deleteMessage.id, senderId: deleteMessage.senderId } })
            
            if (res.status === 200) {
                setMessages((messages) => {
                    return messages.filter((msg) => msg.id !== deleteMessage?.id)
                })
                socket.emit("delete-message",)
            }
            setDeleteMessage(null)
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleReaction: async (emoji) => {
        let reactMessage = messageSettingsStore.getState().reactMessage
        let setReactMessage = messageSettingsStore.getState().setReactMessage
        let setMessages = chatStore.getState().setMessages
        let session = userStore.getState().session
        let reactionData = {
            id: crypto.randomUUID(),
            emoji: emoji.native,
            name: emoji.name,
            messageId: reactMessage.id,
            reactors : [{
                id : crypto.randomUUID(),
                userId: session.user.id
            }]
        }
        try {
            let res = await Axios.post(`/message/create-reaction`, reactionData)
            if (res.status === 201) {
                setMessages((messages) => {
                    return messages.map((msg) => {
                        if (msg.id === reactMessage?.id) {
                            return { ...msg, reactions: [...msg.reactions, reactionData] }
                        }
                        return msg
                    })
                })
            }
            setReactMessage(null)
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleDeleteReaction: async (reactionId , messageId) => {
        let setMessages = chatStore.getState().setMessages
        try {
            let res = await Axios.delete(`/message/delete-reaction`, {data : {reactionId}})
            if (res.status === 200) {
                setMessages((messages) => {
                    return messages.map((msg) => {
                        if (msg.id === messageId) {
                            return { ...msg, reactions: msg.reactions.filter((reaction)=>reaction.id !== reactionId) }
                        }
                        return msg
                    })
                })
            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleRemoveReaction: async (reactionProps) => { 
             let setMessages = chatStore.getState().setMessages
      
        try {
            let res = await Axios.delete(`/message/remove-reaction`, {data : {id : reactionProps.reactorId}})
            if (res.status === 200) {
                setMessages((messages) => {
                    return messages.map((msg) => {
                        if (msg.id === reactionProps?.messageId) {
                            return { ...msg, reactions: msg.reactions.map((reaction)=>{
                                if (reaction.id === reactionProps.id){
                                    let removedUserReactions = reaction.reactors.filter((reactor)=>reactor.id !== reactionProps.reactorId)
                                    return {...reaction , reactors : removedUserReactions}
                                }
                                return reaction
                            } ) }
                        }
                        return msg
                    })
                })
            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
    },
    handleAddReaction: async (reactionProps) => {
          let setMessages = chatStore.getState().setMessages
      
        try {
            let res = await Axios.post(`/message/add-reaction`,{reactionId : reactionProps.id ,reactorId : reactionProps.reactorId })
       
            if (res.status === 201) {
                setMessages((messages) => {
                    return messages.map((msg) => {
                        if (msg.id === reactionProps?.messageId) {
                            return { ...msg, reactions: msg.reactions.map((reaction)=>{
                                if (reaction.id === reactionProps.id){
                                    return {...reaction , reactors :[...reaction.reactors , {userId : reactionProps.userId , id : reactionProps.reactorId}]}
                                }
                                return reaction
                            }) }
                        }
                        return msg
                    })
                })
            }
        } catch (error) {
            console.log(error?.response?.data?.message || error.message)
        }
     },

}))