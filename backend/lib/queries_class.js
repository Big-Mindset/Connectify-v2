import {prisma} from "../lib/services/prismaClient.js"

export class SocketQueries {
    constructor() {

    }


    async updateToDelivered(statusData) {
    
        try {
            let status = await prisma.status.create({
                data: {
                    userId : statusData.userId,
                    messageId : statusData.id,
                    status : "DELIVERED",
                    deliveredAt : new Date(),
                    readAt : null
                }
            })
            return status || null
        } catch (error) {
            return error
        }
    }
    async updateToRead(statusData) {
    
       try {
            let status = await prisma.status.create({
                data: {
                    userId : statusData.userId,
                    messageId : statusData.id,
                    status : "READ",
                    readAt : new Date(),
                }
            })
            return status || null
        } catch (error) {
            return error
        }
    }
    async allMessagesDelivered(userId) {
        try {
            let messages = await prisma.message.findMany({

                where: {
                    chat: {
                        participants: {
                            some: {
                                userId: userId,
                            }
                        }
                    },
                   
                        status: {
                            none : {
                                userId 
                            }
                        }
                    

                },
                orderBy: {
                    createdAt: "desc"
                },
                select: {
                    id: true,
                    senderId: true,
                    chatId: true
                }
            })
          if (!messages.length) return null






            let deliveredAt = new Date()
            await prisma.status.createMany({
                data : messages.map((msg)=>({
                    userId ,
                    messageId : msg.id,
                    status : "DELIVERED",
                    deliveredAt 
                })),
                skipDuplicates : true,

            })
            let values = {userId , deliveredAt}
            let senderIdsMap = new Map()
            for (let msg of messages){
                if (!senderIdsMap.has(msg.senderId)){
                    senderIdsMap.set(msg.senderId ,{})
                }
                let chatMap = senderIdsMap.get(msg.senderId)
                if (!chatMap[msg.chatId]){
                    chatMap[msg.chatId] =  []
                }
                chatMap[msg.chatId].push(msg.id)
            }
            return {senderIdsMap , payload : values} 
        } catch (error) {
            console.log(error.message)

        }
    }
    async getChatParticipants(chatId , userId){
        try {
            let participants = await prisma.chatParticipant.findMany({
                where :{
                    chatId,
                    userId : {
                        not : userId
                    }
                },
                select : {
                    userId : true
                }
            })
            return participants
        } catch (error) {
            console.log(error.message)
        }
    }
}