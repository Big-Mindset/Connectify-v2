import { Peer } from "peerjs"

import { create } from "zustand"
import { io } from "socket.io-client"
import { getPeerId } from "@/app/action/getPeerId"
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
            autoConnect: true,
            auth: {
                userId,
            }
        })
        sok.on("connect", () => {
            // get().Peer(userId)
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