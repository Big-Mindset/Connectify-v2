"use client"

import Chats from "@/components/chats";
import dynamic from "next/dynamic";
let ChatWindow = dynamic(() => import("@/components/chat-window"))
import { navigationStore } from "@/store/navigation-store";
import { chatStore } from "@/store/chat-store";
import { Sidebar } from "@/components/sidebar";
import FriendsTab from "@/components/friends-tab";

export default function Home() {

  let { selectedPage } = navigationStore()
  let selectedChat = chatStore(s => s.selectedChat)
  return (

    <div className="flex text-white flex-1 justify-center relative h-full  ">

      <Sidebar />
      <div className="w-full flex ">
        <div className="grid flex-1 grid-cols-1  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
          <Chats />

          <div className="hidden relative lg:block">
            {selectedPage === "friends" ? <FriendsTab /> :
              selectedChat?.id &&
              <ChatWindow chatId={selectedChat.id} />

            }
          </div>
        </div>
      </div>


    </div>
  );
}
