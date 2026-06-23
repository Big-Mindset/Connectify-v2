
import { prisma } from "../prismaClient.js"
import createError from "http-errors"
import { getChat } from "../lib/database-queries.js"
import { getMessageData } from "./chat.js"
import { client } from "../lib/redis.js"

export let send_friendrequest = async (req, res, next) => {
    let senderId = req.user.id
    let username = req.body.username
    if (username === req.user.username) {
        return res.status(400).json({ message: "Please enter a correct username" })

    }
    try {
        let user = await prisma.user.findUnique({
            where: {
                username
            },
            select: {
                id: true
            }
        })
        if (!user?.id) {
            return res.status(404).json({ message: "User doesn't exist with this username" })
        }
        let receiverId = user.id
        let request = await prisma.request.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            select: {
                id: true,
                status: true
            }
        })
        console.log(request)
        if (request && request?.id) {
            if (request.status === "Accepted") throw createError(409, { message: "The user is already your friend" })
            if (request.status === "Rejected") {
                await prisma.request.update({
                    where: {
                        id: request.id
                    },
                    data: {
                        status: "Pending"
                    }
                })
                let payload = {
                    requestId: request.id,
                    userId: receiverId
                }
                return res.status(201).json({ message: "freind request sent to " + req.user.name, payload })

            }
            throw createError(409, { message: "can't send multiple request to one user" })
        }
        if (senderId === receiverId) {
            throw createError(400, "Invalid request")
        }


        let new_request = await prisma.request.create({
            data: {
                senderId,
                receiverId
            },
            select: {
                id: true
            }
        })
        console.log(new_request)
        if (!new_request?.id) {
            throw createError(500, { message: "Internal server Error" })
        }
        let payload = {
            requestId: new_request.id,
            userId: receiverId,
            name: req.user.name
        }
        return res.status(201).json({ message: "freind request sent to " + req.user.name, payload })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}



export let accept_friendrequest = async (req, res, next) => {
    let requestId = req.body.id
    let userId = req.user.id
    try {


        let request = await prisma.request.findUnique({
            where: {
                id: requestId
            },
            select: {
                id: true,
                status: true
            }
        })
        if (request && request.id) {
            if (request.status === "Accepted") throw createError(409, { message: "The user is already your friend" })
        } else {
            throw createError(400, { message: "Request doesn't exist" })
        }

        let result = await prisma.$transaction(async (tx) => {

            let request = await tx.request.update({
                where: {
                    id: requestId
                },
                data: {
                    status: "Accepted"
                },
                select: {
                    id: true,
                    senderId: true,
                    receiverId: true
                }
            })
            let friendship = await tx.friendship.create({
                data: {
                    user1Id: request.senderId,
                    user2Id: request.receiverId,
                    chat: {
                        create: {

                            participants: {
                                create: [
                                    { userId: request.senderId },
                                    { userId: request.receiverId }
                                ]
                            }
                        },
                    },


                },
                select: {
                    id: true,
                    chat: {
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
                    }
                }

            })

            return { request, friendship }
        })

        if (!result.friendship.id) {
            throw createError(500, { message: "Error accepting request" })
        }
        let chat = result.friendship.chat
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

     

        return res.status(201).json({ message: "friend request accepted", 
            friendshipId: result.friendship.id, chat: { ...chat, lastMessagse: null,unread_messageCount : 0  , userData : {...dmUserData , isOnline}} })

    } catch (error) {
        next(error)
    }

}


export let reject_friendrequest = async (req, res, next) => {

    let requestId = req.query.requestId

    try {
        let request = await prisma.request.findUnique({
            where: {
                id: requestId
            },
            select: {
                id: true,
                status: true
            }
        })
        if (request && request.id) {
            if (request.status === "Accepted") throw createError(409, { message: "The user is already your friend" })
        } else {
            throw createError(400, { message: "Request doesn't exist" })
        }
        let req = await prisma.request.update({
            where: {
                id: requestId
            },
            data: {
                status: "Rejected"
            },
            select: {
                id: true
            }
        })
        if (!req.id) {
            throw createError(500, { message: "Error accepting request" })
        }
        return res.status(200).json({ message: "request rejected" })
    } catch (error) {
        next(error)
    }

}


export const cancel_request = async (req, res, next) => {
    let requestId = req.query.id
    try {
        let reqeust = await prisma.request.findUnique({
            where: {
                id: requestId
            },
            select: {
                status: true
            }
        })
        if (reqeust.status !== "Pending") {
            return res.status(400).json({ message: "Error canceling request" })
        }
        let deletedRequest = await prisma.request.delete({
            where: {
                id: requestId
            },
            select: {
                id: true
            }
        })
        if (!deletedRequest.id) return res.status(500).json({ message: "Error canceling request" })
        return res.status(200).json({ message: "Request canceled" })
    } catch (error) {
        next(error)
    }
}


export let get_friendrequests = async (req, res, next) => {
    let user = req.user
    try {

        let friendRequests = await prisma.request.findMany({
            where: {
                OR: [
                    { receiverId: user.id },
                    { senderId: user.id }
                ],
                status: "Pending"
            },
            select: {
                id: true,
                sender: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        username: true
                    },

                },
                receiver: {
                    select: {
                        image: true,
                        name: true,
                        id: true,
                        username: true

                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 20
        })

        return res.status(200).json({ friendRequests })

    } catch (error) {
        next(error)
    }
}

export let get_friendrequest = async (req, res, next) => {
    let requestId = req.query.requestId
    try {
        let request = await prisma.request.findUnique({
            where: {
                id: requestId
            },
            select: {
                sender: {
                    select: {
                        id: true,
                        bio: true,
                        name: true,
                        image: true,
                        username: true
                    }

                },
                status: true,
                id: true
            }
        })

        if (!request?.id) throw createError(400, { message: "Request doesn't exist" })
        return res.status(200).json({ request })
    } catch (error) {
        next(error)
    }
}

export let getMore_friendrequests = async (req, res, next) => {
    let requestId = req.body.requestId
    try {


        let moreRequests = await prisma.request.findMany({
            cursor: {
                id: requestId
            },

            skip: 1,
            take: 20,
            select: {
                sender: {
                    select: {
                        image: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }

        })
        return res.status(200).json({ moreRequests })

    } catch (error) {
        next(error)
    }
}


