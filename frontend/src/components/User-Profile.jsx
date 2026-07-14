import { authClient } from "@/lib/auth-client";
import Avatar from "./Avatar";
import { Copy, Loader2 } from "lucide-react";
import { formateTime } from "@/lib/formateTime";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "@/lib/loading_hook";
import { Axios } from "@/lib/axiosInstance";
import { userStore } from "@/store/user-store";
import { chatStore } from "@/store/Chat-store";

const BIO_MAX = 260

export default function UserProfile({ setOpenProfile }) {
    const { data, isPending, refetch } = authClient.useSession()
    const [changed, setChanged] = useState(false)
    const [editProfile, setEditProfile] = useState(false)
    const { loading, setLoading } = useLoading()
    const fileRef = useRef(null)
    const setSession = userStore(s=>s.setSession)
    const user = data?.user
    const participants = chatStore(s=>s.participants)
    const setParticipants = chatStore(s=>s.setParticipants)
    const [profileData, setProfileData] = useState({
        name: "",
        bio: "",
        image: ""
    })

    useEffect(() => {
        if (isPending || !user) return
        setProfileData({
            name: user.name || "",
            bio: user.bio || "",
            image: user.image || ""
        })
    }, [isPending])

    useEffect(() => {
        if (!profileData.name || !user) return
        const bioChanged = profileData.bio !== (user.bio || "")
        const nameChanged = profileData.name !== user.name
        const imageChanged = profileData.image !== (user.image || "")
        setChanged(bioChanged || nameChanged || imageChanged)
    }, [profileData.bio, profileData.name, profileData.image])

    const handleSaveChanges = async () => {
        if (!changed) return
        setLoading("save-changes")

        let uploadedImageUrl = user.image

        if (fileRef.current) {
            const formData = new FormData()
            formData.append("file", fileRef.current)
            formData.append("upload_preset", "profile-image")

            const res = await fetch("https://api.cloudinary.com/v1_1/dsnrck9gn/auto/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            uploadedImageUrl = data.secure_url
        }

        await authClient.updateUser(
            { ...profileData, image: uploadedImageUrl },
            {
                onSuccess: async () => {
                    await refetch()
                    let freshSession = await authClient.getSession()
                    setSession(freshSession.data)
                    setParticipants(data.user.id , {name : profileData.name , image : uploadedImageUrl || data.user.image})
                   
                    setChanged(false)
                    setEditProfile(false)
                    fileRef.current = null
                }
            }
        )

        setLoading("")
    }

    const handleEditProfile = () => {
        setEditProfile(prev => !prev)
        if (!editProfile && !profileData.name) {
            setProfileData(prev => ({ ...prev, name: user.name }))
        }
    }

    const handleShowPreview = (event) => {
        const file = event.target.files[0]
        if (!file) return
        fileRef.current = file
        const url = URL.createObjectURL(file)
        setProfileData(prev => ({ ...prev, image: url }))
    }

    if (isPending || !user) return null
    const resetChanges = () => {
        setProfileData({
            name: user.name || "",
            bio: user.bio || "",
            image: user.image || ""
        })
    }
    return (
        <>
            <div className="fixed inset-0 z-[20] bg-gray-800/20" onClick={() => setOpenProfile(false)} />
            <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                exit={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed top-1/2 z-[20] rounded-2xl max-w-[500px] border border-gray-800 outline outline-gray-800 w-full bg-gray-2/80 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="p-5">
                    <div className="flex justify-between items-center">
                        <h1 className="tracking-wider uppercase text-[0.8rem] text-indigo-300">Profile</h1>
                        <div className="flex items-center gap-2 justify-end">
                            <div
                                onClick={handleEditProfile}
                                className={`rounded-lg px-3 py-2 text-gray-200 text-[0.7rem] cursor-pointer opacity-80 hover:opacity-100 duration-300 hover:bg-indigo-400/50 hover:ring hover:ring-indigo-500/70 hover:text-indigo-300 ${editProfile ? "text-indigo-100 ring ring-indigo-500 bg-indigo-500/80" : "bg-indigo-300/20"}`}
                            >
                                <i className="fa-sharp fa-solid fa-user-pen" />
                            </div>
                            <div
                                onClick={() => setOpenProfile(false)}
                                className="rounded-lg px-3 py-2 text-gray-200 text-[0.7rem] cursor-pointer opacity-80 hover:opacity-100 duration-300 bg-indigo-300/20 hover:bg-indigo-400/50 hover:ring hover:ring-indigo-500/70"
                            >
                                <i className="fa-solid fa-x text-[0.7rem]" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full mt-6 overflow-hidden rounded-xl">
                        <div className="flex flex-col gap-3 p-2 items-center">
                            <div className="flex justify-center">
                                <div className="group relative overflow-hidden">
                                    <label htmlFor="pfp" className="absolute rounded-full cursor-pointer z-[200] duration-200 inset-0 opacity-0 group-hover:opacity-100 group-hover:bg-gray-800/30">
                                        <div className="flex items-center text-gray-200 text-xl size-full justify-center">
                                            <div className="flex flex-col items-center w-full">
                                                <i className="fa-sharp fa-solid fa-image" />
                                                <p className="text-sm tracking-wider">UPLOAD</p>
                                            </div>
                                            <input onChange={handleShowPreview} type="file" accept="image/*" className="hidden" id="pfp" />
                                        </div>
                                    </label>
                                    <div className="border rounded-full border-indigo-400">

                                        <Avatar image={profileData.image || null} content={profileData.name.charAt(0)} size="size-24" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="font-bold text-center text-gray-200 text-2xl">{profileData.name}</div>
                                <div className="flex gap-1 ml-5 items-center bg-indigo-400/20 px-2 py-0.5 rounded-full">
                                    <p className="text-gray-200/90 text-sm">{user.username}</p>
                                    <div className="text-indigo-200 hover:text-white duration-200 cursor-pointer p-1">
                                        <Copy size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="m-5 flex flex-col gap-6  p-3">
                            <div className="flex flex-col gap-1 ">

                                <span className="text-sm text-gray-300 whitespace-pre-wrap break-words w-full">
                                    {profileData.bio || "Click edit button to add bio"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="tracking-wider uppercase text-[0.7rem] text-indigo-300">Joined</span>
                                <span className="text-sm text-gray-300">{formateTime(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {editProfile && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-4 py-6 px-10 border-t border-indigo-300/60 overflow-hidden"
                        >
                            <div className="flex flex-col gap-1">
                                <label htmlFor="name" className="tracking-wider text-[0.8rem] text-indigo-100">Name</label>
                                <input
                                    value={profileData.name}
                                    maxLength={40}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                    type="text"
                                    id="name"
                                    className="outline-none ring ring-indigo-200/40 bg-transparent duration-200 hover:ring-indigo-200/60 focus:ring-indigo-400 focus:ring-2 rounded-sm p-2"
                                />
                                {!profileData.name.trim() && (
                                    <span className="text-sm text-red-300">Name is required</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between  items-center">
                                    <label htmlFor="bio" className="tracking-wider text-[0.8rem] text-indigo-100">
                                        Bio <span className="text-indigo-300/60">(optional)</span>
                                    </label>
                                    <span className={`text-[0.7rem] tabular-nums ${profileData.bio.length >= BIO_MAX ? "text-red-400" : "text-indigo-300/60"}`}>
                                        {profileData.bio.length}/{BIO_MAX}
                                    </span>
                                </div>
                                <textarea
                                    maxLength={BIO_MAX}
                                    rows={4}
                                    placeholder="type something about yourself"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                    id="bio"
                                    className="outline-none ring ring-indigo-200/40 bg-transparent placeholder:text-sm placeholder:text-gray-500 hover:ring-indigo-200/60 focus:ring-indigo-400 focus:ring-2 rounded-sm p-2 resize-none"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-end gap-2 m-6">
                    <AnimatePresence>
                        {changed && (
                            <>
                                <motion.button
                                    onClick={resetChanges}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-gradient-to-r disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600 from-gray-600 to-gray-800 border border-gray-900 rounded-lg px-5 text-sm text-gray-100 flex items-center gap-2 py-1.5 cursor-pointer"
                                >
                                    Reset
                                    
                                </motion.button>
                                <motion.button
                                    onClick={handleSaveChanges}
                                    disabled={!profileData.name.trim() || !!loading}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-gradient-to-r disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-600 from-indigo-600 to-indigo-800 border border-indigo-900 rounded-lg px-5 text-sm text-gray-100 flex items-center gap-2 py-1.5 cursor-pointer"
                                >
                                    Save changes
                                    {loading && <Loader2 className="animate-spin text-gray-200 size-4" />}
                                </motion.button>
                            </>
                        )}




                    </AnimatePresence>
                </div>
            </motion.div>
        </>
    )
}