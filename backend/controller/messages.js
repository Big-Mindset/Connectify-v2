import {prisma} from "../lib/services/prismaClient.js"

import { secure_message } from "../lib/security-e2ee/encryptMessage.js"
import createError from "http-errors"
import { getOlderMessages } from "../lib/database-queries.js"
let secureMessage = new secure_message(Buffer.from(process.env.KEK_KEY, "hex"))

export const createMessage = async (req, res, next) => { 
        let messageData  = req.body
        let content = messageData.content
        let media = messageData.media
        if (!(content?.trim()) && !media) {
           throw createError(400, { message: "media or content is required" })
        }
        let message = null
     
        try {
            if (content) {
                let { encrypteContent, keys, letters_search } = secureMessage.encryptMessage(content)

                let messageRes = await prisma.message.create({
                    data: {
                        id: messageData.id,
                        message_security: {
                            create: keys
                        },
                        encryptedContent: encrypteContent,
                        chatId: messageData.chatId,
                        replyToId: messageData.replyToId || messageData?.replyTo?.id,
                        senderId: messageData.senderId,
                        search_index: letters_search,
                    },
                    
                    select: {
                        id: true,
                        status : true
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
                            filename: m.filename,
                            size : m.size,

                        })),
                        skipDuplicates: true

                    })
                   
                }

                message = messageRes
            } else {
               let messageRes =  await prisma.message.create({
                    data: {
                        id: messageData.id,
                        chatId: messageData.chatId,
                        senderId: messageData.senderId,
                        media : {
                            createMany : {
                                 data: media.map((m) => ({
                            id: m.id,
                            type: m.type,
                            publicId: m.publicId,
                            url: m.url,
                            size : m.size,
                            filename: m.filename


                        }))
                            }
                        }
                    },select : {
                        id : true,
                        status : true
                    }
                })
                message = messageRes
            }
            if (message?.id){
                 await prisma.chat.update({
                where : {
                    id : messageData.chatId,
                },
                data : {
                    lastMessageId : message.id
                }
            })
            }
            if (message.id && !message.status){
                message.status = []
            }
            
            return res.status(201).json({message})
        } catch (error) {
            next(error)
        }
}

export const markAsRead = async (req ,res , next)=>{
    try {
        let user = req.user
        let chatId = req.query.chatId
         let messages = await  prisma.message.findMany({
            where : {
                chatId,
                status : {
                    some : {
                        
                        userId : user.id,
                        status : "DELIVERED"
                    },
                },
              
            },
            orderBy : {
                createdAt : "desc"
            },
            select : {
            id : true,
            senderId : true
            }
         }) 
         let messageIds = messages.map((msg)=>msg.id)
         let readAt = new Date()
         if (!messages.length) return res.status(200).json(null)
             let {count} = await prisma.status.updateMany({
                 where : {
                     messageId : {
                           in : messageIds
                            },
                        userId : user.id
                    },
                    data : {
                        status : "READ",
                        readAt : readAt
                    }
                })
                if (count === 0) return res.status(200).json({count})
            
                
                res.status(200).json({count , readAt})
    } catch (error) {
        next(error)
    }
}



