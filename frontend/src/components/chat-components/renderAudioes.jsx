import { sizeText } from "@/lib/formateSize"
import { Trash2 } from "lucide-react"
import { motion, useAnimate } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export default function RenderAudio({ audioes , deleteButton }) {
    const [hoveredAudio, setHoveredAudio] = useState("")

    return <div className="flex flex-col max-w-[440px]  gap-1.5">

        {
            audioes.map((audio) => {
                return <AudioComponent key={audio.id} audio={audio} setHoveredAudio={setHoveredAudio} hoveredAudio={hoveredAudio} deleteButton={deleteButton} />
            })
        }
    </div>
}

const AudioComponent = ({ audio, deleteButton, setHoveredAudio, hoveredAudio }) => {
    let audioRef = useRef(null)
    let rangeRef = useRef(null)
    let veritcalRangeRef = useRef(null)
    const [playingAudio, setPlayingAudio] = useState(false)
    const [audioData, setAudioData] = useState({ duration: 0, progress: 0 })
    const [showVolume, setShowVolume] = useState(false)
    const [volume, setVolume] = useState(1)
    useEffect(() => {
        let audio = audioRef.current
        let updateProgress = () => {
            let progress = (audio.currentTime / audio.duration) * 100
            rangeRef.current.value = progress
            rangeRef.current.style.background =
                `linear-gradient(to right, #6366f1 0%, #6366f1 ${progress}%, transparent ${progress}%,gray)`
            requestAnimationFrame(updateProgress)
            setAudioData(prev => {
                return { ...prev, progress: audio.currentTime }
            })
        }
        let loadMetaData = () => {
            setAudioData(prev => {
                return { ...prev, duration: audio.duration }
            })
        }


        audio.addEventListener("timeupdate", updateProgress)
        audio.addEventListener("loadedmetadata", loadMetaData)
        return () => {
            audio.removeEventListener("timeupdate", updateProgress)
            audio.removeEventListener("loadedmetadata", loadMetaData)

        }
    }, [])
    useEffect(() => {
        const audio = audioRef.current

        const handleEnded = () => {
            setPlayingAudio(false)
        }

        audio.addEventListener("ended", handleEnded)

        return () => {
            audio.removeEventListener("ended", handleEnded)
        }
    }, [])
    const handleChanges = (e) => {
        let percentage = e.target.value
        audioRef.current.currentTime = (percentage / 100) * audioData.duration
    }
    function formatTime(time) {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    let handlePlayAudio = () => {
        if (audioRef.current.paused) {
            setPlayingAudio(true)
            audioRef.current.play()
        } else {
            setPlayingAudio(false)
            audioRef.current.pause()
        }
    }
    let handleChangeVolume = (e) => {
        let volume = e.target.value
        setVolume(volume)
        audioRef.current.volume = volume / 100
    }
    return (
        <div onMouseEnter={() => setHoveredAudio(audio.id)} onMouseLeave={() => setHoveredAudio("")} key={audio.id} className={`flex bg-gray-2  relative border-gray-3 rounded-lg border p-5 flex-col gap-3 `}>
            <div className="absolute -right-1 -top-1">
                {(hoveredAudio === audio.id) &&
                    <div className="flex items-center bg-gray-3 rounded-lg  gap-1">
                        {deleteButton &&
                            <div
                                className={` p-1.5  bg-gray-3   hover:text-gray-100 text-gray-300 z-50 duration-50  hover:bg-red-800/70  rounded-md `}>
                                <Trash2 size={20} />
                            </div>
                        }
                        <div className="p-1.5 hover:bg-gray-6 duration-50 rounded-md hover:text-white">
                            <i className="fa-solid fa-download" ></i>
                        </div>
                    </div>
                }

            </div>
            <div className="flex items-center">
                <div className="w-fit">
                    <i className="fa-solid text-indigo-200   fa-file fa-2x  relative">

                        <i style={{ fontSize: "12px" }} className="fa-solid fa-volume text-indigo-400 absolute left-1/2 top-[60%] -translate-1/2 "></i>

                    </i>
                </div>
                <div className="flex  flex-col gap-1">
                    <p className="text-indigo-300 text-xs">{audio.filename}</p>
                    <p className="text-xs text-gray-400">{sizeText(audio.size)}</p>
                </div>
            </div>
            <div className=" bg-gray-3 w-full rounded-lg p-2">
                <audio src={audio.url} className="hidden" ref={audioRef} controls />
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileTap={{ y: 1 }}
                            onClick={handlePlayAudio} className="p-2 rounded-full hover:text-gray-50 cursor-pointer text-gray-12">

                            {playingAudio ? <i className="fa-solid fa-pause"></i> :
                                <i className="fa-solid fa-play"></i>}
                        </motion.button>
                        <p className="text-xs">{`${formatTime(audioData.progress)} /  ${formatTime(audioData.duration)}`}</p>
                    </div>
                    <div className="flex-1">

                        <input ref={rangeRef} id="sound-range" type="range" onChange={handleChanges} defaultValue={0} style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${0}%, transparent ${0}%,gray)` }} className="rounded-lg   appearance-none bg-gray-200  overflow-hidden w-full" />
                    </div>
                    <div onMouseLeave={() => setShowVolume(false)} className="relative">

                        <motion.button
                            onMouseEnter={() => { setShowVolume(true) }}
                            onClick={() => {
                                setVolume(vol => {
                                    if (vol > 0) {
                                        audioRef.current.volume = 0
                                        return 0
                                    } else {
                                        audioRef.current.volume = 1

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
                </div>
            </div>
        </div>
    )
}