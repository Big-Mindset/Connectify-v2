import {  X } from "lucide-react";
import {motion} from "framer-motion"
export default function Invite({openInvite , setOpenInvite}) {
    return (
            <>
       {openInvite &&
            <div className={`absolute bg-black/20 inset-0 z-40`}></div>
            }
        <motion.div 
               initial={{scale : 0.5 , opacity : 0}}
        animate={{scale : 1 , opacity : 1}}
        transition={{duration : 0.2}}
        exit={{scale : 0.5 , opacity : 0}}
        className="fixed  z-50 left-1/2 w-full max-w-[500px] top-1/2 -translate-1/2">
            <div className={`w-full duration-200    ease-in-out p-4 bg-gray-1 ring ring-gray-4 rounded-lg`}>
                <div className="flex w-full items-center justify-between">
                    <h1 className="font-bold text-xl">Send Invitation</h1>
                    <div onClick={()=>setOpenInvite(false)} className="rounded-full cursor-pointer duration-100  hover:bg-gray-5 p-1">

                        <X className="size-5" />
                    </div>
                </div>
                <div className="my-7">
                    <form className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold" htmlFor="username">Username</label>
                            <input type="text" className="outline-none bg-gray-2 ring ring-gray-7  focus:ring-indigo-400 hover:ring-indigo-500/50 rounded-lg p-2 " />
                        </div>
             
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold" htmlFor="message">Invitation message</label>
                            <textarea type="text"  rows={2} className="outline-none ring-gray-7 bg-gray-2 ring placeholder:textsm focus:ring-indigo-400 hover:ring-indigo-500/50 rounded-lg p-2 " />
                        </div>
                    </form>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    <button onClick={()=>setOpenInvite(false)} className="p-2 ring ring-indigo-400 hover:bg-indigo-500/60 duration-200 cursor-pointer hover:text-indigo-50 rounded-lg text-indigo-500">Cancel</button>
                    <button className="p-2 ring ring-indigo-500 bg-indigo-600  hover:bg-indigo-700 duration-200 cursor-pointer hover:text-indigo-50 rounded-lg ">Send Request</button>
                </div>
            </div>
        </motion.div>
        </>
    )
}