import { prisma } from "../prismaClient.js"
import { client } from "./redis.js"
import { secure_message } from "./security-e2ee/encryptMessage.js"

export class SocketQueries {
    constructor() {

    }

    async getFriendIds(userId) {
        let friendIds = await prisma.friendship.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ],

            },
            select: {
                user1Id: true,
                user2Id: true
            }
        })

        return friendIds.map((friend) => friend.user1Id === userId ? friend.user2Id : friend.user1Id)
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
                    NOT: {
                        status: {
                            some: {
                                userId: userId, status: {
                                    in: ["DELIVERED", "READ"]
                                }
                            }
                        }
                    },

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
            let senderIds = new Set(messages.map((msg) => msg.senderId))
            senderIds = [...senderIds]

            let filteredData = {}
            await Promise.all(

                senderIds.map(async (id) => {
                    let activeChat = await client.GET(`user-activeChat:${id}`)
                    if (activeChat && !filteredData[id]) {
                     
                        filteredData[id] = { chatId: activeChat , userId , deliveredAt , messages : {} }
                    }
                    
                })
            )

            
            
            
            messages.forEach((msg) => {
                let chatId = filteredData[msg.senderId]?.chatId
              
                if (msg.chatId === chatId) {
                    filteredData[msg.senderId].messages[msg.id] = true
                }
            })
            return filteredData 
        } catch (error) {
            console.log(error.message)

        }
    }
}