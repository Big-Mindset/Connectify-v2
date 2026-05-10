import { create } from "zustand";

export let messageSettingsStore = create((set, get) => ({
    selectedMedia: null,
    setSelectedMedia: (media) => set({ selectedMedia: media }),
    messagesProgress: {},
    editMessage: {},
    openMessageOptionId: null,
    replyMessage: null,
    setReplyMessage: (replyMessage) => set({ replyMessage }),
    setOpenMessageOptionId: (func) => {
        set((prev) => {
            return { openMessageOptionId: func(prev.openMessageOptionId) }
        })
    },
    inputRef : null,
    setInputRef : (inputRef)=>set({inputRef}),
    setEditMessage: (editMessage) => set({ editMessage }),
    deleteMessage : null,
    setDeleteMessage : (deleteMessage)=>set({deleteMessage}),

     handleEditMessage : (message) => {
        let editMessasge = get().editMessage
        let setEditMessage = get().setEditMessage
        if (editMessasge?.id === message?.id) return
        setEditMessage({ id: message.id, senderId: message.senderId, content: message.content || "" ,  media : !!message.media.length })
    },
     handleReplyMessage : (message) => {
         let replyMessage = get().replyMessage
         let setReplyMessage = get().setReplyMessage
         if (replyMessage?.id === message.id) return
        setReplyMessage({ id: message.id, senderId: message.senderId , content : message.content || ""})
    },
    handleDeleteMessage : (message)=>{
        let deleteMessage = get().deleteMessage
        let setDeleteMessage = get().setDeleteMessage
        if (deleteMessage?.id === message?.id) return
        setDeleteMessage({ id: message.id, senderId: message.senderId, content: message.content || "" })
    }
}))