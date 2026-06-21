"use client"

import { authClient } from "@/lib/auth-client"
import { socketStore } from "@/store/socket"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function connectSocket() {
    let connectSocket = socketStore(s => s.connectSocket)
    let disconnectSocket = socketStore(s=>s.disconnectSocket)
     let { isPending, data } = authClient.useSession()
     let router = useRouter()
 

    useEffect(() => {
        if (isPending) return
        if (!data) {
            router.push("/login")
            disconnectSocket()
            return 
        }
        connectSocket(data.user.id)
        // Peer()
       
    }, [isPending, data?.user?.id])
    return null
}