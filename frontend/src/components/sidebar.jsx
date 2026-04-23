
import Image from "next/image"
import Logo from "@/assets/logop.webp"
import { navigationStore } from "@/store/navigation-store"
export const Sidebar = () => {
    let selectedPage = navigationStore(s=>s.selectedPage)
    let setSelectedPage = navigationStore(s=>s.setSelectedPage)
    return (
        <div className="sidebar hidden  md:block  max-w-[60px] p-1 bg-black w-full">

            <div className="flex   flex-col gap-6 px-1 py-2">
                <div onClick={()=>setSelectedPage("main")} className={`${selectedPage === "main" ? "bg-gray-200 border-gray-700" : "bg-gray-700/50 hover:border-indigo-400  border-gray-700" } p-3  border cursor-pointer duration-200  rounded-full`}>

                    <Image src={Logo} alt="connectify-logo" className="bg-cover" width={100} height={100} />
                </div>

                <div className="flex flex-col items-center  w-full h-full ">
                    <div onClick={()=>setSelectedPage("friends")} className={`rounded-lg ${selectedPage === "friends" ? "text-indigo-50 bg-indigo-500" : "bg-indigo-500/50 text-indigo-200"}   cursor-pointer px-3 duration-200 py-1.5`}>

                    <i className="fas fa-user-friends text-sm " ></i>
                    </div>
                </div>
            </div>
                {/* <div className="flex justify-center mt-3">
                    <Avatar size={"size-10"} />
                </div> */}
        </div>
    )
}