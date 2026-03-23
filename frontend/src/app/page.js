"use client"

import Chats from "@/components/chats";
import ChatWindow from "@/components/chat-window";
import { Sidebar } from "@/components/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  let { isPending, data } = authClient.useSession()

  let router = useRouter()
  useEffect(() => {
    console.log(data)
    if (!data && isPending) {
      router.push("/login")
    }
  }, [isPending, data])
  return (
    <div className="flex text-white justify-center relative h-full ">
      {/* <div className="w-full flex ">
        <Sidebar />
        <div className="grid flex-1 grid-cols-1  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
          <div className=" ">
            <Chats />
          </div>
          <div className="hidden relative lg:block">
            <ChatWindow />
          </div>
        </div>
      </div> */}

    </div>
  );
}
