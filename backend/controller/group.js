import { prisma } from "../lib/services/prismaClient.js"
import createError from "node:http"
import { getMessageData } from "./chat.js"

export const getGroups = async (req, res, next) => {
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
    try {

        let groups = await prisma.chat.findMany({
            where: {
                isGroup: true,
                participants: {
                    some: {
                        userId: req.user.id
                    }
                },

            },
            select: selectData
        })

        res.status(200).json({ groups })
    } catch (error) {
        next(error)
    }
}


export const changeGroupData = async (req, res, next) => {
    let { group_data, groupId } = req.body
    try {
        let isAdmin = await prisma.chatParticipant.findUnique({
            where: {
                chatId,
                userId: req.user.id
            },
            select: {
                role: true
            }
        })
        if (isAdmin.role !== "ADMIN") {
            throw createError(403, { message: "Only admin can change roles" })
        }
        let updatedGroup = await prisma.chat.update({
            where: {
                id: groupId
            },
            data: {
                ...(group_data.name && { name: group_data.name }),
                ...(group_data.description && { description: group_data.description }),
                ...(group_data.pfp && {
                    pfp: {
                        create: group_data.pfp
                    }
                }),

            },
            select: {
                id: true
            }
        })
        return res.status(200).json({ groupId: updatedGroup.id })
    } catch (error) {
        next(error)
    }
}


export const changeUserRole = async (req, res, next) => {
    let { participantId, role, chatId } = req.body

    try {
        if (!groupId || !participantId || !role) {
            throw createError(400, { message: "Request can't be processed with incomplete data" })
        }
        let userRole = await prisma.chatParticipant.findUnique({
            where: {
                userId: req.user.id,
                chatId
            },
            select: {
                role: true,
                id: true
            }
        })
        if (userRole.role === "MEMBER") {
            throw createError(403, { message: "Only owner or admin can change roles" })
        }
        let parti = await prisma.chatParticipant.findUnique({
            where: {
                id: participantId
            },
            select: {
                role: true
            }
        })
        if (parti.role === "OWNER") {
            throw createError(403, { message: "Admin can't change owner-role" })

        }
        if (userRole.role === "OWNER" && role === "OWNER" && participantId !== userRole.id) {
            let [partId, userId] = await prisma.$transaction(
                [prisma.chatParticipant.update({
                    where: {
                        id: participantId
                    },
                    data: {
                        role: "OWNER"
                    },
                    select: {
                        id: true
                    }
                }),
                prisma.chatParticipant.update({
                    where: {
                        id: userRole.id
                    },
                    data: {
                        role: "ADMIN"
                    },
                    select: {
                        id: true
                    }
                })
                ])
            if (partId && userId) return res.status(200).json({ participantId })
            throw createError(500, { message: "Internal server error please try again" })
        }
        let updatedParticipant = await prisma.chatParticipant.update({
            where: {
                id: participantId,
            },
            data: {
                role
            },
            select: { id: true }
        })
        return res.status(200).json({ groupId: updatedParticipant.id })
    } catch (error) {
        next(error)
    }
}


export const createGroup = async (req, res, next) => {
    let userId = req.user.id
    let { name, description, participantIds, media, chatId } = req.body
    try {


        if (!name.trim()) {
            throw createError(400, { message: "Group-name is required" })
        }
        if (!participantIds.length) {
            throw createError(400, { message: "Choose participants to create a group" })
        }
        participantIds.push(userId)
        let image = media?.url ?  {
            create: {
                publicId: media.publicId,
                url: media.url,

            }
        } : null
        
        let newGroup = await prisma.chat.create({
            data: {
                id: chatId,
                name,
                description,
                participants: {
                    createMany: {
                        data: participantIds.map((id) => {
                            if (id === userId) return { userId: id, role: "OWNER" }
                            return { userId: id , role : "MEMBER" }
                        })
                    }
                },
                isGroup: true,
                ...(image && { image }),
        },
            select : getMessageData(userId)
        })
    return res.status(201).json({ group: newGroup })
} catch (error) {
    next(error)
}
}


export const leaveGroup = async (req, res, next) => {

    let { groupId } = req.params
    try {
        let userRole = await prisma.chatParticipant.findUnique({
            where: {
                userId: req.user.id,
                chatId: groupId
            },
            select: {
                role: true,
                id: true
            }
        })
        if (!userRole.id) {
            throw createError(404, { message: "chat-participant not found" })
        }
        if (userRole === "OWNER") {
            let [_, newOwner] = await prisma.$transaction([
                prisma.chatParticipant.delete({
                    where: {
                        id: userRole.id
                    },
                    select: {
                        id: true
                    }
                }),
                prisma.chatParticipant.update({
                    where: {
                        OR: [
                            { role: "ADMIN" },
                            { role: "MEMBER" }
                        ]
                    },
                    data: {
                        role: "ADMIN"
                    }
                })
            ])
            return res.status(200).json({ newOwner })
        }



        let { id } = await prisma.chatParticipant.delete({
            where: {
                chatId: groupId,
                userId: req.user.id
            },
            select: {
                id: true
            },
        })
        // todo - delete group if no users left
        res.status(200).json({ groupId: id })
    } catch (error) {
        next(error)
    }
}

export const kickUser = async (req, res, next) => {
    let { participantId, chatId } = req.params
    try {
        let userRole = await prisma.chatParticipant.findUnique({
            where: {
                userId: req.user.id,
                chatId
            },
            select: {
                role: true
            }
        })
        if (userRole.role !== "OWNER") {
            throw createError(400, { message: "Only owner can remove users" })
        }
        let { id } = await prisma.chatParticipant.delete({
            where: {
                id: participantId,
                role: {
                    not: "OWNER"
                }
            },
            select: {
                id: true
            }

        })
        return res.status(200).json({ participantId: id })
    } catch (error) {
        next(error)
    }
}

export const inviteUser = async (req, res, next) => {
    let { userIds, chatId, } = req.body
    try {
        if (!userIds.length || !chatId) {
            throw createError(400, { message: "required fields are missing to invite user" })
        }
        let user = await prisma.chatParticipant.findUnique({
            where: {
                userId: req.user.id,
                chatId
            },
            select: {
                role: true
            }
        })
        if (user.role === "MEMBER") {
            throw createError(400, { message: "Member can't invite users" })
        }
        let new_participants = await prisma.chatParticipant.createMany({
            data: userIds.map((id) => ({
                chatId,
                userId: id
            })),
            skipDuplicates: true,
        })

        res.status(200).json({ new_participants })
    } catch (error) {
        next(error)
    }
}





