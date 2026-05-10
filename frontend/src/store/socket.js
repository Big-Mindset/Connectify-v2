import { Peer } from "peerjs"

import { create } from "zustand"
import { io } from "socket.io-client"
import { getPeerId } from "@/app/action/getPeerId"
import { chatStore } from "./chat-store"
export let socketStore = create((set, get) => ({

    socket: null,
    peer: null,
    audioStream: null,
    connectSocket: (userId) => {
        if (!userId) return
        let socket = get().socket
        if (socket?.connected) {
            return
        }
        let sok = io("http://localhost:2525", {
            auth: {
                userId,
            }
        })
        let setParticipants = chatStore.getState().setParticipants
        let participants = chatStore.getState().participants
        sok.on("connect", () => {
            sok.on("online-user",(id)=>{
                let user = participants.get(id)
                setParticipants(id , {...user , isOnline : true})
            })
            sok.on("offline-user",(id)=>{
                let user = participants.get(id)

                setParticipants(id , {...user , isOnline : false})
            })
            

            let setMessages = chatStore.getState().setMessages
            sok.on("send-message",(message)=>{
                setMessages((msgs)=>{
                    return [...msgs , message]
                })
            })
        })
        set({ socket: sok })
    },
    disconnectSocket: () => {
        let socket = get().socket
        if (socket?.connected) {
            socket?.disconnect()
        }
        set({ socket: null })
    },
    Peer: async (userId) => {
        if (get().peer) {
            return
        }
        var peer = new Peer(userId, {
            host: "localhost",
            port: 2525,
            path: "/peerjs"

        });

        set({ peer: peer })
        let stream = get().audioStream
        peer.on("open", async (id) => {
            get().socket?.emit("register-peer-socket" , id)
            if (!stream){
    
                // stream = await navigator.mediaDevices.getUserMedia({
                //     audio: true
                // })
            }
            set({ audioStream: stream })

        })
        peer.on("call", (call) => {
            call.answer(stream)
            call.on("stream", (remoteStream) => {
            });
        })
        peer.on("close", () => {
            set({ peer: null })
        })

    },
    audioCall: async (userIds) => {
        let stream = get().audioStream
        let peer = get().peer
        let peerIds = await getPeerId(userIds)
        peerIds.forEach((id) => {
            let call = peer.call(id, stream)
            call.on("stream", (stream) => {
            })
        })
    }
}))