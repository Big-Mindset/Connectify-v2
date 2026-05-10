import { create } from "zustand";

export let messageSettingsStore = create((set, get) => ({
    selectedMedia: null,
    setSelectedMedia: (media) => set({ selectedMedia: media }),
    messagesProgress: {},
    editMessage: {},
    openMessageOptionId: null,
    replyMessage: null,
    reactMessage : null,
    setReactMessage : (reactMessage)=>set({reactMessage}),
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
        if (editMessasge?.id === message?.id) return
        set({editMessage : { id: message.id, senderId: message.senderId, content: message.content || "" ,  media : !!message.media.length} })
    },
     handleReplyMessage : (message) => {
         let replyMessage = get().replyMessage
         if (replyMessage?.id === message.id) return
        set({replyMessage : { id: message.id, senderId: message.senderId , content : message.content || ""}})
    },
    handleDeleteMessage : (message)=>{
        let deleteMessage = get().deleteMessage
        if (deleteMessage?.id === message?.id) return
        set( { deleteMessage : { id: message.id, senderId: message.senderId, content: message.content || ""} })
    },
    handleReaction : (message , left)=>{
        let reactMessage = get().reactMessage
        console.log(reactMessage)
        if (message.id === reactMessage?.id) {
            set({reactMessage : null })
            return
        }
        set({reactMessage : {id: message.id, senderId: message.senderId , left : left  } })
    }
}))