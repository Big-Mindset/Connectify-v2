import { create } from "zustand"
// const messages = [
//   {
//     id: "m1",
//     senderId: "user1",
//     chatId: "dm1",
//     content: "Hey Ahmed, are you free today?",
//     replyToId: null,
//     replyTo: null,
//     replies: [],
//     sender: { id: "user1", name: "Ali", email: "ali@example.com" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:00:00Z"),
//     updatedAt: new Date("2026-02-15T09:00:00Z"),
//     media: [],
//     status: "READ"
//   },
//   {
//     id: "m2",
//     senderId: "user2",
//     chatId: "dm1",
//     content: "Yeah bro, what's up?",
//     replyToId: "m1",
//     replyTo: {
//       id: "m1",
//       content: "Hey Ahmed, are you free today?",
//       sender: { name: "Ali" },
//       media: [] // no media in original message
//     },
//     replies: [],
//     sender: { id: "user2", name: "Ahmed", email: "ahmed@example.com" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:02:00Z"),
//     updatedAt: new Date("2026-02-15T09:02:00Z"),
//     media: [],
//     status: "READ"
//   },
//   {
//     id: "m3",
//     senderId: "user1",
//     chatId: "dm1",
//     content: "Can we meet at 6 PM?",
//     replyToId: null,
//     replyTo: null,
//     replies: [],
//     sender: { id: "user1", name: "Ali" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:05:00Z"),
//     updatedAt: new Date("2026-02-15T09:05:00Z"),
//     media: [],
//     status: "DELIVERED"
//   },
//   {
//     id: "m4",
//     senderId: "user2",
//     chatId: "dm1",
//     content: "Sure 👍",
//     replyToId: "m3",
//     replyTo: {
//       id: "m3",
//       content: "Can we meet at 6 PM?",
//       sender: { name: "Ali" },
//       media: [] // no media in original message
//     },
//     replies: [],
//     sender: { id: "user2", name: "Ahmed" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:06:00Z"),
//     updatedAt: new Date("2026-02-15T09:06:00Z"),
//     media: [],
//     status: "READ"
//   },
//   {
//     id: "m5",
//     senderId: "user1",
//     chatId: "dm1",
//     content: null,
//     replyToId: null,
//     replyTo: null,
//     replies: [],
//     sender: { id: "user1", name: "Ali" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:10:00Z"),
//     updatedAt: new Date("2026-02-15T09:10:00Z"),
//     media: [
//       { id: "media1", type: "IMAGE", url: "https://example.com/meeting-location.jpg" }
//     ],
//     status: "SENT"
//   },
//   {
//     id: "m6",
//     senderId: "user2",
//     chatId: "dm1",
//     content: "Nice location 🔥",
//     replyToId: "m5",
//     replyTo: {
//       id: "m5",
//       content: null,
//       sender: { name: "Ali" },
//       media: [{ type: "IMAGE" }] // added media type info
//     },
//     replies: [],
//     sender: { id: "user2", name: "Ahmed" },
//     chat: { id: "dm1" },
//     createdAt: new Date("2026-02-15T09:12:00Z"),
//     updatedAt: new Date("2026-02-15T09:12:00Z"),
//     media: [],
//     status: "READ"
//   }
// ];


export const chatStore = create((set, get) => ({
    replyingTo: {
        id: null,
        name: null
    },
    setReplyingTo: (data) => {
        set({ replyingTo: data })
    },
    chatInfo: {
        id: "chat1",
        participants: [
            {
                id : "participant-1",
                userId : "user2",

               user : {
                   name : "Alex",
                   lastseen : new Date()
                }
            },
            {       
                id : "participant-1",
            
                userId : "user1",
               user : {
                name : "Wadood",

            }
        }
        ],
        messages: [],
        lastMessage: null

    },
    setChatInfo: (func) => {
        set((prev)=>({
            chatInfo : func(prev.chatInfo)
        }))
    }
}))