import { getMessageData } from "../controller/chat.js"
import { prisma } from "../prismaClient.js"
import { client } from "./redis.js"
import { secure_message } from "./security-e2ee/encryptMessage.js"
import dotenv from "dotenv"
dotenv.config()
let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))

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
    friendIds.forEach((id) => pipeline.exists(`user-socket:${id}`))
    let result = await pipeline.exec()

    return friendIds.filter((_, idx) => result[idx] === 1)
}
export async function getChat(chatId, userId) {

    try {


        let chat = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            select: {
                id: true,
                isGroup: true,
                image: true,
                name: true,
                description: true,
                participants: {
                    select: {
                        user: {
                            select: {
                                id: true,
                            }
                        }
                    }
                }
            }
        })
        if (!chat?.id) {

            return { status: 404 }
        }

        
        let { user } = chat.participants.find(({ user }) => user.id !== userId)

        let dmUserData = await prisma.user.findUnique({
            where: {
                id: user.id

            },
            select: {
                id: true,
                name: true,
                image: true,
                username: true,
                lastseen: true
            }
        })


        let isOnline = await client.SISMEMBER("online-users", dmUserData.id)

        let returnResopnse = { ...chat, isOnline, lastMessage : null , _count : {messages : 0}, 3: [{ user: dmUserData }] }
        return { chat: returnResopnse, status: 200 }

    } catch (error) {
        console.log(error.message)
        return { status: 500, message: error.message }
    }
}