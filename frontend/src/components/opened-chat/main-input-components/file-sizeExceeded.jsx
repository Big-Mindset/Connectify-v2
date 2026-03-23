import emptyFolder from "@/assets/empty-folder.png"
import {motion} from "framer-motion"
import Image from "next/image";

export default function FileSizeExceeded({setSizeExceeded}) {
    return <motion.div
    initial={{opacity : 0 , scale : 0.3}}
    animate={{opacity : 1 , scale : 1}}
    exit={{opacity : 0 , scale : 0.3}}
        className="fixed left-1/2 top-1/2 z-[99999] rounded-lg  -translate-1/2 p-10 w-[500px]
             bg-gray-2 border border-gray-5"
    >
        <div className="flex flex-col items-center gap-3">
            <div className="">
                <Image src={emptyFolder} alt="size-exceeded" height={100} width={100} className="object-cover invert-100" />
            </div>
            <div className="text-center space-y-1.5">
                <h1 className="text-2xl text-gray-300 font-black ">Oops , File size limit exceeded</h1>
                <p className="text-gray-300 ">The max size limit is 100MB , Buy <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300  ">SuperCo</span> to upload 200MB of files</p>
            </div>

            <button onClick={()=>setSizeExceeded(false)} className="bg-indigo-500 text-lg hover:ring-2 cursor-pointer duration-100 ring-indigo-300 w-[90%] rounded-lg mt-1.5  p-2 ">Alright</button>

        </div>
    </motion.div>
}