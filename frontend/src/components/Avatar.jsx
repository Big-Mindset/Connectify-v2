import Image from "next/image";

export default function Avatar({image , size}){
    if (!image) {
        image = "wadood"
    }
    return (
        <div className={`rounded-full  flex justify-center shrink-0 items-center ${size ? size : "size-12"} border-gray-10 border overflow-hidden`}>
            {(!image || image === null) ? "W" :
            <Image src={"https://i.pinimg.com/736x/8d/50/83/8d5083fc7e30ea52cc4c0c84f42ef5a6.jpg"} className="bg-center bg-cover"  height={100} alt="user-avatar" width={100}  />}
        </div>
    )
}