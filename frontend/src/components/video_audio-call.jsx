import { Axios } from "@/lib/axiosInstance"
import { useLoading } from "@/lib/loading_hook"
import { chatStore } from "@/store/Chat-store"
import "@livekit/components-styles"
import { userStore } from "@/store/user-store"
import { LiveKitRoom, ParticipantTile, RoomAudioRenderer , useParticipantInfo, useTracks, VideoConference } from "@livekit/components-react"
import { useEffect, useState } from "react"
import { Track } from "livekit-client"
import VideoAudioUi from "./call-components/video-aduio"

export default function VideoAudioCall(){
    let session = userStore(s=>s.session)
    let selectedChat = chatStore(s=>s.selectedChat)
    let userId = session?.user?.id
    let chatId = selectedChat?.id
    let [callData , setCallData] = useState(null)
    let [error , setError] = useState(null)
    let {loading , setLoading} = useLoading()
    
    useEffect(()=>{
        setLoading("call-loading")
        const fetchToken = async ()=>{
            try {
                let res  = await Axios.post("/livekit/token",{
                    groupId : chatId,
                    participantId : userId
                })
                if (res.status === 200){
                    let {url , token } = res.data
                    setCallData({url , token})
                }
            } catch (error) {
                setError(error?.response?.data?.message || error?.message)

            }finally{
                setLoading("")
            }
        }
       if (userId && chatId){
             fetchToken()
       } 
    },[selectedChat , session])


      if (loading === "call-loading") return <div className="flex items-center justify-center h-full">Connecting...</div>;
  if (error)   return <div className="text-red-500">Error: {error}</div>;
  if (!callData) return null;

    return (
        <div className=" h-full">
           
                <LiveKitRoom 
                token={callData?.token}
                serverUrl={callData?.url}
                connect={true}
            video={true}
            audio={true}
            className="size-full"
            >
                <RoomAudioRenderer  />
               <VideoAudioUi />
            </LiveKitRoom>
            
            
        </div>
    )
}

