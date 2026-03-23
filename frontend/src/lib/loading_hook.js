"use client"

import { createContext, useContext, useState } from "react"
let context = createContext(null)

export const ContextProiver = ({children})=>{
    const [loading , setLoading] = useState("")
    return <context.Provider value={{loading, setLoading}} >
        {children}
    </context.Provider>
}

export const useLoading = ()=>{
    let data = useContext(context)
    return data
}