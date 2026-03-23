"use client"

import { Moon, MoonStar, MoonStarIcon, Sun } from "lucide-react"
import { useState } from "react"

export default function LightDarkMode() {
    const [theme, setTheme] = useState(true)
    return (
            <button onClick={()=>setTheme(!theme)} className="p-2.5   rounded-full cursor-pointer  duration-200  hover:ring ease-in  hover:bg-indigo-500/90 rounded-full   border-blue-600 hover:">
                {theme  ? <MoonStarIcon /> : <Sun />} 

            </button>
    )
}