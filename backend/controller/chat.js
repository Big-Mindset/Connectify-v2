
import createError from "http-errors"
import { prisma } from "../prismaClient.js"
import { secure_message } from "../lib/security-e2ee/encryptMessage.js"
import { config } from "dotenv"
import { client } from "../lib/redis.js"
config()
let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))


export const getChatbyId = async (req, res, next) => {
    let id = req.params.id
    if (!id) {
        throw createError(400, { message: "Error opening Chat" })
    }
    try {


        let chat = await prisma.chat.findUnique({
            where: {
                id
            },

            select: {
                id : true,
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 20,
                    select: {
                        id: true,
                        chatId: true,
                        media: true,
                        reactions: true,
                        senderId: true,
                        replyTo: {
                            select: {
                                id: true,
                                enceyptedContent: true,
                                senderId: true,
                                message_security : true

                            }
                        },
                        enceyptedContent: true,


                        _count: {
                            select: {
                                replies: true,
                            }
                        },
                        status: true,
                        message_security: true,
                        createdAt: true,
                        updatedAt: true
                    },
                },

            }
        })
        if (!chat.id) {
            throw createError(500, { message: "Internal Server error please try again" })

        }
        let decryptedMessages = chat.messages.map((msg) => {
            if (!msg.enceyptedContent) return msg
            let { enceyptedContent, message_security, ...rest } = msg
            if (msg?.replyTo?.id) {

                let { enceyptedContent: replyEncryptedContent,message_security, ...restReply } = msg.replyTo
                let replyToContent = secureMessage.decryptMessage(replyEncryptedContent, message_security)
                rest.replyTo = { ...restReply, content: replyToContent }
            }
            let content = secureMessage.decryptMessage(enceyptedContent, message_security)
            return { ...rest, content }
        })
        chat.messages = decryptedMessages
        return res.status(200).json({ chat: chat })
    } catch (error) {
        next(error)
    }
}
const getMessageData = (userId) => {
    let selectData = {
        id: true,
        isGroup: true,
        image: true,
        name: true,
        description: true,
        lastMessage: {
            select: {
                id: true,
                createdAt: true,
                status: true,
                enceyptedContent: true,
                media: {
                    select: {
                        type: true
                    }
                }
            }
        },
        participants: {
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                        lastseen : true

                    }
                }
            }
        },
        _count: {
            select: {
                messages: {
                    where: {
                        senderId: {
                            not: userId
                        },
                        status: {
                            some: {
                                status: "DELIVERED"
                            }
                        }
                    },

                }
            }
        }
    }
    return selectData
}

export let get_chats = async (req, res, next) => {
    let user = req.user
    try {
        let allFriends = await prisma.friendship.findMany({
            where: {
                OR: [
                    { user1Id: user.id },
                    { user2Id: user.id }
                ],
            },
            orderBy: [
                {
                    chat: {

                        pinnedAt: "desc",
                    }
                },
                {


                    chat: {

                        lastMessage: {
                            createdAt: "desc"
                        },

                    }
                },

                { createdAt: "desc" }
            ]

            ,
            take: 20,
            select: {
                chat: {
                    select: getMessageData(user.id)
                },
            }
        })

        let friendsWithStatus = await Promise.all(
            allFriends.map(async ({ chat }) => {

                if (chat.isGroup) return chat
                let userId = chat.participants[0].user.id === req.user.id ? chat.participants[1].user.id : chat.participants[0].user.id

                let isOnline = await client.SISMEMBER("online_users", userId)
                return { ...chat, isOnline : isOnline ? true : false }
            })
        )


        return res.status(200).json({ allFriends: friendsWithStatus })

    } catch (error) {
        next(error)
    }
}


export let get_unreadedChats = async (req, res, next) => {

    try {
        let unreadedChats = await prisma.chat.findMany({
            where: {
                messages: {
                    some: {
                        status: {
                            readAt: {
                                not: null
                            }
                        }
                    }
                },

            },
            orderBy: [
                {
                    lastMessage: {
                        createdAt: "desc"
                    }
                }
                ,
                { createdAt: "desc" }
            ],
            take: 20,
            select: getMessageData(req.user.id)
        })
        return res.status(200).json({ unreadedChats })
    } catch (error) {
        next(error)
    }
}






export const changeChatName = async (req, res, next) => {
    let { chatId, name } = req.body
    if (!name || !chatId) {
        throw createError(400, { message: "wrong input - please select a chat" })
    }
    try {
        let chatId = await prisma.chat.update({
            where: {
                id: chatId
            },
            data: {
                name
            },
            select: {
                id: true
            }
        })
        return res.status(200).json({ chatId: chatId.id })


    } catch (error) {
        next(error)
    }
}

export const blockedChat = async (req, res, next) => {
    try {
        let blockers = await prisma.block.findMany({
            where: {
                blockerId: req.user.id,
            },
            select: {
                blockedId: true

            }
        })
        let res = await Promise.all(blockedUsers)
        let blockedUsers = blockers.map(async ({ blockedId }) => {
            let blockedFriendship = prisma.friendship.findUnique({
                where: {
                    OR: [
                        { user1Id: blockedId, user2Id: req.user.id },
                        { user2Id: blockedId, user1Id: req.user.id }
                    ],
                },
                select: {
                    id: true,
                    user1: {
                        select: {
                            name: true,
                            id: true,
                            image: true
                        }
                    },
                    user2: {
                        select: {
                            name: true,
                            id: true,
                            image: true
                        }
                    }
                }
            })
            return blockedFriendship
        })
        res.status(200).json({ blocked_users: res })
    } catch (error) {
        next(error)
    }
}
export let getAllFriends = async (req, res, next) => {
    let user = req.user
    try {
        let allFriends = await prisma.friendship.findMany({
            where: {
                OR: [
                    { user1Id: user.id },
                    { user2Id: user.id }
                ],
            },
            orderBy: {
                chat: {
                    name: "asc"
                }
            }


            ,
            take: 30,
            select: {
                chat: {
                    select: {
                        id: true,
                    }
                },
                user1: {
                    select: {
                        name: true,
                        id: true,
                        image: true
                    }
                },
                user2: {
                    select: {
                        name: true,
                        id: true,
                        image: true
                    }
                }
            }
        })
        return res.status(200).json({ allFriends })

    } catch (error) {
        next(error)
    }
}