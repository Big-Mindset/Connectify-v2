import express from "express"
import protectRoute from "../middleware/auth.middleware.js"
import { changeGroupData, changeUserRole, createGroup, getGroups, inviteUser, kickUser, leaveGroup } from "../controller/group.js"

let router = express.Router()

router.use(protectRoute)


router.get("/get-groups",getGroups)
router.put("/update-data",changeGroupData)
router.put("/update-role",changeUserRole)
router.post("/create",createGroup)
router.delete("/leave/:groupId",leaveGroup)
router.delete("/kick-user",kickUser)
router.post("invite-user",inviteUser)

export default router