import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { accept_friendrequest, get_friendrequest, getUser, reject_friendrequest, send_friendrequest } from "../controller/friends.js"
let router = express.Router()

router.get("/",(req , res)=>{
    console.log("runssss")
     res.send("perfect")
})

router.use(protectRoute)

router.post("/send-request" , send_friendrequest)
router.post("/accept-request",accept_friendrequest)
router.post("/reject-request",reject_friendrequest)
router.get("/get-requests"  , get_friendrequest)
router.get("/get-user"  , getUser)
// router.get("/send",(req , res)=>{

// })

export default router