import { useState } from "react"
import Image from "next/image"
export default function RenderImage({image , multipleImages}) {
  
    const [imagesizes , setimagesizes] = useState({})
    return (
        <>

            {
                !multipleImages ?
                    <Image
                        src={image.url}
                        alt={image.imagename || "image"}
                        height={imagesizes[image.id] !== undefined ? imagesizes[image.id] : 300}
                        width={imagesizes[image.id] !== undefined ? imagesizes[image.id] : 300}
                        sizes="(max-width:640px) 100vw, 600px"
                        onLoadingComplete={(img) => {
                            let height = img.naturalHeight
                         

                            if (height <= 1050) {
                                setimagesizes(prev => ({
                                    ...prev, [image.id]: 400
                                }))
                            } else if (height <= 1100) {
                                setimagesizes(prev => ({
                                    ...prev, [image.id]: 300
                                }))
                            } else if (height > 1100) {
                                setimagesizes(prev => ({
                                    ...prev, [image.id]: 250
                                }))
                            } else {
                                setimagesizes(prev => ({
                                    ...prev, [image.id]: 300
                                }))
                            }

                        }}
                        className={`object-contain object-center rounded-lg overflow-hidden `}
                    />
                    :
                    <Image
                        src={image.url}
                        alt={image.imagename || "image"}
                        fill
                        className={`object-cover object-center`}
                    />
            }
        </>
    )
}