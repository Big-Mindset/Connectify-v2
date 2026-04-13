
import createError from "http-errors"
import { prisma } from "../prismaClient.js"
import { secure_message } from "../lib/security-e2ee/encryptMessage.js"
import { config } from "dotenv"
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
            include: {
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 20,
                    include: {
                        media: true,
                        reactions: true,
                        replyTo : true,
                        
                        _count: {
                            select: {
                                replies: true,
                            }
                        },
                        status: true,
                        message_security : true
                    }
                },
                participants: true,
                _count : {
                    select : {
                        messages :{
                            where :{
                                status  :{
                                    some : {
                                        status : null
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!chat.id) {
            throw createError(500, { message: "Internal Server error please try again" })

        }
           let decryptedMessages  = chat.messages.map((msg)=>{
            let {enceyptedContent ,message_security ,...rest} = msg
            let {enceyptedContent : replyEncryptedContent,...restReply} = msg.replyTo
          let content = secureMessage.decryptMessage(msg.enceyptedContent , msg.message_security)
          let replyToContent = secureMessage.decryptMessage(replyEncryptedContent , restReply.message_security)
          rest.replyTo = {...restReply , content : replyToContent}
          return {...rest,content}
        })
        chat.messages = decryptedMessages
        return res.status(200).json({ chat })
    } catch (error) {
        next(error)
    }
}
let selectData = {
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
                    image: true
                }
            }
        }
    }
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
                        lastMessage: {
                            createdAt: "desc"
                        }
                    }
                },
                { createdAt: "desc" }
            ]

            ,
            take: 20,
            select: {
                chat: {
                    select: selectData
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
            select: selectData
        })
       return res.status(200).json({unreadedChats})
    } catch (error) {
        next(error)
    }
}






export const changeChatName = async (req , res ,next)=>{
    let {chatId , name } = req.body
    if (!name || !chatId) {
        throw createError(400 , {message : "wrong input - please select a chat"})
    }
    try {
        let chatId = await prisma.chat.update({
            where : {
                id : chatId
            },
            data : {
                name
            },
            select : {
                id : true
            }
        })
        return res.status(200).json({chatId : chatId.id})


    } catch (error) {
        next(error)
    }
}

