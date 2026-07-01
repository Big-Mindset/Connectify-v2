import { openDB } from "idb"

export class dbMessage {
    constructor() {
        this.db = null
    }
    async getDb() {
        console.log("the database is "+this.db)
        if (this.db) return this.db

        let initDb = openDB("Connectify-retry", 1, {
            upgrade(db) {
                let messageStore = db.createObjectStore("chat-messages", {
                    keyPath: "id"
                })
                messageStore.createIndex("chatId", "chatId")
                messageStore.createIndex("messageId", "id")

            }
        })
        let db = await initDb
        
        this.db = db
        return db

    }
    async addMessage(message) {
        let db = await this.getDb()
       
        await db.add("chat-messages", message)
    }
    async deleteMessage(messageId) {
        let db = await this.getDb()
        await db.delete("chat-messages", messageId)

    }
    async getAllMessages(chatId) {
        let db = await this.getDb()
      let messages = await db.getAllFromIndex("chat-messages","chatId",chatId)
       return messages
    }
}