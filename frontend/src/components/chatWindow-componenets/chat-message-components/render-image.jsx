import { useState } from "react"
import Image from "next/image"
export default function RenderImage({image , multipleImages}) {
  
    return (
        <>

            {
                !multipleImages ?
                    <Image
                        src={image.url}
                        alt={image.imagename || "image"}
                        width={300}
                        height={300}
                        
                        className={`object-cover max-h-[500px]  w-full h-auto object-center rounded-lg overflow-hidden `}
                    />
                    :
                    <Image
                        src={image.url}
                        alt={image.imagename || "image"}
                        fill
                        sizes="200px"
                        
                        className={`object-cover w-full h-auto object-center`}
                    />
            }
        </>
    )
}