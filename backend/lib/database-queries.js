import { getMessageData } from "../controller/chat.js"
import {prisma} from "../lib/services/prismaClient.js"
import { client } from "./services/redis.js"
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
