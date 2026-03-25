
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import RenderVideo from "./render-video";
import RenderImage from "./render-image";
import { chatMessageStore } from "@/store/chatMessage-store";

export default function RenderTwoFiles({ files, moreFiles, multipleFiles, deleteButton }) {
     const setSelectedMedia = chatMessageStore((s)=>s.setSelectedMedia)
    const totalfiles = files.length
    const [hoveredFile, setHoveredFile] = useState("")
    const outerClass =
        totalfiles === 1
            ? "max-w-[600px] max-h-[500px]"
            : totalfiles === 2
                ? "w-[600px] h-[300px] "
                : totalfiles === 4
                    ? "w-[600px] h-[500px] max-h-[500px]"
                    : "w-[600px] h-[500px] max-h-[500px]";
    const handleOpenFile = ( idx, file)=>{
       
        if (files.length === 1 && file.type.startsWith("video")) return
        setSelectedMedia({...file , idx : idx})
    }
    return <div className={outerClass}>


        <div className={`grid  gap-1  rounded-lg  ${totalfiles === 1 ? " grid-cols-1" : totalfiles === 2 ? "grid-cols-2 " : totalfiles >= 3 && "grid-cols-2 grid-rows-2"}  rounded-lg    w-full h-full  overflow-hidden`}>


            {files.map((file, i) => {
                return (
                    <div  onMouseEnter={() => setHoveredFile(file.id)} onMouseLeave={() => setHoveredFile("")} key={file.url}
                        className={`col-span-1 ${totalfiles === 1 && "w-fit"} ${(totalfiles === 3 && i === 0) && "row-span-2"}   relative  rounded-lg   overflow-hidden`}
                    >

                        {(hoveredFile === file.id) &&
                            <div className="flex items-center absolute overflow-hidden right-2 top-2 z-[1000]  rounded-lg">
                                {
                                    deleteButton && <div

                                        className={` p-2  bg-gray-3 hover:text-gray-100 text-gray-300  duration-50  hover:bg-red-700   `}>
                                        <Trash2 size={20} />
                                    </div>
                                }


                                <div className={` py-1.5 px-2 bg-gray-3 w-fit hover:text-gray-100 text-gray-300 z-50 duration-50  hover:bg-gray-6  `}>
                                    <i className="fa-solid fa-download" ></i>
                                </div>


                            </div>
                        }

                        {(moreFiles > 0 && i === 3) && <>
                            <div className="absolute inset-0 bg-gray-700 z-40 opacity-30">

                            </div>
                            <div className="absolute  left-1/2 z-20 top-1/2 -translate-1/2">

                                <p className="text-5xl invert-100">

                                    {moreFiles}+
                                </p>
                            </div>
                        </>
                        }
                        <div onClick={()=>handleOpenFile(i,file)} className="bg-red-300">

                        {
                            file.type.startsWith("image") ?
                            <RenderImage image={file} multipleImages={multipleFiles} />
                            :
                            <RenderVideo hoveredFile={hoveredFile} multipleVideoes={multipleFiles} video={file} />
                            
                        }
                        </div>


                    </div>

                )
            })}

        </div>
    </div>
}