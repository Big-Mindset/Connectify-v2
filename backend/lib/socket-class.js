import { prisma } from "../prismaClient.js"
import { client } from "./redis.js"
import "dotenv/config"
import { SocketQueries } from "./queries_class.js"

// client.SADD to add multiple values to one key
// client.SMISMEMBER takes the key and array of values and return wether that array of values already in it 1 represents they exist and 0 they don't 

export class SocketConnection extends SocketQueries {
    constructor(io) {
        super(io)

        this.io = io
    }
    async handleConnection(socket) {
        let userId = socket.handshake.auth.userId
        socket.join(userId)
        await client.SADD("online_users", userId)
        await client.SADD(`user:${userId}:sockets`, socket.id)
        let friendIds = await this.getFriendIds(userId)

        if (friendIds.length > 0) {

            let active_members = await client.SMISMEMBER("online_users", friendIds)
            let activeFriends = friendIds.filter((_, idx) => active_members[idx] === 1)
            for (let id of activeFriends) {

                socket.to(id).emit("online-user", userId)
            }
        }
    }
    async handleDisconnection(socket) {
        let userId = socket.handshake.auth.userId
        await client.SREM(`user:${userId}:sockets`, socket.id)
        let chatId = await client.GET(`user-activeChat:${userId}`)
        if (chatId) {
            await client.SREM(`active-chat:${chatId}`, userId)

            await client.DEL(`user-activeChat:${userId}`)
        }
        let remainingSockets = await client.SCARD(`user:${userId}:sockets`)

        if (remainingSockets === 0) {
            await client.SREM("online_users", userId)
            let friendIds = await this.getFriendIds(userId)
            if (friendIds.length > 0) {

                let active_members = await client.SMISMEMBER("online_users", friendIds)
                let activeFriends = friendIds.filter((_, idx) => active_members[idx] === 1)
                for (let id of activeFriends) {

                    socket.to(id).emit("offline-user", userId)
                }
            }
        }
    }
    async handleSendMessage(socket, message, participantIds) {

        try {
            let InActiveFriends = await this.getInActiveMembers(message.chatId , participantIds)
            if (InActiveFriends){

                for (let id of InActiveFriends) {
                    socket.to(id).emit("message-notification", message)
                }
            }
            socket.to(message.chatId).emit("send-message", message)


        } catch (error) {
            console.log(error)
        }
    }
    async getInActiveMembers(chatId, participantIds) {
        let activeUserIds = new Set(await client.SMEMBERS(`active-chat:${chatId}`))

        let inActiveIds = participantIds.filter((id) => !activeUserIds.has(id))
        if (inActiveIds.length > 0) {

            let active_members = await client.SMISMEMBER("online_users", inActiveIds)
            let activeFriends = inActiveIds.filter((_, idx) => active_members[idx] === 1)
            return activeFriends
        }
        return null
    }
    async handleMessageDelivered(socket, data) {
        let status = await this.updateToDelivered({id :data.id , userId : socket.handshake.auth.userId})

        socket.to(data.senderId).emit("message-delivered", { messageId: data.id, chatId: data.chatId, status })
    }
    async handleMessageRead(socket , data){
        try {
        
            let status = await this.updateToRead({id :data.id , userId : socket.handshake.auth.userId})
            
            socket.to(data.senderId).emit("message-read", { messageId: data.id, chatId: data.chatId, status})
        } catch (error) {
                console.log(error.message)   
        }
    }
    async markAllAsRead(socket , data){
      
        socket.to(data.senderId).emit("mark-asRead", {...data,userId : socket.handshake.auth.userId})
    }
    async handleMessageDeliveredAll(socket){
        let data = await this.allMessagesDelivered(socket.handshake.auth.userId)

        if (!data) return 
        for (let key of Object.keys(data)){
            socket.to(key).emit("updateToDelivered",data[key])
        }
    }
    async handleReactionUpdates(socket,data,chatId){
        socket.to(chatId).emit("reaction-updates",data)
        
    }
    

    async RegisterPeerConnection(socket, peerId) {
        let userId = socket.handshake.auth.userId
        await client.SADD(`user:${userId}:peers`, peerId)
        await client.set(`user:${peerId}`, userId)
    }

}