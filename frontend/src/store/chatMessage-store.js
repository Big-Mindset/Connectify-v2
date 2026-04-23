import {create} from "zustand"
import { chatStore } from "./chat-store"
import { socketStore } from "./socket"

export let chatMessageStore = create((set , get)=>({
    selectedMedia : null,
    setSelectedMedia : (media)=> set({selectedMedia :media }),
     sendMessage : (messageData) => {
        let new_message = messageData
        let setSelectedChat = chatStore.getState().setSelectedChat 
        let socket = socketStore.getState().socket
        let MembersIds = chatStore.getState().chatMembersIds.get(messageData.chatId)
        setSelectedChat((data) => {
            let res = { ...data, messages: [...data.messages, new_message] }
            return res
        })
        socket?.emit("send-message" ,new_message ,  MembersIds)
    }
    
}))