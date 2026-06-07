import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
export default function VideoControls({videoRef ,isPlaying }) {
    const [showVolume, setShowVolume] = useState(false)
    const [volume, setVolume] = useState(0)
    const rangeRef = useRef(null)
    const veritcalRangeRef = useRef(null)

    const handleChanges = (e) => {
        let percentage = e.target.value
        
        videoRef.current.currentTime = (percentage / 100) * videoRef.current.duration
    }

    let handlePlayAudio = () => {
        if (videoRef.current.paused) {
            
            videoRef.current.play()
        } else {
            videoRef.current.pause()
        }
    }
    let handleChangeVolume = (e) => {
        let volume = e.target.value
        setVolume(volume)
        videoRef.current.volume = volume / 100
    }
      useEffect(()=>{
        
        let video = videoRef.current
        let handleUpdateTime = ()=>{
            let progress = (video.currentTime / video.duration) * 100
            rangeRef.current.value = progress
            rangeRef.current.style.background =
                `linear-gradient(to right, #6366f1 0%, #6366f1 ${progress}%, transparent ${progress}%,gray)`
            requestAnimationFrame(handleUpdateTime)
 
        }
        videoRef.current.volume = volume / 100

        video.addEventListener("timeupdate",handleUpdateTime)
        return ()=>{
            video.removeEventListener("timeupdate",handleUpdateTime)

        }
    },[])
    return <div className="flex bg-black/30 right-0 left-0 z-[30]    absolute bottom-0 items-center gap-1 pr-2">
        <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-1">
                <motion.button
                    whileTap={{ y: 1 }}
                    onClick={handlePlayAudio} className="p-2 rounded-full hover:text-gray-50 cursor-pointer text-gray-12">

                    {isPlaying ? <i className="fa-solid fa-pause"></i> :
                        <i className="fa-solid fa-play"></i>}
                </motion.button>

            </div>
            <div className="flex-1">

                <input ref={rangeRef} id="sound-range" type="range" onChange={handleChanges} defaultValue={0} style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${0}%, transparent ${0}%,gray)` }} className="rounded-lg  cursor-pointer appearance-none bg-gray-200  overflow-hidden w-full" />
            </div>
            <div onMouseLeave={() => setShowVolume(false)} className="relative">

                <motion.button
                    onMouseEnter={() => { setShowVolume(true) }}
                    onClick={() => {
                        setVolume(vol => {
                            if (vol > 0) {
                                videoRef.current.volume = 0
                                return 0
                            } else {
                                videoRef.current.volume = 1

                                return 100
                            }
                        })

                    }}
                    whileTap={{ y: 1 }}
                    className="rounded-full cursor-pointer  hover:text-gray-50 text-gray-12 p-1">
                    {volume === 0 ? <i className="fa-solid fa-volume-xmark" ></i> :
                        <i className="fa-solid fa-volume" ></i>}
                </motion.button>
                {showVolume &&
                    <input
                        ref={veritcalRangeRef}
                        value={volume}
                        onChange={handleChangeVolume}
                        type="range"
                        id="vertical-range"
                        min={0}
                        max={100}
                        style={{
                            background: `linear-gradient(to bottom, #6366f1 0%, #6366f1 ${volume}%, #6b7280 ${volume}%, #6b7280 100%)`
                        }}
                        className="[writing-mode:vertical-lr] vertical-range scale-y-[-1] rounded-lg appearance-none w-[10px] h-[80px] overflow-hidden absolute bottom-full right-2"
                    />
                }

            </div>
                <div onClick={()=>videoRef.current.requestFullscreen()}  className="p-2 rounded-full hover:text-gray-50 cursor-pointer text-gray-12">
                   <i className="fa-solid fa-expand"></i>
                </div>
        </div>
    </div>
}