import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { clearMessages, createMessage, createReactions, deleteMessage, deleteRection, generateMediaUrl, moreMessages, searchMediaMessages, searchMessages, updateMessage } from "../controller/messages.js"
import multer from "multer";

let router = express.Router()
router.use(protectRoute)
router.post("/create-message",createMessage)
router.post("/generate-bucketUploadUrl",generateMediaUrl)
router.put("/edit-message",updateMessage)
router.delete("/delete-message",deleteMessage)
router.post("/create-reaction",createReactions)
router.delete("/delete-reaction",deleteRection)
router.get("/get-moreMessages",moreMessages)
router.put("/clear-messages"  , clearMessages)
// router.put("/disappear-messages",disappearMessages)
router.get("/search-messages",searchMessages)
router.get("/search-messages-media",searchMediaMessages)
export default router