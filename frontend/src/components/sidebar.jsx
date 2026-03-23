
import Avatar from "./Avatar"
import LightDarkMode from "./light-dark-mode"
import SidebarOptions from "./sidebar-components/sidebarOption"
import { options } from "./sidebar-components/sidebarValues"

export const Sidebar = () => {
    return (
        <div className="sidebar hidden md:block absolute md:static max-w-[75px] bg-black w-full">
            <div className="flex flex-col w-full h-full justify-center">

                <div className="flex flex-3  flex-col items-center py-5 h-full  gap-10">
                    <div>
                        Logo
                    </div>
                    <div className="flex-1 flex flex-col gap-6 items-center  w-full">
                       
                       {options.map((option)=>(
                        
                            <SidebarOptions key={option.name} name={option.name} image={option.image} icon={option.icon} />

                       ))}
                    </div>
                </div>

                <div className=" flex-1 justify-end pb-9 flex items-center  flex-col gap-3">
                    <LightDarkMode />
                    <div>
                        <Avatar />
                    </div>
                </div>
            </div>
        </div>
    )
}