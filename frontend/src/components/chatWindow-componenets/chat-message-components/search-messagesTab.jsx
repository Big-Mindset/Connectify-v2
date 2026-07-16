"use client"

import { Filter, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import MessageFilter from "../navbar-components/filter-messages"
import { navigationStore } from "@/store/navigation-store"
import { Axios } from "@/lib/axiosInstance"
import { SearchedMessage } from "./searched-message"
import { chatStore } from "@/store/Chat-store"
export const SearchMessageTab = () => {
    const filters = navigationStore(s => s.filters)
    const setFilters = navigationStore(s => s.setFilters)
    let debounceTimeout = useRef(null)
    const [filterTab, setFilterTab] = useState(false)
    const [inputText, setInputText] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const selectedChat = chatStore(s => s.selectedChat)
    const LoadMoreMessage = chatStore(s=>s.LoadMoreMessage)
    const moreMeessagesRef = useRef(null)
    const containerRef = useRef(null)
    const fetchMore = useRef(true)
    const lastMessageId = useRef(null)
    useEffect(() => {
        clearInterval(debounceTimeout.current)
        debounceTimeout.current = null
        debounceTimeout.current = setTimeout(() => {
            if (inputText.trim() !== (filters?.content?.trim() || "")) {

                setFilters((filters) => {
                    return { ...filters, content: inputText }
                })
            }
        }, 500)
        return () => {
            clearTimeout(debounceTimeout.current)
            debounceTimeout.current = null
        }
    }, [inputText])

    useEffect(() => {
        queryMessages()
    }, [filters])
    useEffect(()=>{
        if (!searchResult?.length) return
        lastMessageId.current = searchResult[searchResult.length - 1].id
    },[searchResult])
    useEffect(() => {
        if (!containerRef.current) return
        let observer = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
                let lastMsgId = lastMessageId.current
                if (entry.isIntersecting && fetchMore.current && lastMsgId) {
                  
                    let fetchedMessages = await LoadMoreMessage("chat-messages-search" , "desc",lastMsgId)
                   
                    if (!fetchedMessages?.length){
                        fetchMore.current = false
                        return
                    }
                    setSearchResult((prev)=>{
                        return [...prev , ...fetchedMessages]
                    })
                }
            })
        }, { root: containerRef.current, rootMargin: "200px" })
        observer.observe(moreMeessagesRef.current)
        return () => {
            observer.disconnect()

        }
    }, [])
    const queryMessages = async () => {

        let { senders, ...rest } = filters

        let res = await Axios.post("/message/search", { ...rest, senderIds: senders?.map((sender) => sender.id) || [], chatId: selectedChat.id })
        setSearchResult(res.data.search_result)
    }
    return (
        <>
            {filterTab && <MessageFilter setFilterTab={setFilterTab} />}
            <div ref={containerRef} className="flex-[0.35] overflow-y-auto  flex flex-col gap-2  min-h-[0] text-sm border-blue-500 p-2">

                <div className="flex items-center relative z-[200]  focus-within:border-indigo-500  gap-2 border-2 border-gray-7 rounded-lg px-2 py-1">
                    <input onChange={(e) => setInputText(e.target.value)} value={inputText} type="text" className="outline-none w-full placeholder:text-gray-300" placeholder="Search messages here" />
                    <div onClick={() => setFilterTab(!filterTab)} className="p-2.5  hover:bg-gray-5 duration-100 rounded-full">
                        <Filter size={15} />
                    </div>
                    <div className="p-2.5  hover:bg-gray-5 duration-100 rounded-full">
                        <Search size={15} />
                    </div>
                </div>
                <div className="flex-1 min-h-[0] [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-zinc-700
    [&::-webkit-scrollbar-thumb]:rounded-full overflow-y-auto bg-reed-200">

                    <div className="flex flex-col gap-2  mt-2 p-2 ">
                        {searchResult.map((message) => {

                            return <SearchedMessage key={message.id} message={message} />
                        })}
                        <div ref={moreMeessagesRef} className="p-2"></div>
                    </div>
                </div>

            </div>
        </>
    )
}
