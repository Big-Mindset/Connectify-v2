import { useParticipants, useTracks } from "@livekit/components-react"
import { Track } from "livekit-client"
import { tr } from "zod/v4/locales"

export default function VideoAudioUi() {
    let participants = useParticipants()
    // let tracks = useTracks([{
    //     source : Track.Source.Camera,
    //     withPlaceholder : true
    // }])
    let tracks = Array.from({ length: 17 })
    let gridColumns = () => {
        let count = tracks.length
        if (count === 1) return 1
        if (count <= 6) return 2
        if (count <= 12) return 3
        if (count <= 24) return 4
        if (count <= 48) return 5
        if (count <= 100) return 6
    }
    let columns = gridColumns()
    let fullRow = Math.floor(tracks.length / columns) * columns
    let fullRowArr = tracks.slice(0, fullRow)
    let leftOversArr = tracks.slice(fullRow)
    console.log(columns, fullRow)
    return <div className=" h-full">
        <div className="flex  h-full  flex-col gap-10">
            <div className="h-full w-[70%] mx-auto pt-10 pb-20">

                <div style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} className={`grid place-items-center   gap-3  h-full`}>
                    {fullRowArr.map((track, i) => {


                        return (



                            <div className={`rounded-lg  size-full bg-red-200`}>

                            </div>

                        )
                    })}
                    <div className="flex justify-center h-full mx-auto gap-4 bg-red-200 w-full">
                        {leftOversArr.map((track) => (
                            <div className="rounded-lg  bg-red-200 w-[300px]">
                                ffdasf
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    </div>
} 