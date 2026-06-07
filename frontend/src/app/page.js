"use client"

import Chats from "@/components/chats";
import dynamic from "next/dynamic";
let ChatWindow = dynamic(() => import("@/components/chat-window"))
import { navigationStore } from "@/store/navigation-store";
import { chatStore } from "@/store/chat-store";
import { Sidebar } from "@/components/sidebar";
import FriendsTab from "@/components/friends-tab";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { router } from "better-auth/api";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/user-store";
import { Filter, Search, X } from "lucide-react";
import MessageFilter from "@/components/chatWindow-componenets/navbar-components/filter-messages";
import { SearchMessageTab } from "@/components/chatWindow-componenets/chat-message-components/search-messagesTab";

export default function Home() {
  let session = authClient.useSession()
  let router = useRouter()
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
  if (session.isPending || !session?.data) {
    return (<div className="size-full bg-red-200">
      Loading Session
    </div>)
  }

    return (
      <div className="flex text-white flex-1 justify-center relative h-full  ">
       

        <Sidebar />
        <div className="w-full flex ">
          <div className="grid flex-1 grid-cols-1  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
            <Chats />

            <div className="hidden relative lg:block">
              {selectedPage === "friends" ? <FriendsTab /> :
                selectedChat?.id && (
                  <div className="flex">
                    <div className="flex-1">

                      <ChatWindow chatId={selectedChat.id} />
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
