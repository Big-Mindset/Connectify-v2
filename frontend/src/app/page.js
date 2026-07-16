"use client"

import Chats from "@/components/chats";
import dynamic from "next/dynamic";
let ChatWindow = dynamic(() => import("@/components/chat-window"))
import { navigationStore } from "@/store/navigation-store";
import { Sidebar } from "@/components/sidebar";
import FriendsTab from "@/components/friends-tab";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/user-store";

import { socketStore } from "@/store/socket";
export default function Home() {
  const session = authClient.useSession()
  const router = useRouter()

  const setSession = userStore(s => s.setSession)
  const [loadingWeb, setLoadingWeb] = useState(true)
    let connectSocket = socketStore(s => s.connectSocket)
    let disconnectSocket = socketStore(s=>s.disconnectSocket)
 


  useEffect(() => {
    if (!session?.data && !session.isPending) {
      router.push("/login")
        disconnectSocket()
        return

    }
    if (session?.data) {
      let username = session.data.user.username
      if (!username){
        router.push("/input-username")
        return
      }
      let data = session.data
        connectSocket(data.user.id)
      setSession(data)
      setLoadingWeb(false)
    }

  }, [session.isPending])
  let { selectedPage } = navigationStore()
  if (loadingWeb) return (
    <div className="absolute left-1/2 top-1/2 -translate-1/2 text-white">
      Loading Connectify please wait a moment..........
    </div>
  )
  return (
    <div className="flex  text-white flex-1 justify-center relative h-full  ">
      {/* {true && <AccountSettings />} */}
      <Sidebar />
        <div className="grid min-h-0  flex-1 grid-cols-2  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
          <Chats />

          <div className="relative  min-h-0 lg:col-span-1  hidden md:block ">

            {selectedPage === "friends" ? <FriendsTab /> : <ChatWindow /> }
          </div>
        </div>
    </div>

  );

}
