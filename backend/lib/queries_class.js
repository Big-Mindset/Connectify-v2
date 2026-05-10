import { prisma } from "../prismaClient.js"
import cloudinary from "./cloudinary.js"
import { secure_message } from "./security-e2ee/encryptMessage.js"
let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))

export class SocketQueries {
    constructor() {

    }
    async createMessage(messageData) {
        let content = messageData.content
        let media = messageData.media
        console.log(media)
        if (!content.trim() && !media) {
            return null
        }
        try {
            if (content) {
                let { encrypteContent, keys, firstLetters_search, letters_search } = secureMessage.encryptMessage(content)

                let message = await prisma.message.create({
                    data: {
                        id: messageData.id,
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
                                id: messageData.status.id,
                                status: "SENT",
                            }
                        },
                        replyToId : messageData?.replyTo?.id
                    },
                    
                    select: {
                        id: true
                    }

                })
                if (media?.length > 0) {

                     await prisma.media.createMany({
                        data: media.map((m) => ({
                            id: m.id,
                            type: m.type,
                            messageId: message.id,
                            publicId: m.publicId,
                            url: m.url,
                            filename: m.filename

                        })),
                        skipDuplicates: true

                    })
                   
                }
                return message.id
            } else {
               let message =  await prisma.message.create({
                    data: {
                        id: messageData.id,
                        chatId: messageData.chatId,
                        senderId: messageData.senderId,
                        status : {
                             create: {
                                id: messageData.status.id,
                                status: "SENT",
                            }
                        },
                        media : {
                            createMany : {
                                 data: media.map((m) => ({
                            id: m.id,
                            type: m.type,
                            publicId: m.publicId,
                            url: m.url,
                            filename: m.filename

                        }))
                            }
                        }
                    },select : {
                        id : true,
                    
                    }
                })
                return message.id
            }

        } catch (error) {
            console.log(error.message)
            return null
        }
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
}