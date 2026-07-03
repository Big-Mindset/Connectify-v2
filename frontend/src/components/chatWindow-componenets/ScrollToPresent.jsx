"use client"

import { useLoading } from "@/lib/loading_hook"
import { chatStore } from "@/store/Chat-store"

export default function ScrollToPresent({fetchLatest , containerRef , stopScroll , fetchOlder}){
    let getChatById = chatStore.getState().getChatById
    let selectedChat = chatStore.getState().selectedChat
    let {loading , setLoading} = useLoading()
    const handleScrollBack = async ()=>{
        stopScroll.current = false
        fetchOlder.current = true
        if (fetchLatest.current){
            setLoading("fetching-again")
            fetchLatest.current = false
           await  getChatById({chatId : selectedChat.id ,fetchAgain : true })
           setLoading("")   
        }else{
            containerRef.current.scrollTo({
                top : containerRef.current.scrollHeight
            })
        }

           
        
    }
    return (
        <button onClick={handleScrollBack} className="absolute text-gray-300 bottom-30 font-bold  z-20 left-1/2 cursor-pointer -translate-x-1/2 w-[200px] rounded-xl py-1.5 hover:ring ring-indigo-400 bg-gradient-to-r from-indigo-500 to-indigo-600">
            Scroll to present
        </button>
    )
}