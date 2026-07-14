
import createError from "http-errors"

import { prisma } from "../lib/services/prismaClient.js"
import { filterOnline, getFriendIds } from "../lib/database-queries.js"
import { auth } from "../lib/services/auth.js"

export default async function searchUser(req, res, next) {
    let { username } = req.query

    if (!username || !username.trim()) {
        throw createError(400, { message: "username is required" })
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
    if (req.user === null) {
        throw createError(401, { message: "Unauthenticated" })
    }
    return res.status(200).json({ user: req?.user || null })

}

export async function addUsername(req, res, next) {
    let user = req.user
    let { username } = req.body
    if (!username) {
        throw createError(400, { message: "username is required" })
    }
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
        if (friendIds.length === 0) return res.status(200).json({ onlineUsers: [] })
        let onlineUsers = await filterOnline(friendIds)

        return res.status(200).json({ onlineUsers })


    } catch (error) {
        next(error)
    }
}

export async function setPassword(req, res, next) {
    try {
        console.log(req.headers)
        let data = req.body
        if (!data?.password) {
            throw createError(400, { message: "password is required" })
        }
        let response = await auth.api.setPassword({
            headers: req.headers,
            body: {
                newPassword: data.password
            },

        })
        return res.status(200).json(null)

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

export async function handleSignUp(req, res, next) {

    try {
        let data = req.body
        let user = await prisma.user.findUnique({
            where : {
                email : data.email
            },
            select :{
                id : true,
                emailVerified : true
            }
        })
        if (user?.id){
            if (user?.emailVerified){

                return res.status(409).json({message : "User already exist"})
            }else{
                auth.api.sendVerificationEmail({
                    body : {
                        email : data.email,
                        callbackURL : "/"
                    }
                })
                return res.status(200).json({message : "verify your email" , error : "EMAIL_NOT_VERIFIED"})

            }
        }

         await auth.api.signUpEmail({
            body: {
                email: data.email,
                name: data.name,
                password: data.password,
                username : data.username
            },
            headers : req.headers
        })
       res.status(201).json(null)
    } catch (error) {
        next(error)
    }
}