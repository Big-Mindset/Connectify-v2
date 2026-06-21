import { create } from "zustand";
import { chatMessageStore } from "./chatMessage-store";
import { userStore } from "./user-store";
import { chatStore } from "./chat-store";

export let messageSettingsStore = create((set, get) => ({
    selectedMedia: null,
    setSelectedMedia: (media) => set({ selectedMedia: media }),
    editMessage: {},
    openMessageOptionId: null,
    replyMessage: null,
    reactMessage: null,
    setReactMessage: (reactMessage) => set({ reactMessage }),
    setReplyMessage: (replyMessage) => set({ replyMessage }),
    setOpenMessageOptionId: (func) => {
        set((prev) => {
            return { openMessageOptionId: func(prev.openMessageOptionId) }
        })
    },
    inputRef: null,
    setInputRef: (inputRef) => set({ inputRef }),
    setEditMessage: (editMessage) => set({ editMessage }),
    deleteMessage: null,
    setDeleteMessage: (deleteMessage) => set({ deleteMessage }),

    handleEditMessage: (message) => {
        let editMessasge = get().editMessage
        if (editMessasge?.id === message?.id) return
        set({ editMessage: { id: message.id, senderId: message.senderId, content: message.content || "", media: !!message.media.length } })
    },
    handleReplyMessage: (message) => {
        let replyMessage = get().replyMessage
        if (replyMessage?.id === message.id) return
        set({ replyMessage: { id: message.id, senderId: message.senderId, content: message.content || "" } })
    },
    handleDeleteMessage: (message) => {
        let deleteMessage = get().deleteMessage
        if (deleteMessage?.id === message?.id) return
        set({ deleteMessage: { id: message.id, senderId: message.senderId, content: message.content || "", chatId: message.chatId } })
    },
    handleReaction: (message, left) => {
        let reactMessage = get().reactMessage

        if (message.id === reactMessage?.id) {
            set({ reactMessage: null })
            return
        }
        set({ reactMessage: { id: message.id, senderId: message.senderId, left: left } })
    },
    handleDeleteMessageFromUI: ({ id, chatId }) => {

        let setMessages = chatStore.getState().setMessages
        let setChats = chatStore.getState().setChats
        let selectedChat = chatStore.getState().selectedChat
        if (selectedChat?.id === chatId) {

            setMessages((messages) => messages.filter((msg) => msg.id !== id))
        }
        let isLastMessage = false
        let messages = chatStore.getState().messages


        setChats((chats) => {

            return chats.map((chat) => {
                if (chat.id === chatId) {
                    if (chat.lastMessage.id === id) {
                        isLastMessage = true
                        return { ...chat, lastMessage: messages[0] || null }


                    }

                }
                return chat
            })
        })
        return isLastMessage

    },

    handleReactionFunc: (reaction, messageId, emoji) => {

        let handleReaction = chatMessageStore.getState().handleReaction
        if (!reaction && emoji) {
            handleReaction(emoji)
            set({ reactMessage: null })
            return
        }
        const session = userStore.getState().session
        const handleAddReaction = chatMessageStore.getState().handleAddReaction
        const handleDeleteReaction = chatMessageStore.getState().handleDeleteReaction
        const handleRemoveReaction = chatMessageStore.getState().handleRemoveReaction
        let myReaction = reaction.reactors.find(reactor => reactor.userId === session.user.id)

        if (myReaction) {
            if (reaction.reactors.length === 1) {
                handleDeleteReaction(reaction.id, messageId)
            } else {
                handleRemoveReaction({ id: reaction.id, reactorId: myReaction.id, messageId })
            }
        } else {
            handleAddReaction({ id: reaction.id, userId: session.user.id, reactorId: crypto.randomUUID(), messageId })
        }
        set({ reactMessage: null })

    },
    updateMessageReactions: (type, reactionData) => {

        let setMessages = chatStore.getState().setMessages
        if (type === "remove") {

            setMessages((messages) => {
                return messages.map((msg) => {
                    if (msg.id === reactionData?.messageId) {
                        return {
                            ...msg, reactions: msg.reactions.map((reaction) => {
                                if (reaction.id === reactionData.id) {
                                    let removedUserReactions = reaction.reactors.filter((reactor) => reactor.id !== reactionData.reactorId)
                                    return { ...reaction, reactors: removedUserReactions }
                                }
                                return reaction
                            })
                        }
                    }
                    return msg
                })
            })

        } else if (type === "delete") {

            setMessages((messages) => {
                return messages.map((msg) => {
                    if (msg.id === reactionData.messageId) {
                        return { ...msg, reactions: msg.reactions.filter((reaction) => reaction.id !== reactionData.reactionId) }
                    }
                    return msg
                })
            })
        } else if (type === "create") {


            setMessages((messages) => {
                return messages.map((msg) => {
                    if (msg.id === reactionData?.messageId) {
                        return { ...msg, reactions: [...msg.reactions, reactionData] }
                    }
                    return msg
                })
            })
        } else if (type === "add") {

            setMessages((messages) => {
                return messages.map((msg) => {
                    if (msg.id === reactionData?.messageId) {
                        return {
                            ...msg, reactions: msg.reactions.map((reaction) => {
                                if (reaction.id === reactionData.id) {
                                    return { ...reaction, reactors: [...reaction.reactors, { userId: reactionData.userId, id: reactionData.reactorId }] }
                                }
                                return reaction
                            })
                        }
                    }
                    return msg
                })
            })

        }
    }

}))