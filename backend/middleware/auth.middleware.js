
import { auth } from "../lib/services/auth.js";

import createError from "http-errors"
export default async function protectRoute(req , res, next){
    try {
        let session = await auth.api.getSession({headers : req.headers })
     
        let user = session.user
        if (!session){
            throw createError(401,{message : "You are unauthorized" ,})
        }
        req.user = user
   
        next()
    } catch (error) {
        next(error)   
    }
}
