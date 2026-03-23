
import { motion } from "framer-motion"
import { Pause } from "lucide-react";
import {useRef, useState } from "react";
import VideoControls from "./render-video-components/video-controls";

export default function RenderVideo({ video, multipleVideoes, hoveredFile }) {

    const [isPlaying, setIsPlaying] = useState(false)
    const [hasPlayed, setHasPlayed] = useState(false)
    const videoRef = useRef(null)
    
  
    return <div>
        {!multipleVideoes ?
            <div className="w-fit relative">

                <div onClick={() => {
                    if (videoRef.current.paused) {
                        videoRef.current.play()
                    } else {
                        videoRef.current.pause()
                    }
                }}
                    className="absolute  z-50 inset-0 " />
                <div className="flex items-center rounded-md overflow-hidden   right-3 top-2 absolute">
                   
                </div>
                {!hasPlayed &&
                    <div className="px-4 z-30 py-3.5 rounded-full bg-black/60 group-hover/card:bg-black/90 duration-150 absolute left-1/2 top-1/2 -translate-1/2 ">
                        <i className="fa-solid fa-play"></i>

                    </div>
                }

                {(hasPlayed) && isPlaying ? (
                    <>
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 2.2, opacity: [0, 0.5, 0] }}

                            transition={{ ease: "easeOut", duration: 0.6 }}
                            className="px-4 py-3.5 rounded-full z-30 bg-black/60 group-hover/card:bg-black/90 duration-150 absolute left-1/2 top-1/2 -translate-1/2 ">
                            <i className="fa-solid fa-play"></i>
                        </motion.div>
                    </>

                )
                    : (

                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 2.2, opacity: [0, 0.5, 0] }}
                            transition={{ ease: "easeOut", duration: 0.6 }}
                            className="px-4 py-3.5 rounded-full bg-black/60 z-30 group-hover/card:bg-black/90 duration-150 absolute left-1/2 top-1/2 -translate-1/2 ">
                            <Pause className="fill-white" />
                        </motion.div>
                    )
                }
                <video
                    ref={videoRef}
                    onPlay={() => {
                        if (!hasPlayed) {
                            setHasPlayed(true)
                        }
                        setIsPlaying(true)
                    }}
                    onPause={() => {
                        setIsPlaying(false)
                    }}
                    src={video.url}
                    className="max-w-[200px] rounded-lg"
                />

                {hasPlayed &&
                    <VideoControls videoRef={videoRef} setIsPlaying={setIsPlaying} isPlaying={isPlaying} />}

            </div>
            :
            <div className="w-fit">
               
                {!hasPlayed &&
                    <div className="px-4 z-30 py-3.5 rounded-full bg-black/60 group-hover/card:bg-black/90 duration-150 absolute left-1/2 top-1/2 -translate-1/2 ">
                        <i className="fa-solid fa-play"></i>

                    </div>
                }
                <video
                    src={video.url}
                    alt={video.videoname}

                    className={`w-[300px] rounded-lg `}
                />
            </div>
        }

    </div>


}