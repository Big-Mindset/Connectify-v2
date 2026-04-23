import { prisma } from "../prismaClient.js"
import { client } from "./redis.js"
import "dotenv/config"
import {  secure_message } from "./security-e2ee/encryptMessage.js"

let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))

class MessageClass  {
    constructor(){

    }
    async createMessage  (messageData){
       let content = messageData.content
       console.log(messageData)
       let media = messageData.media
       console.log(media)
       if (!content.trim() && !media) {
           return null
       }
       let { encrypteContent, keys, firstLetters_search, letters_search } = secureMessage.encryptMessage(content)
       try {
           let message = await prisma.message.create({
               data: {
                id : messageData.id,
                   message_security: {
                       create: keys
                   },
                   enceyptedContent: encrypteContent,
                   chatId: messageData.chatId,
                   replyToId: messageData.replyToId,
                   senderId: messageData.senderId,
                   search_index: letters_search,
                   firstLetters_index: firstLetters_search,
                   status: {
                       create: {
                        id : messageData.status.id,
                           status: "SENT",
                       }
                   },
               },
            
   
           })
           console.log("message created")
           console.log(message)
           let response = message
   
           if (media?.length > 0) {
               let createdMedia = await prisma.media.create({
                   data: {
                       media_objectKey: media.objectKey,
                       type: media.type,
                       messageId: message.id,
                   }
               })
               response.media = createdMedia
           }
        //    console.log()
           return response
       } catch (error) {
        console.log(error.message)
           return null
       }
   }
}
export class SocketConnection extends MessageClass {
    constructor(io) {
        super(io)
        this.io = io
    }
    async handleConnection(socket) {
        let userId = socket.handshake.auth.userId
        socket.join(userId)
        await client.SADD("online_users", userId)
        await client.SADD(`user:${userId}:sockets`, socket.id)

    }
    async handleDisconnection(socket ) {
        let userId = socket.handshake.auth.userId
        await client.sRem(`user:${userId}:sockets`, socket.id)
        let remainingSockets = await client.sCard(`user:${userId}:sockets`)
        if (remainingSockets === 0) {

            await client.sRem("online_users", userId)
        }
    }
    async handleSendMessage(socket , message , participantIds){
        console.log("inside of a functions")
        let create_message =  await this.createMessage(message)

        let activeSocketsInChat = await this.io.in(message.chatId).fetchSockets()
    let activeUserIds = new Set(activeSocketsInChat.map((socket)=>socket.handshake.auth.userId))
    
    let inActiveIds = participantIds.filter((id)=>!activeUserIds.has(id))
    }
    async RegisterPeerConnection(socket , peerId){
        let userId = socket.handshake.auth.userId
         await client.SADD(`user:${userId}:peers` , peerId)
    await client.set(`user:${peerId}` , userId)
    }
}