import { Axios } from "@/lib/axiosInstance";
import Avatar from "../Avatar";
import toast from "react-hot-toast";
export default function FriendRequest({ data, received, setPendingRequest }) {
    let user = data.user

    const handleRejectRequest = async () => {
        try {
            let res;
            if (received){

                 res = await Axios.put(`/friendship/reject-request?requestId=${data.id}`)
            }else{
                res = await Axios.delete(`/friendship/cancel-request?id=${data.id}`)
            }
            if (res.status === 200) {

                setPendingRequest((prev) => {
                    return prev.filter(req => req.id !== data.id)
                })
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    const handleAcceptRequest = async () => {
        try {
            let res = await Axios.post("/friendship/accept-request", { id: data.id })
       
            if (res.status === 201) {
                setPendingRequest((prev) => {
                    return prev.filter(req => req.id !== data.id)
                })
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }
    return (
        <div className="flex justify-between  p-2 items-center ">

            <div className="flex items-center gap-2">

                <Avatar />
                <div className="flex flex-col text-sm">
                    <p className="font-medium font-bold">{user.name}</p>
                    <p className="text-gray-12">{user.username}</p>
                </div>
            </div>
            <div className="flex items-center text-gray-400 gap-2">
                <button onClick={handleRejectRequest} className="bg-black group  relative hover:border-indigo-500 border-2 border-gray-900 cursor-pointer px-3 py-2 rounded-full">
                    <i className="fa-regular fa-x"></i>

                </button>

                <div className="relative">




                    {received &&
                        <button onClick={handleAcceptRequest} className="bg-black group  relative hover:border-indigo-500 border-2 border-gray-900 cursor-pointer px-3 py-2 rounded-full">
                            <i className="fa-solid fa-check"></i>

                        </button>
                    }

                </div>
            </div>
        </div>
    )
}