export const searchMessages = async (req , res , next )=>{
    try {
        let  {content,from , to ,order , senderIds  ,chatId} = req.body
       
        let user = req.user
        let where  = {chatId}
        if (content){
             let {n_grams} = secureMessage.content_ngrams(content)
             
             where.search_index = {
                hasEvery : n_grams
               }

         }
       let conditions = []
            if (from){
                const [year, month, day] = from.split("-");
                let correctedDate = new Date(Number(year),Number(month)-1,day)
                conditions.push({createdAt : {gte : correctedDate }})
            }
            if (to){
                const [year, month, day] = to.split("-");
                let correctedDate = new Date(Number(year),Number(month)-1,day+1)

                conditions.push({createdAt : {lte :correctedDate  }}) 
            }
      if (conditions.length > 0){
        where.AND = conditions
      }
         if (senderIds?.length > 0){
            where.senderId = {
                    in : senderIds
                }

         }
          let searched_messages = await prisma.message.findMany({
           where,
                orderBy :{
                    createdAt : order || "desc"
                },
                take : 40,
                    select: {
                       id : true,
                        chatId: true,
                        
                        reactions: {
                            include : {
                                reactors : {
                                    select : {
                                        userId : true,
                                        id : true
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
                                message_security : true

                            }
                        },
                        encryptedContent: true,


                        _count: {
                            select: {
                                replies: true,
                                media : true
                            }
                        },
                        status: {
                            where : {
                                userId : {
                                    not : user.id
                                }
                            }
                        },
                        message_security: true,
                        createdAt: true,
                        updatedAt: true,
                    }

                
            
          })
            let decryptedMessages = searched_messages.map((msg) => {
            if (msg?.replyTo?.id) {

                let decryptedReplyTo = secureMessage.transformDecryptData(msg.replyTo.encryptedContent, msg.replyTo.message_security,msg.replyTo)
                msg.replyTo = decryptedReplyTo
            }
           return secureMessage.transformDecryptData(msg.encryptedContent, msg.message_security , msg)
           
        })
      
          res.status(200).json({search_result :  decryptedMessages})
    } catch (error) {
        next(error)
    }
}


 

// export const generateMediaUrl = async (req, res, next) => {
//     let data = req.body

//     try {


//         let objectKey = `/media/${data.chatId}/${crypto.randomUUID()}`
//         let command = new PutObjectCommand({
//             Bucket: process.env.BUCKET_KEY,
//             Key: objectKey,
//             ContentType: data.type,
//             ServerSideEncryption: "AES256"
//         })

//         let uploadUrl = new getSignedUrl(s3, command, { expiresIn: 60 * 5 })

//         return res.status(201).json({ uploadUrl, objectKey })

//     } catch (error) {
//         next(error)
//     }
// }

// export const getMediaUrl = async (req, res, next) => {
//     let data = req.body
//     try {


//         let command = new GetObjectCommand({
//             Bucket: process.env.BUCKET_AWS,
//             Key: data.objectKey
//         })
//         let preSignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 3 })
//         return res.status(201).json({ url: preSignedUrl })
//     } catch (error) {
//         next(error)
//     }
// }


export const updateMessage = async (req, res, next) => {
    let message = req.body

    try {
        if (message.senderId !== req.user.id) {
            throw createError(400, { message: "you don't have permission to edit this message" })
        }
        let data;
        if (message.content){

            let { encrypteContent, keys } = secureMessage.encryptMessage(message.content)
            let {n_grams} = secureMessage.content_ngrams(message.content)
            let updatedMessage = await prisma.message.update({
            where: {
                id: message.id,
            },
            data: {
                message_security: {
                    upsert : {
                        update : keys,
                        create : keys
                    }
                },
                encryptedContent: encrypteContent,
               
                search_index : {
                    set : n_grams
                }
            },
            select : {
                id : true,
                updatedAt : true
            }
        })
        if (!updatedMessage.id) throw createError(500, { message: "error updating message try again" })
        data = {messageId : updatedMessage.id , updatedAt : updatedMessage.updatedAt}
        }else{
                let updatedMessage = await prisma.message.update({
            where: {
                id: message.id,
            },
            data: {
                message_security: {
                    delete: true
                },
                encryptedContent: "",
                search_index : [],
                
            },
            select : {
                id : true,
                updatedAt : true
            }
        })
                data = {messageId : updatedMessage.id , updatedAt : updatedMessage.updatedAt}

            }
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

export const deleteMessage = async (req, res, next) => {

    let {messageId , senderId , chatId} = req.body
    if (senderId !== req.user.id){
        throw createError(403, { message: "you don't have permission to delete this message" })
    }
    try {
        let deletedMessage = await prisma.message.deleteMany({
            where: {
                id: messageId,
                senderId: req.user.id
            }
        })
        
        if (deletedMessage.count === 0) {
            throw createError(500, { message: "Error deleting message try again" })
        }
        setImmediate(async ()=>{
        try {
            let lastMessage = await prisma.message.findFirst({
                where : {
                    chatId
                },
               orderBy : {
                   createdAt : "desc"
               },
               take : 1,
               select : {
                   id : true
               }
            })
            await prisma.chat.update({
               where : {
                   id : chatId
               },
               data : {
                   lastMessageId : lastMessage?.id || null
                }
            })
        } catch (error) {
            console.log(error?.message)
        }
        })
        res.status(200).json({ message: "Message deleted" })
    
      

    } catch (error) {
        next(error)
    }
}


export const createReaction = async (req, res, next) => {
    let data = req.body
    try {


        let reaction = await prisma.reaction.create({
            data: {
                id : data.id,
                messageId: data.messageId,
                emoji: data.emoji,
                name: data.name,
                reactors : {
                    create : {
                        id : data.reactors[0].id,
                        userId : data.reactors[0].userId,
                    }
                }
            },
            select : {
                id : true
            }
        })
        res.status(201).json({ reactionId : reaction.id })
    } catch (error) {
        next(error)
    }
}
export const removeReaction = async (req , res , next)=>{
    let data =req.body
    try {
        let removedReaction = await prisma.reactionUsers.delete({
            where :  {
             id : data.id
            },
            select : {
                reactionId : true
            }
        })
            return res.status(200).json({reactionId : removedReaction.reactionId})
    } catch (error) {
        next(error)
    }
} 
export const addReaction =  async (req ,res ,next)=>{
   let data = req.body
    try {
        let addReaction = await prisma.reactionUsers.create({
            data :  {
                reactionId : data.reactionId,
                userId : req.user.id,
                id : data.reactorId
            },
            select : {
                reactionId : true
            }
        })
            return res.status(201).json({reactionId : addReaction.reactionId})

    } catch (error) {
        next(error)
    }
}
export const deleteReaction = async (req, res, next) => {
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
    let { messageId , chatId , order , limit } = req.query
    let user = req.user
    if (!messageId) {
        throw createError(400, { message: "messageId is required to get more messages" })
    }
    try {
      let messages = await getOlderMessages({messageId , chatId ,order , userId : user.id , limit : Number(limit) })

        let decryptedMessages = messages.map((msg) => {
            if (msg?.replyTo?.id) {

                let decryptedReplyTo = secureMessage.transformDecryptData(msg.replyTo.encryptedContent, msg.replyTo.message_security,msg.replyTo)
                msg.replyTo = decryptedReplyTo
            }
           return secureMessage.transformDecryptData(msg.encryptedContent, msg.message_security , msg)
           
        })

       

        res.status(200).json({ messages: decryptedMessages })
    } catch (error) {
        next(error)
    }
}
export const jumpToMessage= async (req , res , next)=>{
    try{
        let userId = req.user.id
        let {messageId , chatId , limit,createdAt} = req.query
        if (!chatId || !messageId) throw createError(400,{message : "chatId and messageId are required"})
        let prevMessages = await getOlderMessages({messageId , chatId , userId , limit : Number(limit) , order : "desc",skip : 0 })
       
        let latestMessages = await getOlderMessages({messageId , chatId , userId , limit : Number(limit) , order : "asc" , skip : 1 })
      
        let mergedMessages = [...prevMessages.reverse() , ...latestMessages]
          let decryptedMessages = mergedMessages.map((msg) => {
            
            if (msg?.replyTo?.id) {

                let decryptedReplyTo = secureMessage.transformDecryptData(msg.replyTo.encryptedContent, msg.replyTo.message_security,msg.replyTo)
                msg.replyTo = decryptedReplyTo
            }
           return secureMessage.transformDecryptData(msg.encryptedContent, msg.message_security , msg)
           
        })
        res.status(200).json({ messages: decryptedMessages })
       
    }catch(err){
        console.log(err.message)
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

// export const uploadImages = async (req , res , next)=>{
//         let files = req.files
//         if (files.length === 0) return res.status(400).json({message : "please provide files to upload"})
        
//             try {
                
//                 let uploadedFiles = await Promise.all(
//                     files.map((file)=>
//                         uploadToCloudinary(file.buffer)
//                 )
//             )
//             return res.status(200).json(uploadedFiles.map(file=>({secure_url : file.secure_url , public_Id : file.public_id})))
//         } catch (error) {
//             next(error)
//         }
// }