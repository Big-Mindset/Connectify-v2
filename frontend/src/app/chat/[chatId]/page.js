
"use client"

import ChatWindow from "@/components/chat-window";
import { socketStore } from "@/store/socket";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default  function ChatWindowPage({params}){

   let {chatId} = useParams()
    return <div className="hidden relative lg:block">
            
          </div>
}