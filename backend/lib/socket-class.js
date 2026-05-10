import { prisma } from "../prismaClient.js"
import { client } from "./redis.js"
import "dotenv/config"
import { SocketQueries } from "./queries_class.js"


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

        let active_members = await client.SMISMEMBER("online_users", friendIds)
        let activeFriends = friendIds.filter((_, idx) => active_members[idx] === 1)
        for (let id of activeFriends) {

            socket.to(id).emit("online-user", userId)
        }
    }
    async handleDisconnection(socket) {
        let userId = socket.handshake.auth.userId
        await client.SREM(`user:${userId}:sockets`, socket.id)
        let remainingSockets = await client.SCARD(`user:${userId}:sockets`)

        if (remainingSockets === 0) {
            await client.SREM("online_users", userId)
            let friendIds = await this.getFriendIds(userId)

            let active_members = await client.SMISMEMBER("online_users", friendIds)
            let activeFriends = friendIds.filter((_, idx) => active_members[idx] === 1)
            for (let id of activeFriends) {

                socket.to(id).emit("offline-user", userId)
            }
        }
    }
    async handleSendMessage(socket, message, participantIds) {
        try {
            console.log(message)
            let meessageId = await this.createMessage(message)
            console.log(meessageId)
            if (meessageId){
                message.status.status = "sent"
                console.log("message-sent....")
                socket.emit("message-sent",message.id)
                
                let activeSocketsInChat = await this.io.in(message.chatId).fetchSockets()
                let activeUserIds = new Set(activeSocketsInChat.map((socket) => socket.handshake.auth.userId))
                let inActiveIds = participantIds.filter((id) => !activeUserIds.has(id))
                console.log("sending to others....")
                
                socket.to(message.chatId).emit("send-message",message)
            }
            
        } catch (error) {
                console.log(error)     
        }
    }
    async RegisterPeerConnection(socket, peerId) {
        let userId = socket.handshake.auth.userId
        await client.SADD(`user:${userId}:peers`, peerId)
        await client.set(`user:${peerId}`, userId)
    }
}