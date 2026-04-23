import { prisma } from "../prismaClient.js"
import { config } from "dotenv"
import { secure_message } from "../lib/security-e2ee/encryptMessage.js"
import createError from "http-errors"
import { GetObjectCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3 } from "../lib/s3-client.js"
let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))

export const createMessage = async (req, res, next) => {
    config()
    const messageData = req.body
    let content = messageData.content
    let media = messageData.media
    if (!content.trim() && !media) {
        createError(400, { message: "Message is empty write text or add attachments" })
    }
    let { encrypteContent, keys, firstLetters_search, letters_search } = secureMessage.encryptMessage(content)
    try {
        let message = await prisma.message.create({
            data: {
                message_security: {
                    create: keys
                },
                enceyptedContent: encrypteContent,
                chatId: messageData.chatId,
                replyToId: messageData.replyToId,
                senderId: req.user.id,
                search_index: letters_search,
                firstLetters_index: firstLetters_search,
                status: {
                    create: {
                        status: "SENT",
                    }
                },
            },
           select : {
            id : true
           }

        })
        let response = message

        if (media) {
            let createdMedia = await prisma.media.create({
                data: {
                    media_objectKey: media.objectKey,
                    type: media.type,
                    messageId: message.id,
                }
            })
            response.media = createdMedia
        }
        return res.status(200).json({ message: response })
    } catch (error) {
        next(error)
    }
}

export const searchMessages = async (req, res, next) => {
    try {
        let { query, chatId, order, Ids, forwarded } = req.query
        console.log(query, chatId)

        if (query.trim().length === 0 || typeof query !== "string") {
            throw createError(400, { message: "invalid search input" })
        }

        let byUser;

        if (Ids.length > 1) {
            byUser = {
                OR: Ids
            }
        } else if (Ids.length === 1) {
            byUser = Ids[0]

        }


        if (query.trim().length > 1) {
            let hashedQuery = secureMessage.content_ngrams(query, true, false)
            messages = await prisma.message.findMany({
                where: {
                    chatId: chatId,
                    forwarded,
                    search_index: {
                        hasSome: hashedQuery.n_grams
                    },

                    ...byUser


                },
                orderBy: {
                    createdAt: order
                },
                take: 10,
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    enceyptedContent: true,
                    reactions: true,
                    message_security : true,

                    replyTo: {
                        select: {
                            enceyptedContent: true,
                            sender: {
                                select: {
                                    image: true,
                                    name: true
                                }
                            },
                            createdAt: true,
                            updatedAt: true,
                            expiredAt: true,
                            id: true
                        }
                    },
                    expiredAt: true,
                    forwarded: true,
                    status: true,
                    senderId: true,
                    _count: {
                        select: {
                            replies: true,
                        }
                    },

                }
            })
        } else {
            let hashedQuery = secureMessage.content_ngrams(query, false, true)

            messages = await prisma.message.findMany({
                where: {
                    chatId: chatId,
                    forwarded,
                    firstLetters_index: {
                        has: hashedQuery.n_grams_singleLetters[0]
                    },

                },
                orderBy: {
                    createdAt: order
                },
                take: 10,
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    enceyptedContent: true,
                    reactions: true,
                    message_security : true,
                    replyTo: {
                        select: {
                            enceyptedContent: true,
                           senderId : true,
                            message_security : true,
                            createdAt: true,
                            updatedAt: true,
                            expiredAt: true,
                            id: true
                        }
                    },
                    expiredAt: true,
                    forwarded: true,
                    status: true,
                    senderId: true,
                    _count: {
                        select: {
                            replies: true,
                        }
                    },

                }
            })
            
        }
           let decryptedMessages  = messages.map((msg)=>{
            let {enceyptedContent ,message_security ,...rest} = msg
            let {enceyptedContent : replyEncryptedContent,...restReply} = msg.replyTo
          let content = secureMessage.decryptMessage(msg.enceyptedContent , msg.message_security)
          let replyToContent = secureMessage.decryptMessage(replyEncryptedContent , restReply.message_security)
          rest.replyTo = {...restReply , content : replyToContent}
          return {...rest,content}
        })
        chat.messages = decryptedMessages
        console.log(decryptedMessages)
        res.status(200).json({ messages })
    } catch (error) {
        next(error)
    }
}



export const searchMediaMessages = async (req, res, next) => {
    let { mediaType, Ids, order, forwarded, chatId, dates } = req.query
    if (!chatId){
        throw createError(400 , {message : "chatId is required to fetch messages"})
    }
    if (!mediaType){
        throw createError(400 , {message : "Select media type"})

    }
    let byUser;

    if (Ids.length > 1) {
        byUser = {
            OR: Ids
        }
    } else if (Ids.length === 1) {
        byUser = Ids[0]

    }
    // let expectedDateObject = {
    //     date : Date.now(),
    //     time : "before/after"
    // }
    // let ranges = dates.map((date)=>{
    //     let createdAt = {
    //         gte : date.date,
            
    //     }
    // })
    try {
        let media = await prisma.media.findMany({
            where: {
                chatId,
                type: mediaType,
                message: {
                    // ...byUser,
                    forwarded ,
                },
                
                
            },
            orderBy : {
                createdAt : order
            },
            select : {
                id : true,
                media_objectKey : true,
                type : true,
                createdAt : true,
                message : {
                    select : {
                        enceyptedContent : true,
                        message_security : true,
                        id: true,
                        createdAt : true,
                        status : true
                    }
                }
                
            }
        })
        
        res.status(200).json({media})

    } catch (error) {
        next(error)
    }
}























