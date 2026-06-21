import {client} from "../redis.js"
export class ChatConnection {
    constructor(redisClient = client){
        this.redis = redisClient
    }
     async JoinChat(socket,chatId) {
            let userId = socket.handshake.auth.userId
        try {
            let prevChat = await this.redis.GET(`user-activeChat:${userId}`)
       
            if (prevChat === chatId) return
            if (prevChat && prevChat !== chatId) {
                await this.LeaveRoom(socket , prevChat , userId)
            }
            socket.join(chatId)
            let pipeline = this.redis.multi()

             pipeline.sAdd(`active-chat:${chatId}`, userId)
             pipeline.SET(`user-activeChat:${userId}`, chatId)
            await pipeline.exec()
        } catch (error) {
            console.log(error.message)
        }
    }
    async LeaveRoom(socket,chatId , userId){
        try {
            let pipeline = this.redis.multi()
            pipeline.sRem(`active-chat:${chatId}`, userId)
            pipeline.get(`user-activeChat:${userId}`)
            let [res , currentActiveChat] = await pipeline.exec()
            console.log(currentActiveChat , chatId)
            if (currentActiveChat === chatId){
                await this.redis.del(`user-activeChat:${userId}`)
                socket.leave(chatId)
            }
        } catch (error) {
            console.log(error.meessage)
        }
    }
}