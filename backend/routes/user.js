import express from "express"
import searchUser from "../controller/user.js"
let router = express.Router()

router.get("/user-exist",searchUser)

export default router