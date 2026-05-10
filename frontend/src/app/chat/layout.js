"use client"

import Chats from "@/components/chats";
import { Sidebar } from "@/components/sidebar";
import { navigationStore } from "@/store/navigation-store";
import { socketStore } from "@/store/socket";
import { useEffect } from "react";

export default function RootLayout({ children }) {
      let {selectedPage} =  navigationStore()
  return (
       <div className="flex text-white justify-center relative h-full ">
         <div className="w-full flex ">
           <div className="grid flex-1 grid-cols-1  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
                {selectedPage === "chat" && <Chats />}
               
             <div className="hidden relative lg:block">
               {children} 
             </div>
           </div>
         </div>
   
       </div>
  );
}
