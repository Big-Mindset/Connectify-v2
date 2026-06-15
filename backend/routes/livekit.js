import express from "express"
import { deleteRoom, getLiveKitToken, getRoomParticipants } from "../controller/livekit.js"

let router = express.Router()

router.post("/token",getLiveKitToken)
router.get("/:roomId/participants",getRoomParticipants)
router.delete("/:roomId",deleteRoom)

export default router