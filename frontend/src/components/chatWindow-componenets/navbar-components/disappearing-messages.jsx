import { X } from "lucide-react";
import { useState } from "react";

export default function DisappearingMessages({disappearingMessageComp  , setDisappearingMessageComp }) {
    const times = [
        "10 Days",
        "A week",
        "24 Hours",
    ]
    const [selectTime, setSelectTime] = useState("10 Days")

    return (
        <>
            <div className={`border-gray-6 duration-300 ${disappearingMessageComp ? "scale-100 opacity-100" : "scale-0 opacity-0"} fixed bg-gray-2 border rounded-lg  z-50 left-1/2 w-full max-w-[500px] top-1/2 -translate-1/2`}>
                <div className="p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="">

                            <h1 className="font-bold text-xl">Disappearing Messages</h1>

                        </div>
                        <div onClick={() => setDisappearingMessageComp(false)} className="rounded-full cursor-pointer duration-100  hover:bg-gray-5 p-1">

                            <X className="size-5" />
                        </div>
                    </div>
                            <h2 className="text-gray-12 mt-2">All the messages you will send after enabling disappearing-messages will be disappeared in  <span className="text-indigo-200 lowercase">({selectTime})</span></h2> 
                    <div className="mt-5 flex flex-col gap-5.5">
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
                            <button onClick={() => setDisappearingMessageComp(false)} className="p-2 ring ring-indigo-400 hover:ring-indigo-500 duration-200 cursor-pointer hover:text-indigo-100 rounded-lg text-indigo-500">Cancel</button>
                            <button onClick={() => setDisappearingMessageComp(false)} className="p-2 ring ring-indigo-500 bg-indigo-600  hover:bg-indigo-700 duration-200 cursor-pointer hover:text-indigo-50 rounded-lg ">Continue</button>
                        </div>
                </div>
            </div>
            {disappearingMessageComp && <div className="fixed inset-0  bg-black/30  z-20"></div>}
        </>
    )
}