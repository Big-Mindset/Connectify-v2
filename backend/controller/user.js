
import { fromNodeHeaders } from "better-auth/node"
import { auth } from "../lib/auth.js"
import { prisma } from "../prismaClient.js"

export default async function searchUser(req , res , next){
    let {username} = req.query

    if (!username || !username.trim()){
        return res.status(400).json({message : "Please enter username"})
    }
    try {   
        let user = await prisma.user.findUnique({
            where : {
                username ,
            },
            select : {
                id : true
            }
        })
        return res.status(200).json({userId : user?.id || null})
    } catch (error) {
        next(error)
    }
}

export async function isAuthenticated(req, res) {
    return res.status(200).json({user : req?.user || null})
   
}