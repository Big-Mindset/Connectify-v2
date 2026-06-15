
import { AccessToken } from "livekit-server-sdk"
import { roomClient } from "../lib/livekit.js"
export async function getLiveKitToken(req, res, next) {
    let { groupId, participantId } = req.body
    if (!groupId || !participantId) {
        return res.status(400).json({ message: "groupId and participantId are required" })
    }
    try {

        let token = new AccessToken(process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_SECRET_KEY,
            { identity: participantId, ttl: "1h" })
        token.addGrant({
            room: groupId,
            canPublish: true,
            canSubscribe: true,
            roomJoin: true,
            canPublishData: true
        })
        return res.status(200).json({
            token: await token.toJwt(),
            url: process.env.LIVEKIT_URL
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

export async function getRoomParticipants(req, res, next) {
    try {
        let { roomId, participantId } = req.params
        if (!roomId || !participantId) {
            return res.status(400).json({ message: "roomId and participantId are required" })
        }
        let roomParticipants = await roomClient.listParticipants(roomId)
        return res.status(200).json({roomParticipants})
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
export async function deleteRoom(req, res, next) {
    try {
        let { roomId } = req.params
        if (!roomId ) {
            return res.status(400).json({ message: "roomId is required" })
        }
        let res = await roomClient.deleteRoom(roomId)
        
        return res.status(200).json({message : "Room deleted"})
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}