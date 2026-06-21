import { prisma } from "../prismaClient.js"
import { client } from "./redis.js"

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