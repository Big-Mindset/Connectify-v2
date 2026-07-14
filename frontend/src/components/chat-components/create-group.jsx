"use client"

import { Search, X, Users, Loader } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import GroupUser from "./create-group-components/group-user";
import GroupDetailsForm from "./create-group-components/group-details-form";
import { Axios } from "@/lib/axiosInstance";
import { chatStore } from "@/store/Chat-store";
import { useLoading } from "@/lib/loading_hook";


export default function CreateGroup({ createGroup, setCreateGroup }) {
    const [step, setStep] = useState("select");
    const [searchTerm, setSearchTerm] = useState("");
    const [participantIds, setParticipantIds] = useState(null);
    const [users , setUsers] = useState([])
    const {loading , setLoading} = useLoading()
    const [loadingUsers , setLoadingUsers] = useState(true)
    const handleCreateGroup = chatStore(s=>s.handleCreateGroup)

   useEffect(() => {
        handleGetAllFriends()

    }, [])
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const q = searchTerm.toLowerCase();
        return users.filter((u) => u.name?.toLowerCase().includes(q));
    }, [users, searchTerm]);

    function toggleParticipant(userId) {
        setParticipantIds((prev) => {
            const current = prev ?? [];
            const exists = current.includes(userId);
            const next = exists
                ? current.filter((id) => id !== userId)
                : [...current, userId];
            return next.length ? next : null;
        });
    }

    function handleClose() {
        setCreateGroup(false);
        setStep("select");
        setParticipantIds(null);
        setSearchTerm("");
    }

    async function handleGroupSubmit(payload) {
        let chatId = crypto.randomUUID()
        setLoading("creating-group")
        await handleCreateGroup({...payload , chatId })
        setLoading("")
        setCreateGroup(false)
    }

    const selectedCount = participantIds?.length ?? 0;


    

    let handleGetAllFriends = async () => {
        try {
            setLoading("fetching-friends")
            let res = await Axios.get("/friendship/all-friends")
            if (res.status === 200){
               setUsers(res.data.allFriends)
            }
        } catch (error) {
            console.log(error.message)
        }finally{
            setLoadingUsers(false)

        }
    }
    return (
        <>
            {createGroup && (
                <div
                    onClick={handleClose}
                    className="fixed inset-0 bg-black/50 z-20"
                />
            )}
                {createGroup && (
                    <div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="border border-gray-800 bg-gray-950 shadow-2xl shadow-black/40 fixed z-50 left-1/2 w-full max-w-[460px] top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl"
                    >
                        <div className="p-5">

                            <div className="flex w-full items-center justify-between">
                                <div className="flex flex-col">
                                    <h1 className="font-bold text-xl text-gray-50">
                                        {step === "select" ? "Add Participants" : "Group Details"}
                                    </h1>
                                    {step === "select" && (
                                        <span className="text-xs text-gray-400">
                                            {selectedCount > 0
                                                ? `${selectedCount} selected`
                                                : "Select people to add"}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="rounded-full cursor-pointer duration-150 hover:bg-gray-800 text-gray-400 hover:text-gray-100 p-1.5"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                           
                                {step === "details" ? (
                                    <div
                                    >
                                        <GroupDetailsForm
                                            participantIds={participantIds}
                                            onBack={() => setStep("select")}
                                            onSubmit={handleGroupSubmit}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="space-y-3 mt-4"
                                    >
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search users"
                                                className="w-full outline-none text-gray-100 placeholder:text-gray-500 placeholder:text-sm rounded-lg py-2.5 pl-9 pr-3 bg-gray-900/70 ring-1 ring-gray-800 focus:ring-2 focus:ring-indigo-500 duration-150"
                                            />
                                        </div>

                                        <div className="mt-2 max-h-[300px] overflow-y-auto users-section space-y-1.5 pr-1">

                                            {loadingUsers ? <div className="flex justify-center  py-6">
                                                <p className="tracking-wider font-bold animate-pulse">Wait a moment...</p>
                                            </div> : filteredUsers.length === 0 ? (
                                                <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
                                                    <Users className="size-8" />
                                                    <span className="text-sm">No users found</span>
                                                </div>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <GroupUser
                                                        key={user.id}
                                                        user={user}
                                                        isSelected={(participantIds ?? []).includes(user.id)}
                                                        onToggle={toggleParticipant}
                                                    />
                                                ))
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                                            <button
                                                onClick={handleClose}
                                                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 duration-150 cursor-pointer rounded-full"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => setStep("details")}
                                                disabled={selectedCount === 0}
                                                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium duration-150 cursor-pointer rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                )}
                          
                        </div>
                    </div>
                )}
         
        </>
    );
}