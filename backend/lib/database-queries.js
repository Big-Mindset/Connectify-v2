import { prisma } from "../lib/services/prismaClient.js"
import { client } from "./services/redis.js"
import dotenv from "dotenv"
dotenv.config()

export async function getFriendIds(userId) {
    let friendIds = await prisma.friendship.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ],

        },
        select: {
            user1Id: true,
            user2Id: true,


        }
    })

    return friendIds.map((friend) => friend.user1Id === userId ? friend.user2Id : friend.user1Id)
}
export async function filterOnline(friendIds) {
    if (!friendIds.length) return []
    let pipeline = client.multi()
    friendIds.forEach((userId) => pipeline.exists(`user-socket:${userId}`))
    let result = await pipeline.exec()

    return friendIds.filter((_, idx) => result[idx] === 1)
}

export async function getOlderMessages({ messageId, limit  , order="desc" , chatId , userId }) {
    try {
        let messages = await prisma.message.findMany({
            where: {
                chatId
            },
            cursor: {
                id: messageId
            },
            skip: 1,
            take: limit,
            orderBy: {
                createdAt: order
            },
            select: {
                id: true,
                chatId: true,
                media: true,
                reactions: {
                    include: {
                        reactors: {
                            select: {
                                userId: true,
                                id: true,
                            }
                        }
                    }
                },
                senderId: true,
                replyTo: {
                    select: {
                        id: true,
                        encryptedContent: true,
                        senderId: true,
                        message_security: true,

                    }
                },
                encryptedContent: true,


                _count: {
                    select: {
                        replies: true,
                    }
                },
                status: {
                    where: {
                        userId: {
                            not: userId
                        }
                    }
                },
                message_security: true,
                createdAt: true,
                updatedAt: true
            }
        })
        return messages
    } catch (error) {
        console.log(error.message)
    }
}