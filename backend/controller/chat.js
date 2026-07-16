
import createError from "http-errors"
import { prisma } from "../lib/services/prismaClient.js"
import { secure_message } from "../lib/security-e2ee/encryptMessage.js"
import { config } from "dotenv"
import { client } from "../lib/services/redis.js"
config()
let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))


export const getChatbyId = async (req, res, next) => {
    let id = req.params.id
    let user = req.user

    try {
        if (!id) {
            throw createError(400, { message: "Error opening Chat" })
        }

        let chat = await prisma.chat.findUnique({
            where: {
                id
            },

            select: {
                id: true,
                isGroup: true,
                participants: {
                    where: {
                        userId: {
                            not: user.id
                        },
                        chat: {
                            isGroup: true
                        }

                    },
                    select: {
                        user: {
                            select: {

                                id: true,
                                name: true,
                                image: true,
                                username: true,

                            },
                        },

                    },
                    orderBy: {
                        user: {
                            name: "asc"
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 30,
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
                                message : {
                                senderId : user.id
                               },
                               
                            }
                        },
                        message_security: true,
                        createdAt: true,
                        updatedAt: true
                    },
                },

            }
        })
        if (!chat?.id) {
            throw createError(404, { message: "Internal Server error please try again" })

        }
        let decryptedMessages = chat.messages.map((msg) => {
            if (!msg.encryptedContent) return msg
            if (msg?.replyTo?.id) {

                let updatedReplyTo = secureMessage.transformDecryptData(msg.replyTo.encryptedContent, msg.replyTo.message_security, msg.replyTo)
                msg.replyTo = updatedReplyTo
            }
            return secureMessage.transformDecryptData(msg.encryptedContent, msg.message_security, msg)

        })
        chat.messages = decryptedMessages

        return res.status(200).json({ chat: chat })
    } catch (error) {
        next(error)
    }
}
export const getMessageData = (userId) => {
    let selectData = {
        id: true,
        isGroup: true,
        image: {
            select: {
                id: true,
                publicId: true,
                url: true,
            }
        },
        name: true,
        description: true,
        lastMessage: {
            select: {
                id: true,
                createdAt: true,
                senderId: true,
                status: {
                    where: {
                        userId: {
                            not: userId
                        }
                    }
                },

                encryptedContent: true,
                media: {
                    select: {
                        type: true
                    }
                },
                message_security: true
            }
        },
        participants: {
            where: {
                chat: {
                    isGroup: false
                }
            },
            select: {

                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                        lastseen: true
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
    let userId = user.id
    try {

        let Chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: {
                        userId
                    }
                }
            },
            orderBy: [
                {
                    lastMessage: {

                        createdAt: "desc",
                    },
                },

                { createdAt: "desc" }
            ]

            ,
            take: 20,
            select: getMessageData(userId)



        })
        let AllChats = await Promise.all(
            Chats.map(async (chat) => {



                let lastMessage = chat.lastMessage

                if (lastMessage && lastMessage.encryptedContent) {

                    lastMessage = secureMessage.transformDecryptData(lastMessage.encryptedContent, lastMessage.message_security, lastMessage)



                }
                if (chat.isGroup) return { ...chat, lastMessage }
                let {participants , ...rest} = chat
                let { user } = participants.find(({ user }) => user.id !== userId)



                let isOnline = await client.SISMEMBER("online-users", user.id)

                return { ...rest,  lastMessage, userData: {...user , isOnline} }
            })
        )


        return res.status(200).json({ chats: AllChats })

    } catch (error) {
        next(error)
    }
}

export let get_chat = async (req, res, next) => {
    let chatId = req.query.chatId
    let userId = req.user.id
    try {
        if (!chatId) throw createError(400, { message: "chatId is required" })
        let chat = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            select: getMessageData(userId)
        })
        if (!chat?.id) {

            throw createError(404, { message: "Chat not found" })
        }
        let lastMessage = chat?.lastMessage

        if (lastMessage && lastMessage.encryptedContent) {

            lastMessage = secureMessage.transformDecryptData(lastMessage.encryptedContent, lastMessage.message_security, lastMessage)



        }
        if (chat.isGroup) return res.status(200).json({chat : { ...chat, lastMessage }})
        let { user } = chat.participants.find(({ user }) => user.id !== userId)




        let isOnline = await client.SISMEMBER("online-users", user.id)

     

        let returnResopnse = { id: chat.id, lastMessage, unread_messageCount: 0, userData: { ...user, isOnline } }

        return res.status(200).json({ chat: returnResopnse })
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
                            readAt: null
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
        throw createError(400, { message: "Invalid information" })
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
                        image: true,
                        bio: true,
                        username: true
                    }
                },
                user2: {
                    select: {
                        name: true,
                        id: true,
                        image: true,
                        bio: true,
                        username: true
                    }
                }
            }
        })
        let updatedData = await Promise.all(allFriends.map(async (friend) => {
            if (friend.user1.id === user.id) {
                let isOnline = await client.exists(`user-socket:${friend.user2.id}`)
                return { ...friend.user2, chatId: friend.chat.id, isOnline: isOnline }
            }
            let isOnline = await client.exists(`user-socket:${friend.user1.id}`)

            return { ...friend.user1, chatId: friend.chat.id, isOnline }
        }))

        return res.status(200).json({ allFriends: updatedData })

    } catch (error) {
        next(error)
    }
}

export let handleGetUserdata = async (req, res, next) => {
    try {
        let user = req.user
        let { userId } = req.query
        let friendData = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { user1Id: user.id, user2Id: userId },
                    { user2Id: user.id, user1Id: userId },
                ]
            },
            select: {
                chat: { select: { id: true } },
                user1: {
                    select: {
                        name: true,
                        id: true,
                        image: true,
                        bio: true,
                        username: true
                    }
                },
                user2: {
                    select: {
                        name: true,
                        id: true,
                        image: true,
                        bio: true,
                        username: true
                    }
                }
            }
        })

        if (!friendData?.chat?.id) throw createError(404, { message: "Chat not found " })
        let userData = friendData.user1.id === user.id ? friendData.user2 : friendData.user1

        return res.status(200).json({ userData: { ...userData, chatId: friendData.chat.id } })

    } catch (error) {
        next(error)
    }
}