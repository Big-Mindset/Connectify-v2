"use client"

import { authClient } from "@/lib/auth-client"
import { socketStore } from "@/store/socket"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function connectSocket() {
    let connectSocket = socketStore(s => s.connectSocket)
     let { isPending, data } = authClient.useSession()
     let router = useRouter()
  const Peer = socketStore(s=>s.Peer)
 

    useEffect(() => {
        if (!data && !isPending) {
            router.push("/login")
        }
        connectSocket(data?.user?.id)
        // Peer()
       
    }, [isPending, data])
    return null
}