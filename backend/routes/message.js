import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { addReaction, clearMessages, createMessage, createReaction, deleteMessage, deleteReaction, generateMediaUrl, markAsRead, moreMessages, removeReaction, searchMediaMessages, searchMessages, updateMessage } from "../controller/messages.js"

let router = express.Router()
router.use(protectRoute)
router.post("/create-message",createMessage)
router.put("/mark-asread",markAsRead)
router.post("/generate-bucketUploadUrl",generateMediaUrl)
router.put("/edit-message",updateMessage)
router.delete("/delete-message",deleteMessage)
router.post("/create-reaction",createReaction)
router.delete("/delete-reaction",deleteReaction)
router.post("/add-reaction",addReaction)
router.delete("/remove-reaction",removeReaction)
router.get("/get-moreMessages",moreMessages)
router.put("/clear-messages"  , clearMessages)
// router.put("/disappear-messages",disappearMessages)
router.get("/search-messages",searchMessages)
router.get("/search-messages-media",searchMediaMessages)
export default router