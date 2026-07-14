import { client } from "./services/redis.js"
import "dotenv/config"
import { SocketQueries } from "./queries_class.js"
import { UserConnection } from "./connection_classes/user-connection-class.js"
import { ChatConnection } from "./connection_classes/chat_connection-class.js"
import { filterOnline, getFriendIds } from "./database-queries.js"


let user_connection = new UserConnection()
let chat_connection = new ChatConnection()
export class SocketConnection extends SocketQueries {
    constructor(io) {
        super(io)
        this.io = io
    }
    async handleConnection(socket) {
        let userId = socket.handshake.auth.userId
        // if (oldSocketId) {
        //     socket.emit("session:conflict", { message: "Already logged in elsewhere" })
        //        let rejectionTimeout = setTimeout(() => {
        //         if (socket.connected) {
        //             socket.emit('session:rejected')
        //             socket.disconnect(true)
        //         }
        //     }, 30_000)
        //     socket.once("session:decision", async ({ action }) => {
        //         clearTimeout(rejectionTimeout)
        //         if (action === "takeover") {
        //             let oldSocket =  this.io.sockets.sockets.get(oldSocketId)


        //             if (oldSocket) {
        //                 oldSocket.emit("session:terminated", { message: "Logged in from another device" })
        //                 oldSocket.disconnect(true)
        //             }
        //             await user_connection.setOffline(oldSocketId, userId)
        //             socket.join(userId)
        //             await user_connection.setOnline(socket.id, userId)
        //             socket.emit("user-connected",null)

        //             await this.broadcastStatus(socket, userId ,  "online-user")
        //         } else {
        //             socket.emit("session:rejected")
        //             socket.disconnect(true)
        //         }
        //     })

        //     return
        // }
        socket.join(userId)
        await user_connection.setOnline(socket.id, userId)
        await this.broadcastStatus(socket, userId, "online-user")




    }

    async handleDisconnection(socket) {

        try {

            const userId = socket.handshake.auth.userId;
            let chatId = await client.get(`user-activeChat:${userId}`)
            if (chatId) {

                await chat_connection.LeaveRoom(socket, chatId, userId)
            }
            let isOffline = await user_connection.setOffline(socket.id, userId)

            if (isOffline) {
                await this.broadcastStatus(socket, userId, "offline-user")
            }

        } catch (error) {
            console.log(error.message)
        }
    }
    async broadcastStatus(socket, userId, event) {
        let friendIds = await getFriendIds(userId)
        if (friendIds?.length > 0) {
            let activeFriends = await filterOnline(friendIds)
            for (const id of activeFriends) {
                socket.to(id).emit(event, userId);
            }
        }
    }
    async handleHeartbeat(socket) {
        const userId = socket.handshake.auth.userId;
        if (!userId) return;

        await user_connection.refreshHeartbeat(socket.id, userId);

    }

    async handleSendMessage(socket, message) {

        try {
            let userId = socket.handshake.auth.userId
            let participantIds = await this.getChatParticipants(message.chatId, userId)

            socket.to(message.chatId).emit("send-message", message)
            let InActiveFriends = await this.getInActiveMembers(message.chatId, participantIds)
            if (InActiveFriends) {

                for (let userId of InActiveFriends) {
                    socket.to(userId).emit("message-notification", message)
                }
            }


        } catch (error) {
            console.log(error)
        }

    }
    async getInActiveMembers(chatId, participantIds) {
        let start = performance.now()

        setImmediate(() => {
        });
        let activeUserIds = new Set(await client.SMEMBERS(`active-chat:${chatId}`))
        let end = performance.now()
   

        let inActiveIds = participantIds.filter((userId) => !activeUserIds.has(userId))

        if (inActiveIds.length > 0) {
            let inActiveChatUser = await filterOnline(inActiveIds)
            return inActiveChatUser
        }

        return null
    }
    async handleMessageDelivered(socket, data) {
        let status = await this.updateToDelivered({ id: data.id, userId: socket.handshake.auth.userId })

        socket.to(data.senderId).emit("message-delivered", { messageId: data.id, chatId: data.chatId, status })
    }
    async handleMessageRead(socket, data) {
        try {

            let status = await this.updateToRead({ id: data.id, userId: socket.handshake.auth.userId })

            socket.to(data.senderId).emit("message-read", { messageId: data.id, chatId: data.chatId, status })
        } catch (error) {
            console.log(error.message)
        }
    }
    async markAllAsRead(socket, data) {
        let userId = socket.handshake.auth.userId
        socket.to(data.chatId).emit("mark-asRead", { ...data, userId })
        let participants = await this.getChatParticipants(data.chatId, userId)
        let participantIds = participants.map(({ userId }) => userId)

        let inActiveChatUserIds = await this.getInActiveMembers(data.chatId, participantIds)
        if (inActiveChatUserIds) {
            for (let userId of inActiveChatUserIds) {

                socket.to(userId).emit("mark-asRead", { ...data, userId: socket.handshake.auth.userId })
            }
        }

    }
    async handleMessageDeliveredAll(socket) {
        let res = await this.allMessagesDelivered(socket.handshake.auth.userId)
        if (!res) return
        let { senderIdsMap, payload } = res
        for (let [senderId, chatIds] of senderIdsMap) {

            socket.to(senderId).emit("updateToDelivered", chatIds, payload)
        }

    }
    async handleReactionUpdates(socket, data, chatId) {
        socket.to(chatId).emit("reaction-updates", data)

    }
    async handleDeleteMessage(socket, message) {

        if (message.isLastMessage) {
            let userId = socket.handshake.auth.userId
            let membersIds = await this.getChatParticipants(message.chatId, userId)
            let inActiveIds = await this.getInActiveMembers(message.chatId, membersIds)
            if (inActiveIds) {
                for (let userId of inActiveIds) {
                    socket.to(userId).emit("delete-message", message)
                }
            }
        }
        socket.to(message.chatId).emit("delete-message", message)
    }
    async handleJoinChat(socket, chatId) {
        await chat_connection.JoinChat(socket, chatId)
    }
    async handleLeaveChat(socket, chatId) {

        try {
            let userId = socket.handshake.auth.userId
            await chat_connection.LeaveRoom(socket, chatId, userId)

        } catch (error) {
            console.log(error.message)
        }

    }
    async handleTyping(socket, data, event) {
        try {

            let membersIds = await this.getChatParticipants(data.chatId, data.userId)
            let InActiveFriends = await this.getInActiveMembers(data.chatId, membersIds)
            socket.to(data.chatId).emit(event, { chatId: data.chatId, name: data.name })
            if (InActiveFriends) {

                for (let userId of InActiveFriends) {
                    socket.to(userId).emit(event, { chatId: data.chatId, name: data.name })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    async handleGroupCreated(socket, data) {
        let onlineParticipants = await filterOnline(data.participantIds)
        for (let id of onlineParticipants) {
            socket.to(id).emit("group-created", data.chatId)
        }
    }


}