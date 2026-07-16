import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { addReaction, clearMessages, createMessage, createReaction, deleteMessage, deleteReaction, jumpToMessage, markAsRead, moreMessages, removeReaction, searchMessages, updateMessage } from "../controller/messages.js"
import rateLimit from "express-rate-limit"

let router = express.Router()
router.use(protectRoute)
let messageRateLimiter = rateLimit({
    windowMs : 2 * 1000,
    limit : 5,
    message :{
        error : "Too many messages sent. Try again in a moment."
    }
})
router.post("/create-message",messageRateLimiter,createMessage)
router.post("/search",searchMessages)
router.get("/jump-message",jumpToMessage)
router.put("/mark-asread",markAsRead)
router.put("/edit-message",updateMessage)
router.delete("/delete-message",deleteMessage)
router.post("/create-reaction",createReaction)
router.delete("/delete-reaction",deleteReaction)
router.post("/add-reaction",addReaction)
router.delete("/remove-reaction",removeReaction)
router.get("/get-moreMessages",moreMessages)
router.put("/clear-messages"  , clearMessages)
// router.put("/disappear-messages",disappearMessages)
// router.get("/search-messages",searchMessages)
// router.get("/search-messages-media",searchMediaMessages)
export default router