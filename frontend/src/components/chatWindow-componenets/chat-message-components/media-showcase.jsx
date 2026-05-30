import Avatar from "@/components/Avatar"
import { chatMessageStore } from "@/store/chatMessage-store"
import { mediaStore } from "@/store/media-store"
import Image from "next/image"

export default function MediaShowcase({ mediaData }) {

    return <div className="bg-gray-2 opacity-[0.95] fixed z-[99] inset-0 ">
        {/* <div onClick={() => setSelectedMedia(null)} className="fixed  inset-0 z-20 ">

        </div> */}
        <div className="fixed inset-0  z-[99900] ">
            <Header />
            <Main media={mediaData} />
            {
                mediaData.files.length > 1 &&
                <ImagesSelector media={mediaData} />
            }
        </div>
    </div>
}





const Header = () => {
    const setSelectedMedia = mediaStore((s) => s.setSelectedMedia)
    return <div className="m-10 px-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 ">
                <Avatar size={"size-12"} />
                <div className="">
                    <h1 className="text-lg">Wadood</h1>
                    <p className="text-sm">5:45PM</p>
                </div>
            </div>

            <div className="flex items-center gap-1 ">

                <div className="flex items-center  p-1 border border-gray-5 gap-2 rounded-lg bg-gray-4">
                    <Option icon={<i className="fa-solid fa-magnifying-glass-plus"></i>} tooltipText={"Zoom in"} />
                    <Option icon={<i className="fa-solid fa-share"></i>} tooltipText={"Forward"} />
                    <Option icon={<i className="fa-solid fa-arrow-up-right-from-square"></i>} tooltipText={"Open in browser"} />
                    <Option icon={<i className="fa-solid fa-ellipsis"></i>} tooltipText={"More"} />

                </div>
                <div onClick={() => setSelectedMedia(()=>null)} className="flex items-center  border border-gray-5 gap-2 rounded-lg bg-gray-4">

                    <Option p={"px-3 py-2"} icon={<i className="fa-solid fa-x "  ></i>} />

                </div>

            </div>
        </div>

    </div>
}
const Main = ({ media }) => {
    let setSelectedMedia = mediaStore((s) => s.setSelectedMedia)
    let selectedMedia = media.files[media.idx]
    let newMedia;
    let handleImageChange = (side ) => {

        let index = media.idx
        if (side === "backward") {
            if (index === 0) {
                index = media.files.length - 1
            } else {
                index -= 1
            }
            let back = media.files[index]

            newMedia = back

        } else {
            if (index === media.files.length - 1) {
                index = 0
            } else {
                index += 1
            }
            let forward = media.files[index]

            newMedia = forward
        }
        setSelectedMedia((prev)=>{
            return {...prev , idx : index , selectedFileId : prev.files[index].id}
         })
    }
   
    return <div className="flex  m-20 items-center justify-center  gap-24">
        {
            media.files.length > 1 &&
            <div onClick={() => handleImageChange("backward")} className="px-3.5 py-3 rounded-full hover:bg-gray-4 border border-gray-5 ">
                <i className="fa-solid fa-arrow-left" ></i>
            </div>
        }


        <div className=" flex-1 h-[700px]  flex justify-center items-center p-2  overflow-hidden">
            {selectedMedia.type.startsWith("video") ? <video
                src={selectedMedia.url}
                controls
                className="max-w-full max-h-full object-contain"
            /> :
                <Image width={600} className="object-contain " height={600} src={selectedMedia.url} alt={selectedMedia.id} />
            }
        </div>
        {media.files.length > 1 &&

            <div onClick={() => handleImageChange("forward")} className="px-3.5 py-3 rounded-full hover:bg-gray-4 border border-gray-5 ">
                <i className="fa-solid fa-arrow-right" ></i>
            </div>
        }
    </div>
}
const ImagesSelector = ({ media }) => {

    const setSelectedMedia = mediaStore((s) => s.setSelectedMedia)
    let handleSelectFile = (fileId , idx)=>{
         setSelectedMedia((prev)=>{
           return {...prev , idx , selectedFileId : fileId}
         })
   }
    return <div className="flex items-center  justify-center  gap-0.5">
        {media.files.map((file, i) => {

            return <div onClick={()=>handleSelectFile(file.id,i)} key={file.id} className={`size-12 relative ${file.id === media?.selectedFileId ? "opacity-100" : "opacity-60 hover:opacity-75"} rounded-md  overflow-hidden `}>

                {file.type.startsWith("video") ? <video src={file.url} /> :
                    <Image src={file.url} alt={file.filename || "image"} fill className="  rounded-md overflow-hidden object-center" />
                }
            </div>
        })}
    </div>
}
const Option = ({ icon, tooltipText, p }) => {
    return <div className={`hover:ring ${p ? p : "px-1.5 py-1"} size-fit group/icon text-gray-12 hover:text-gray-200 duration-300 relative hover:bg-gray-6 rounded-lg  ring-gray-8 `}>
        {icon}
        {tooltipText &&
            <div className="absolute -bottom-10 p-1.5 left-1/2 -translate-x-1/2 text-nowrap text-sm   duration-300 group-hover/icon:opacity-100 opacity-0 rounded-lg border border-white/30">
                {tooltipText}
            </div>
        }
    </div>
}