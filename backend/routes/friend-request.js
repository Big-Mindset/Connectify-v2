import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { accept_friendrequest, cancel_request, get_friendrequest, get_friendrequests, reject_friendrequest, send_friendrequest } from "../controller/friends.js"
import { getAllFriends, handleGetUserdata } from "../controller/chat.js"
let router = express.Router()

router.get("/",(req , res)=>{
     res.send("perfect")
})

router.use(protectRoute)

router.post("/send-request" , send_friendrequest)
router.post("/accept-request",accept_friendrequest)
router.delete("/cancel-request",cancel_request)
router.put("/reject-request",reject_friendrequest)
router.get("/get-requests"  , get_friendrequests)
router.get("/get-request",get_friendrequest)
router.get("/all-friends" , getAllFriends)
router.get("/user-data" , handleGetUserdata)
// router.get("/get-user"  , getUser)
// router.get("/send",(req , res)=>{

// })

export default router