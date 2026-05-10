

import { chatStore } from "@/store/chat-store";
import { Camera, Plus, Send, Trash, Upload, X, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"
import { sizeText } from "@/lib/formateSize";
import dynamic from "next/dynamic";
import { generateThumbnail } from "@/lib/generateThumbnail";
import { userStore } from "@/store/user-store";
import { messageSettingsStore } from "@/store/messageSettings-store";
import { chatMessageStore } from "@/store/chatMessage-store";
let RenderFile = dynamic(() => import("./main-input-components/renderFile"))
let FileSizeExceeded = dynamic(() => import("./main-input-components/file-sizeExceeded"))
const EmojiPicker = dynamic(() => import("./Emoji-Picker"), { ssr: false })
export default function MainInput({ chatId }) {
    const [openAttachments, setOpenAttachments] = useState(false)
    const [inputText, setInputText] = useState("")
    const [filePreview, setFilePreview] = useState([])
    const [editFile, setEditFile] = useState(null)
    const [totalSize, setTotalSize] = useState(0)
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false)
    const [sizeExceeded, setSizeExceeded] = useState(false)
    const [thumbnailsUrl, setThumbnailsUrl] = useState({})
    const participants = chatStore(s => s.participants)

    const [senderData, setSenderData] = useState(null)
    const selectedMessage = messageSettingsStore(s => s.selectedMessage)
    let session = userStore(s => s.session)
    let plusOptionsRef = useRef(null)
    let plusRef = useRef(null)
    let textInputRef = useRef(null)
    
    let sendMessage = chatMessageStore(s => s.sendMessage)
    let setInputRef = messageSettingsStore(s=>s.setInputRef)
    let replyMessage = messageSettingsStore(s => s.replyMessage)
    let setReplyMessage = messageSettingsStore(s => s.setReplyMessage)
     let inputRef = useRef(null)


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (plusOptionsRef.current &&
                !plusOptionsRef.current.contains(e.target) &&
                plusRef.current &&
                !plusRef.current.contains(e.target)
            ) {
                setOpenAttachments(false);
            }
        };


        window.addEventListener("mousedown", handleClickOutside)
        return () => {

            window.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])
   useEffect(()=>{
       if (inputRef.current){
        setInputRef(inputRef)
       }
   },[inputRef])
    useEffect(() => {
        let sender = participants.get(replyMessage?.senderId)
        setSenderData(sender)
        textInputRef.current.focus()
    }, [replyMessage])
    






    let user = session?.user
    const attaches = [
        { name: "Upload a file", icon: <Upload size={19} />, type: "file" },
        { name: "Camera", icon: <Camera size={19} /> },
    ];

    const handleSendMessage = async () => {

        if (inputText === "" && filePreview.length === 0) return
        let createdAt = new Date()
        let messageData = {
            id: crypto.randomUUID(),
            content: inputText,
            senderId: user.id,
            senderId: user.id,
            chatId: chatId,
            createdAt: createdAt,
            updatedAt: createdAt,
            status: {
                id: crypto.randomUUID(),
                readAt: null,
                deliveredAt: null,
                status: "pending",
            },
            replyTo: replyMessage,
            media: filePreview
        }


        sendMessage(messageData, filePreview)
        setInputText("")
        setFilePreview([])
        setReplyMessage(null)
    }

    const handleUploadFile = async (e) => {

        setOpenAttachments(false)
        let files = e.target.files

        let size = 0
        let validFiles = []


        let maxSize = 100
        let thumbnails = {}
        for (let file of files) {
            if (!file) return
            let sizeInMb = (file.size / (1024 * 1024)).toFixed(2)

            if ((sizeInMb > maxSize) || ((sizeInMb + size) > maxSize)) {
                setSizeExceeded(true)
                break
            }
            size += sizeInMb
            let url = URL.createObjectURL(file)
            if (file.type.startsWith("video")) {

                let thumbnailUrl = await generateThumbnail(url)
                thumbnails[url] = thumbnailUrl
            }
            let media = {
                id: crypto.randomUUID(),
                type: file.type,
                filename: file.name,
                size: file.size,
                url: url,
                file: file
            }
            validFiles.push(media)

        }
        setTotalSize(size)
        setThumbnailsUrl(prev => ({ ...prev, ...thumbnails }))
        setFilePreview(prev => [...prev, ...validFiles])
    }

    let handleRemoveFile = (fileId) => {
        let filtered = filePreview.filter((file) => {
            return file.id !== fileId
        })
        setFilePreview(filtered)
    }

    const handleUpdate_filename = () => {
        setFilePreview(prev => {
            return prev.map((file) => {
                if (file.id === editFile.id) return editFile

                return file
            })
        })
        setEditFile(null)
    }


    let thumbnailUrl = thumbnailsUrl[editFile?.url]

    const handleTyping = (e) => {
        setInputText(e.target.value)
    }

    let handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }

    }

   let handleCancelReply = ()=>{
    setReplyMessage(null)
   }
    return (
        <>
            <AnimatePresence>

                {sizeExceeded && <FileSizeExceeded setSizeExceeded={setSizeExceeded} />
                }
            </AnimatePresence>

            {(editFile || sizeExceeded) && <div className="fixed opacity-50 z-[99] inset-0 bg-gray-2"></div>}
            <AnimatePresence>

                {(thumbnailUrl || editFile) && <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="fixed  z-[9999] p-7 border border-gray-6 top-1/2 left-1/2 w-full bg-gray-2 rounded-2xl  max-w-[450px] -translate-1/2 ">
                    <h1 className="mb-3 font-bold text-xl"> Update File</h1>
                    <div className="flex flex-col gap-3">
                        <div className=" p-3  flex items-center justify-center overflow-hidden">
                            <div className="flex items-center gap-7 w-full">

                                <RenderFile thumbnailsUrl={thumbnailsUrl} data={{ type: editFile.type, size: editFile.size, url: editFile.url }} />
                                {sizeText(editFile.size)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="">
                                <label className="text-sm" htmlFor="filename">Filename</label>
                                <input type="text" id="filename" onChange={(e) => setEditFile({ ...editFile, filename: e.target.value })} value={editFile.filename} className="p-2 mt-1 text-gray-300 text-sm focus:ring-2 outline-none focus:ring-indigo-400 bg-gray-3/60 duration-200  w-full rounded-lg ring-1 ring-gray-5 " />
                            </div>

                            <div className="grid mt-6  grid-cols-2 gap-2">
                                <button onClick={() => { setEditFile(null) }} className="bg-gray-4 rounded-lg p-2 hover:bg-gray-5 duration-150 cursor-pointer">Cancel</button>
                                <button onClick={handleUpdate_filename} className="bg-indigo-500  rounded-lg p-2 hover:bg-indigo-400 duration-150 cursor-pointer">Save</button>

                            </div>
                        </div>
                    </div>
                </motion.div>}
            </AnimatePresence>
            <div ref={inputRef} className="w-full  shrink-0 p-4">
                <div className={`  ${(filePreview.length || replyMessage?.id) ? "rounded-lg" : "rounded-full"}  w-full flex flex-col gap-1  focus-within:ring-indigo-400/40 focus-within:ring-2   ring ring-gray-7    bg-gray-2/80   `}>
                    {replyMessage?.id &&
                        <div className=" pl-3 py-2 flex items-center justify-between text-[0.8rem] border-b border-gray-6 items-baseline bg-gray-4">
                            <div className="flex gap-1">

                                <p className="text-gray-300">Reply to</p>
                                {senderData &&
                                    <p className="text-gray-300 font-bold">{senderData.name}</p>
                                }
                            </div>
                            <div onClick={handleCancelReply} className="p-1 mr-1 rounded-full bg-gray-6 cursor-pointer  hover:bg-gray-4 border border-gray-7  ">
                                <X className="size-3.5" />
                            </div>
                        </div>
                    }
                    {filePreview.length > 0 &&
                        <div
                            className={`flex flex-col    origin-bottom overflow-hidden gap-2  p-2 `}>
                            <div className="flex items-center p-2 duration-700   overflow-x-auto overflow-y-hidden gap-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'gray #1F2937', scrollBehavior: "smooth" }}>
                                {filePreview.map((file) => {
                                    return (
                                        <div key={file.id} className="relative  h-[200px]  px-4 py-2 rounded-lg border border-gray-4 shrink-0 min-w-[180px]" >

                                            <div className=" flex flex-col gap-1  h-full">
                                                <div className="absolute z-30 top-0 -right-1 ">
                                                    <div className="flex  items-center bg-gray-5  overflow-hidden   rounded-lg gap-1.5">
                                                        <motion.div
                                                            whileTap={{ y: 2 }}
                                                            transition={{ duration: 0.1 }}
                                                            onClick={() => setEditFile(file)} className="duration-150 hover:bg-gray-6 text-indigo-100  text-[0.9rem] cursor-pointer p-1.5 overflow-hidden">
                                                            <i className="fa-solid fa-pen"></i>
                                                        </motion.div>
                                                        <div onClick={() => handleRemoveFile(file.id)} className=" text-red-300 hover:text-red-400 duration-150 hover:bg-gray-6   text-[0.7rem] cursor-pointer p-2">
                                                            <Trash size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full relative bg-gray-3 flex-1  rounded-lg  flex  items-center justify-center overflow-hidden">


                                                    <RenderFile thumbnailsUrl={thumbnailsUrl} data={{ type: file.type, size: file.size, url: file.url }} />
                                                </div>
                                                <div className="p-2 ">
                                                    <p className="text-[0.8rem] text-gray-400">
                                                        {file.filename.slice(0, 28)}{file.filename.length > 28 && "..."}

                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    }
                    <div className=" p-1.5 relative pr-2">
                        <div className="flex  h-full items-center gap-2 justify-between">
                            <div className="flex  relative  items-center gap-1">

                                <AnimatePresence>

                                    {openAttachments &&
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            ref={plusOptionsRef}
                                            className={`absolute z-[99999]  origin-bottom-left w-[170px]  bg-gray-1 -translate-x-1/2  bottom-[150%] border border-gray-700 rounded-4xl left-20`}>
                                            <div className="flex  p-3 flex-col gap-2">
                                                {attaches.map((data) => {
                                                    if (data.type === "file") {
                                                        return <label htmlFor="upload-file" key={data.name} className="flex whitespace-nowrap cursor-pointer items-center text-gray-300 hover:bg-indigo-500/50 text-[0.8rem] rounded-4xl p-2 gap-2.5">
                                                            <span>{data.icon}</span>
                                                            <span>{data.name}</span>
                                                            <input onChange={handleUploadFile} multiple={true} type="file" id="upload-file" className="hidden" />
                                                        </label>
                                                    } else {
                                                        return <div id="upload-file" key={data.name} className="flex whitespace-nowrap cursor-pointer items-center text-gray-300 hover:bg-indigo-500/50 text-[0.8rem] rounded-4xl p-2 gap-2.5">
                                                            <span>{data.icon}</span>
                                                            <span>{data.name}</span>
                                                        </div>

                                                    }

                                                })}
                                            </div>
                                        </motion.div>
                                    }
                                </AnimatePresence>

                                <div ref={plusRef} onClick={() => setOpenAttachments(prev => !prev)} className="p-2 group cursor-pointer  hover:bg-gray-4 rounded-full transition-all duration-100 ">
                                    <Plus size={22} />
                                </div>
                                <div onClick={() => setOpenEmojiPicker(prev => {

                                    if (prev) return 0
                                    return 1
                                })} className="p-2 group cursor-pointer  rounded-full hover:bg-gray-4  transition-all duration-100">
                                    <i className="fa-solid fa-face-laugh-beam" ></i>
                                </div>
                            </div>
                            <div className="flex-1">
                                <input onKeyDown={handleKeyDown} value={inputText} ref={textInputRef} onChange={handleTyping} placeholder="Type a message" type="text" className="w-full  text-[0.95rem]   caret-indigo-400 outline-none" />




                            </div>
                            {/* <div className="rounded-full bg-indigo-500/70 duration-150 ring-indigo-600 hover:ring p-2 cursor-pointer ">
                        <Mic size={18} />
                        </div> */}

                            <div onClick={handleSendMessage} className="rounded-full bg-indigo-500/70 duration-150 ring-indigo-600 hover:ring p-2 cursor-pointer ">
                                <Send size={18} />
                            </div>

                        </div>

                        <div className={`${openEmojiPicker ? " scale-[1] opacity-100" : "scale-[0.2] opacity-0 "} absolute z-[500] duration-100 bottom-[110%] origin-bottom-left left-6`}>

                            <EmojiPicker setOpenEmojiPicker={setOpenEmojiPicker} setInputText={setInputText} />
                        </div>

                    </div>
                </div>

            </div>
        </>
    )
}




