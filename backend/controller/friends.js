import { prisma } from "../prismaClient.js"
import createError from "http-errors"
export let send_friendrequest = async (req, res, next) => {

    let senderId = req.user.id
    let receiverId = req.body.receiverId
    let request = await prisma.request.findFirst({
        where: {
            OR: [
                { receiverId, senderId },
                { receiverId, senderId }
            ]
        },
        select: {
            id: true,
            status: true
        }
    })
    if (request && request.id) {
        if (request.status === "Accepted") throw createError(409, { message: "The user is already your friend" })
        throw createError(409, { message: "can't send multiple request to one user" })
    }
    try {
        if (senderId === receiverId) {
            throw createError(400, "Invalild request")
        }


        let requestId = await prisma.request.create({
            data: {
                senderId,
                receiverId
            },
            select: {
                id: true
            }
        })
        if (!requestId.id) {
            throw createError(500, { message: "Internal server Error" })
        }
        return res.status(201).json({ message: "freind request sent to" + req.user.name })
    } catch (error) {
        next(error)
    }
}



export let accept_friendrequest = async (req, res, next) => {
    let requestId = req.body.id
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
                        }
                    }

                },

            })

            return friendship
        })

        if (!result.id) {
            throw createError(500, { message: "Error accepting request" })
        }
        return res.status(201).json({ message: "friend request accepted", friendship: result.friendship })

    } catch (error) {
        next(error)
    }

}


export let reject_friendrequest = async (req, res, next) => {

    let requestId = req.body.requestId

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

export let get_friendrequest = async (req, res, next) => {
    let user = req.user
    try {

        let friendRequests = await prisma.request.findMany({
            where: {
                receiverId: user.id,
                status: "Pending"
            },
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
            },
            take: 20
        })
        return res.status(200).json({ friendRequests })

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


export const getUser = async (req ,res , next)=>{
    let username = req.params
    try {
        let user = await prisma.user.findUnique({
            where : {
                username
            },
            select : {
                id : true,
                displayUsername : true,
                image : true
            }
        })
        res.status(200).json({user})
    } catch (error) {
        next(error)
    }
}