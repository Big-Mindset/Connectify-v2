import emptyFolder from "@/assets/empty-folder.png"
import { motion } from "framer-motion"
import { Timer } from "lucide-react";
import Image from "next/image";

export default function FileSizeExceeded({ setSizeExceeded, sizeExceeded }) {
    return <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.3 }}
        className="fixed left-1/2 top-1/2 z-[99999] rounded-lg  -translate-1/2 p-10 w-[500px]
             bg-gray-2 border border-gray-5"
    >
        <div className="flex flex-col items-center gap-3">
            <div className="">
                {sizeExceeded?.type === "message-limit" ? <Timer  /> :
                    <Image src={emptyFolder} alt="size-exceeded" height={100} width={100} className="object-cover invert-100" />

                }
            </div>
            <div className="text-center space-y-1.5">
                <h1 className="text-2xl text-gray-300 font-black ">
                    {sizeExceeded?.type === "files-size" ? "Oops , File size limit exceeded" : sizeExceeded?.type === "files-limit" ? "Max files limit Exceeded" : sizeExceeded?.type === "message-limit" && "Slow down!"}
                </h1>
                {sizeExceeded.type === "files-size" ?
                    <p className="text-gray-300 ">The max size limit is 100MB , Buy <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300  ">SuperCo</span> to upload 200MB of files</p>
                    : sizeExceeded.type === "files-limit" ? <p className="text-gray-300 ">You can't upload more than 10 files at a time</p> : sizeExceeded.type === "message-limit" && <p className="text-gray-300 ">You are sending messages too quickly wait a moment</p>

                }
            </div>

            <button onClick={() => setSizeExceeded(false)} className="bg-indigo-500 text-lg hover:ring-2 cursor-pointer duration-100 ring-indigo-300 w-[90%] rounded-lg mt-1.5  p-2 ">Alright</button>

        </div>
    </motion.div>
}