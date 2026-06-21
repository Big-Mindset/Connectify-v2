import Image from "next/image";

export default function Avatar({image , size , textSize}){
 
    return (
        <div className={`rounded-full flex justify-center bg-indigo-800 shrink-0 items-center ${size ?? "size-12"} relative overflow-hidden ring-2 ring-indigo-500/40 ring-offset-2 ring-offset-gray-900`}>
  {(!image)
    ? <span className={`text-indigo-300 ${textSize}  font-semibold text-sm select-none`}>W</span>
    : <Image sizes="20" src={image} className="object-cover object-center" fill alt="user-avatar" />
  }
</div>
    )
}