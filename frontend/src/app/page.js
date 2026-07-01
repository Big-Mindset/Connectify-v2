"use client"

import Chats from "@/components/chats";
import dynamic from "next/dynamic";
let ChatWindow = dynamic(() => import("@/components/chat-window"))
import { navigationStore } from "@/store/navigation-store";
import { chatStore } from "@/store/Chat-store";
import { Sidebar } from "@/components/sidebar";
import FriendsTab from "@/components/friends-tab";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect, useRouter } from "next/navigation";
import { userStore } from "@/store/user-store";
import { SearchMessageTab } from "@/components/chatWindow-componenets/chat-message-components/search-messagesTab";
import { chatMessageStore } from "@/store/chatMessage-store";

export default function Home() {
  let session = authClient.useSession()
  let router = useRouter()
  let loading = chatStore(s=>s.loading)
  const searchTab = navigationStore(s => s.searchTab)

  const setSession = userStore(s => s.setSession)
  useEffect(() => {
    if (!session?.data && !session.isPending) {
      router.push("/login")
    }
    setSession(session.data)

  }, [session.isPending])
  let { selectedPage } = navigationStore()
  let selectedChat = chatStore(s => s.selectedChat)
  if (!session?.data) {
    return (<div className="size-full bg-red-200">
      Loading Session
    </div>)
  }
  if (!session?.data?.user?.username){
    redirect("/input-username")
  }
  
    return (
      <div className="flex text-white flex-1 justify-center relative h-full  ">
       

        <Sidebar />
        <div className="w-full flex ">
          <div className="grid flex-1 grid-cols-1  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
            <Chats />

            <div className="hidden min-w-[0] relative lg:block">
              {selectedPage === "friends" ? <FriendsTab /> :
                (loading) ? <div>loading chat messages</div> : selectedChat?.id && (
                  <div className="flex min-w-[0] h-dvh  ">
                    <div className="flex-1 min-w-[0] min-h-[0]">

                      <ChatWindow  />
                    </div>

                    {searchTab &&
                      <SearchMessageTab />
                    }
                  </div>
                )

              }
            </div>
          </div>
        </div>
      </div>

    );
  
}
