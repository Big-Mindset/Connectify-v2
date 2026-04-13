import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import {  get_chats, get_unreadedChats, getChatbyId } from "../controller/chat.js"
import { createGroup } from "../controller/group.js"
let router = express.Router()

// router.get("/",(req , res)=>{

// })

router.use(protectRoute)

router.get("/:id",getChatbyId)
router.get("/chats",get_chats)
router.get("/chats_unreaded",get_unreadedChats)
router.post("/create-group",createGroup)
export default router