export const generateMediaUrl = async (req, res, next) => {
    let data = req.body

    try {


        let objectKey = `/media/${data.chatId}/${crypto.randomUUID()}`
        let command = new PutObjectCommand({
            Bucket: process.env.BUCKET_KEY,
            Key: objectKey,
            ContentType: data.type,
            ServerSideEncryption: "AES256"
        })

        let uploadUrl = new getSignedUrl(s3, command, { expiresIn: 60 * 5 })

        return res.status(201).json({ uploadUrl, objectKey })

    } catch (error) {
        next(error)
    }
}

export const getMediaUrl = async (req, res, next) => {
    let data = req.body
    try {


        let command = new GetObjectCommand({
            Bucket: process.env.BUCKET_AWS,
            Key: data.objectKey
        })
        let preSignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 3 })
        return res.status(201).json({ url: preSignedUrl })
    } catch (error) {
        next(error)
    }
}


export const updateMessage = async (req, res, next) => {
    let message = req.body

    try {
        if (message.senderId !== req.user.id) {
            throw createError(400, { message: "you don't have permission to edit this message" })
        }
        let { encrypteContent, keys } = secureMessage.encryptMessage(message.content)

        let updatedMessage = await prisma.message.update({
            where: {
                id: message.id,
            },
            data: {
                message_security: {
                    update: keys
                },
                enceyptedContent: encrypteContent,

            },
            include: {
                message_security: true
            }
        })
        if (!updatedMessage.id) throw createError(500, { message: "error updating message try again" })
        res.status(200).json({ updatedMessage })
    } catch (error) {
        next(error)
    }
}

export const deleteMessage = async (req, res, next) => {
    let messageId = req.params.id
    console.log(messageId)
    try {
        let deletedmessage = await prisma.message.delete({
            where: {
                id: messageId,
                senderId: req.user.id
            },
            select: {
                id: true
            }
        })
        if (!deletedmessage.id) {
            throw createError(500, { message: "Error deleting message try again" })
        }
        return res.status(200).json({ message: "Message deleted" })

    } catch (error) {
        next(error)
    }
}


export const createReactions = async (req, res, next) => {
    let data = req.body
    try {


        let reaction = await prisma.reaction.create({
            data: {
                senderId: req.user.id,
                messageId: data.messageId,
                emojiCode: data.emojiCode,
                name: data.name,
            }
        })
        res.status(201).json({ reaction })
    } catch (error) {
        next(error)
    }
}

export const deleteRection = async (req, res, next) => {
    let data = req.body

    try {
        let deletedReaction = await prisma.reaction.delete({
            where: {
                id: data.reactionId
            },
            select: {
                id: true
            }
        })
        res.status(200).json({ deletedReaction })

    } catch (error) {
        next(error)
    }
}


export const moreMessages = async (req, res, next) => {
    let { messageId } = req.body
    if (!messageId) {
        throw createError(400, { message: "messageId is required to get more messages" })
    }
    try {
        let getMoreMessasges = await prisma.message.findMany({
            cursor: {
                id: messageId
            },
            skip: 1,
            take: 40,
            include: {
                media: true,
                reactions: true,
                message_security : true,
                replyTo : true,
                replies : true,
                _count: {
                    select: {
                        replies: true
                    }
                },
                status: true
            }
        })

             let decryptedMessages  = getMoreMessasges.map((msg)=>{
            let {enceyptedContent ,message_security ,...rest} = msg
            let {enceyptedContent : replyEncryptedContent,...restReply} = msg.replyTo
          let content = secureMessage.decryptMessage(msg.enceyptedContent , msg.message_security)
          let replyToContent = secureMessage.decryptMessage(replyEncryptedContent , restReply.message_security)
          rest.replyTo = {...restReply , content : replyToContent}
          return {...rest,content}
        })

        res.status(200).json({ messages: decryptedMessages })
    } catch (error) {
        next(error)
    }
}

export let clearMessages = async (req, res, next) => {
    let { clearedAt } = req.body

    try {
        await prisma.chatParticipant.update({
            where: {
                userId: req.user.id,
            },
            data: {
                clearChatAt: clearedAt
            },
            select: {
                id: true
            }
        })
        res.status(200).json({ message: "Messages cleared" })

    } catch (error) {
        next(error)
    }
}

// export let disappearMessages = async (req, res, next) => {
//     let { chatId, disappearDurationDate } = req.body
//     try {
//         await prisma.chat.update({
//             where: {
//                 id: chatId
//             },
//             data: {

//             }
//         })
//     } catch (error) {
//         next(null)
//     }
// }   