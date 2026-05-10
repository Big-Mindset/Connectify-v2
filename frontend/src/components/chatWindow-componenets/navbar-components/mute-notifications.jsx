import { X } from "lucide-react";
import { useState } from "react";

export default function MuteNotifications({ openMuteNotifications, setOpenMuteNotifcations }) {
    const times = ["30 Minutes",
        "1 Hour",
        "1 Day",
        "1 Week",
        "1 Month",
        "1 Year",
        "Always"]
    const [selectTime, setSelectTime] = useState("30 Minutes")

    return (
        <>
            <div className={`border-gray-6 duration-300 ${openMuteNotifications ? "scale-100 opacity-100" : "scale-0 opacity-0"} fixed bg-gray-2 border rounded-lg  z-50 left-1/2 w-full max-w-[500px] top-1/2 -translate-1/2`}>
                <div className="p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="">

                            <h1 className="font-bold text-xl">Mute Notifications</h1>
                           

                        </div>
                        <div onClick={() => setOpenMuteNotifcations(false)} className="rounded-full cursor-pointer duration-100  hover:bg-gray-5 p-1">

                            <X className="size-5" />
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3.5">
                            {times.map((text)=>{
                                return <div key={text} className="flex items-center gap-1.5">
                            <div onClick={() => setSelectTime(text)} className={`w-5 h-5 cursor-pointer rounded-full ${selectTime === text ? "bg-indigo-600" : "hover:bg-indigo-600/40 bg-gray-7"}   flex items-center justify-center`}>
                                {selectTime === text &&
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                }
                            </div>
                            <p>{text}</p>
                        </div>
                            })}
                        
                     
                    </div>
                       <div className="grid mt-5 grid-cols-2 gap-2.5">
                            <button onClick={() => setOpenMuteNotifcations(false)} className="p-2 ring ring-indigo-400 hover:ring-indigo-500 duration-200 cursor-pointer hover:text-indigo-100 rounded-lg text-indigo-500">Cancel</button>
                            <button onClick={() => setOpenMuteNotifcations(false)} className="p-2 ring ring-indigo-500 bg-indigo-600  hover:bg-indigo-700 duration-200 cursor-pointer hover:text-indigo-50 rounded-lg ">Mute</button>
                        </div>
                </div>
            </div>
            {openMuteNotifications && <div className="fixed inset-0  bg-black/30  z-20"></div>}
        </>
    )
}