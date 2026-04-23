"use client"

import { navigationStore } from "@/store/navigation-store"
import Image from "next/image"
import {  useRouter } from "next/navigation"

export default function SidebarOptions({image : paramImage , name,icon , link}) {

    let {setSelectedPage , selectedPage} =  navigationStore()
    const handleRedirect = ()=>{
      setSelectedPage(link)

    }
    return <div className="relative group">

        <button onClick={handleRedirect}  className="p-2 text-white  rounded-2xl cursor-pointer hover:bg-indigo-600/60 duration-50  hover:ring ease-in  focus:bg-indigo-700/90  ring-indigo-600">
           {paramImage === null ? icon : 
            <Image src={paramImage} height={100} width={100} className={` ${(name === "Contacts" || name === "Groups") && "size-[27px]" }  size-7`} alt="chatsIcon" />
           }
            
        </button>
        <div
            className={`
                                   text-sm text-blue-100
                                  absolute z-30 left-[120%] top-1/2 -translate-y-1/2
                                  bg-blue-600/40 px-3 py-1 rounded-lg
                                  transition-all duration-200
                                  origin-left scale-0 group-hover:scale-100
                               
                                  before:content-['']
                                  before:absolute
                                  before:left-[-6px]
                                  before:top-1/2
                                  before:-translate-y-1/2
                                  before:w-0 before:h-0
                                  before:border-t-6 before:border-b-4
                                  before:border-t-transparent before:border-b-transparent
                                  before:border-r-4 before:border-r-blue-300
  `}
        >
            {name}
        </div>
    </div>
}