
import { fromNodeHeaders } from "better-auth/node"
import { auth } from "../lib/auth.js"
import { prisma } from "../prismaClient.js"
import { client } from "../lib/redis.js"
import { filterOnline, getFriendIds } from "../lib/user-queries.js"

export default async function searchUser(req, res, next) {
    let { username } = req.query

    if (!username || !username.trim()) {
        return res.status(400).json({ message: "Please enter username" })
    }
    try {
        let user = await prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true
            }
        })
        return res.status(200).json({ userId: user?.id || null })
    } catch (error) {
        next(error)
    }
}

export async function isAuthenticated(req, res) {
    return res.status(200).json({ user: req?.user || null })

}

export async function addUsername(req, res, next) {
    let user = req.user
    let { username } = req.body
    try {
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                username
            },
            select: {
                id: true,
                username: true
            }
        })
        res.send(200).json({ message: "username added successfully" })
    } catch (error) {
        next(error)
    }

}

export async function getOnlineUsers(req, res, next) {
    try {
        let user = req.user
        let friendIds = await getFriendIds(user.id)
        if (friendIds.length === 0) return res.status(200).json({onlineUsers : []})
        let onlineUsers = await filterOnline(friendIds)
        
        return res.status(200).json({onlineUsers })
        
        
    } catch (error) {
        next(error)
    }
}