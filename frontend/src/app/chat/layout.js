import Chats from "@/components/chats";
import { Sidebar } from "@/components/sidebar";

export default function RootLayout({ children }) {
  return (
       <div className="flex text-white justify-center relative h-full ">
         <div className="w-full flex ">
           <Sidebar />
           <div className="grid flex-1 grid-cols-1  lg:grid-cols-[minmax(200px,400px)_minmax(500px,100%)]">
             <div className=" ">
               <Chats />
             </div>
             <div className="hidden relative lg:block">
               {children} 
             </div>
           </div>
         </div>
   
       </div>
  );
}
