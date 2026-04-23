import {motion} from "framer-motion"
import { useState } from "react";
import Avatar from "../Avatar";

export default function FriendUser() {
    const [moreOptions , setMoreOptions] = useState(false)
    return (
        <div className="flex justify-between  p-2 items-center ">

            <div className="flex items-center gap-2">

                <Avatar />
                <div className="flex flex-col text-sm">
                    <p className="font-medium font-bold">Name</p>
                    <p className="text-gray-12">i don't like fake people</p>
                </div>
            </div>
            <div className="flex items-center text-gray-400 gap-2">
                <button className="bg-black group  relative hover:border-indigo-500 border-2 border-gray-900 cursor-pointer px-3 py-2 rounded-full">
                    <i className="fa-regular fa-message " ></i>
                   
                </button>
                <div className="relative">

                <button onClick={()=>setMoreOptions(!moreOptions)} className="bg-black group  relative hover:border-indigo-500 border-2 border-gray-900 cursor-pointer px-3 py-2 rounded-full">
                    <i className="fa-solid fa-ellipsis-vertical" ></i>

                </button>
                {moreOptions &&
                  <MoreOptions setMoreOptions={setMoreOptions} />
                  }
                </div>
            </div>
        </div>
    )
}

function MoreOptions({setMoreOptions}){
    return <>
        <div onClick={()=>setMoreOptions(false)} className="fixed  inset-0  z-[99] "></div>
     <motion.div initial={{opacity : 0 , scale : 0}} animate={{scale : 1 ,  opacity : 1}}  transition={{ease : "easeOut" , duration : 0.1}} className="flex z-[3000] origin-top-right bg-gray-3 font-bold text-gray-300 text-[0.9rem] p-2 border border-gray-6  absolute  text-nowrap   right-[60%] rounded-lg   flex-col  gap-2">
        <div className=" cursor-pointer hover:bg-gray-5 rounded-lg p-2 pr-10 " >
            Start video call
        </div>
        <div className=" cursor-pointer hover:bg-gray-5 rounded-lg p-2 pr-10  " >
            Start voice call
        </div>
        <div className=" cursor-pointer hover:bg-red-500/40 rounded-lg pr-10 p-2  " >
           Remove Friend
        </div>
        
    </motion.div>
    </>
}