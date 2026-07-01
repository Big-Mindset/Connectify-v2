import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import {  blockedChat, get_chat, get_chats, get_unreadedChats, getChatbyId } from "../controller/chat.js"
let router = express.Router()

// router.get("/",(req , res)=>{

// })

router.use(protectRoute)

router.get("/chatinfo",get_chat)
router.get("/chats",get_chats)
router.get("/:id",getChatbyId)
router.get("/chats_unreaded",get_unreadedChats)
router.get("/blocked_users" , blockedChat)
export default router