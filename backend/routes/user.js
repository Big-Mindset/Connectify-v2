import express from "express"
import searchUser, { addUsername, getOnlineUsers, handleSignUp, setPassword } from "../controller/user.js"
import protectRoute from "../middleware/auth.middleware.js"
let router = express.Router()

router.get("/user-exist",searchUser)
router.put("/add-username",protectRoute,addUsername)
router.post("/set-password",protectRoute , setPassword)
router.post("/sign-up",handleSignUp)
export default router