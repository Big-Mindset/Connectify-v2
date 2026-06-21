import { client } from "../redis.js";

let HEARTBEAT_TTL = 120
let HEARTBEAT_INTERVAL = 15
export class UserConnection {
    constructor() {
        this.client = client
    }
    async setOnline(socketId, userId) {

        const currentSocketId = await this.client.get(`user-socket:${userId}`);
  
        const pipeline = this.client.multi();

        if (currentSocketId && currentSocketId !== socketId) {
            pipeline.del(`socket-user:${currentSocketId}`);
        }
        pipeline.set(`user-socket:${userId}`, socketId, { EX: HEARTBEAT_TTL })
        pipeline.set(`socket-user:${socketId}`, userId, { EX: HEARTBEAT_TTL })
        pipeline.sAdd(`online-users`, userId)
        await pipeline.exec()

    }
    async setOffline(socketId, userId) {
        let currentSocketId = await client.get(`user-socket:${userId}`)
   
        let pipeline = client.multi()
        pipeline.del(`socket-user:${socketId}`)
        let isLastSocket = currentSocketId === socketId
    
        if (isLastSocket) {
      

            pipeline.del(`user-socket:${userId}`)
            pipeline.sRem("online-users", userId)
        }
        await pipeline.exec()
        return isLastSocket
    }
    async isOnline(userId) {
        return (await client.exists(`user-socket:${userId}`)) > 0

    }
    async refreshHeartbeat(socketId, userId) {
        let currSocketId = await client.get(`user-socket:${userId}`)
        if (currSocketId !== socketId) return
        let pipeline = client.multi()
        pipeline.expire(`user-socket:${userId}`, HEARTBEAT_TTL)
        pipeline.expire(`socket-user:${socketId}`, HEARTBEAT_TTL)
        await pipeline.exec()
    }
    
}