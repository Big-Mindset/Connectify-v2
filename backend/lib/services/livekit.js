import {RoomServiceClient} from "livekit-server-sdk"


export let roomClient = new RoomServiceClient(process.env.LIVEKIT_URL , process.env.LIVEKIT_API_KEY , process.env.LIVEKIT_API_SECRET)
