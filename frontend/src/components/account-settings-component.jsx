
import { Link, Loader, Loader2, LogOut, Plus, Unlink, User, X } from "lucide-react";
import Avatar from "./Avatar";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import googleIcon from "@/assets/google.svg"
import Image from "next/image";
import githubIcon from "@/assets/github.svg"
import { useLoading } from "@/lib/loading_hook";
import toast from "react-hot-toast";
import { Axios } from "@/lib/axiosInstance";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordValidation } from "@/zod/authValidations";
export default function AccountSettings() {
    const [linkedAccounts, setLinkedAccounts] = useState([])
    useEffect(() => {
        async function getAllAccounts() {
            let unlinkedProviders = new Set(["github", "google", "credential"])
            let res = await authClient.listAccounts()
            if (res.error) {
                console.log("handle error")
                return
            }
            res.data.forEach((acc) => {
                unlinkedProviders.delete(acc.providerId)
            })
            let updatedArray = [...unlinkedProviders].map((prov) => {
                return { id: crypto.randomUUID(), isLinked: false, providerId: prov }
            })
            setLinkedAccounts([...res.data, ...updatedArray])
        }
        getAllAccounts()

    }, [])
    let sortedLinkedAccounts = useMemo(()=>{
            return [...linkedAccounts].sort((a , b)=>b?.createdAt - a?.createdAt)
    },[linkedAccounts])
    return (
        <div className="absolute top-1/2 -translate-1/2 left-1/2  bg-[#28292A] rounded-lg w-full max-w-[500px] z-[70]">
            <div className="p-3">
                <div className="space-y-3">

                    <div className="flex items-center justify-between">
                        <p className="font-bold text-[1.5rem] ">Settings</p>
                        <div className="rounded-lg p-[.4rem] bg-[#3A3A3A]">
                            <X className="text-gray-200" />
                        </div>
                    </div>

                    <div className="p-2">
                        <div className="flex flex-col gap-4">

                            <div className="flex flex-col gap-2">

                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-300 font-bold ">Accounts</p>
                                    <div className="flex flex-col gap-2">
                                        <Account name={"Wad"} email={"wadoodmemon0@gmail.com"} key={"wadoodis1@"} />
                                    </div>
                                </div>

                                <button className="flex items-center p-2 font-bold text-sm w-full justify-center text-[#4B4B4B] hover:ring-3 ring-indigo-400 rounded-lg bg-indigo-100/80 cursor-pointer gap-2">
                                    <Plus />
                                    <p className="">Add New Account</p>
                                </button>
                            </div>
                            <div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-300 font-bold ">Linked Accounts</p>
                                    <div className="flex flex-col  gap-2 ">
                                        {sortedLinkedAccounts?.map((acc) => {

                                            return <LinkedAccount isLinked={acc?.accountId || acc?.isLinked} setLinkedAccounts={setLinkedAccounts} data={acc} key={acc.id} />
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

const Account = ({ name, email }) => {
    return (
        <div className="p-3 bg-gray-3 rounded-lg flex justify-between items-center gap-2">
            <div className="flex gap-2 items-center">
                <Avatar content={"W"} />
                <div className="">
                    <p className="text-gray-200 font-bold text-[1rem]">{name}</p>
                    <p className="text-sm text-gray-400">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 cursor-pointer hover:bg-red-300/40 bg-red-300/20 rounded-lg">
                    <LogOut size={20} className="text-red-300" />
                </button>
                <button className="size-2 cursor-pointer p-2 rounded-full border border-2 border-gray-200 bg-blue-500" />
            </div>
        </div>
    )
}

const LinkedAccount = ({ data, isLinked, setLinkedAccounts }) => {
    const { loading, setLoading } = useLoading()
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    let { handleSubmit , formState : {errors} ,register} = useForm({
        resolver : zodResolver(passwordValidation)
    })
    const handleLinkAccount = async () => {
        if (data.providerId === "credential"){
            setShowPasswordInput(prev=>!prev)
            return
        }
        setLoading(`connecting-${data.providerId}`)
        try {


            let res = await authClient.linkSocial({
                provider: data.providerId,
                callbackURL: "/",
                
            })
            if (res.error) {
                toast.error(res.error.message)
                return
            }
        } catch (error) {
            console.log(error.message)

        } finally {
            setLoading("")

        }
    }
    const handleSetPassword = async (data)=>{
        setLoading("changing-password")
       let res =  await Axios.post("/user/set-password",{password : data.password})
       if (res.status === 200){
        let {data ,error} = await authClient.listAccounts()
            if (error){
                console.log("error occured while fetching listAccounts")
                return 
            }

            let acc = data.find((acc)=>acc.providerId === "credential")
            setLinkedAccounts(prev=>{
            return prev.map((ac)=>ac.providerId === "credential" ? acc : ac)
        })
        setShowPasswordInput(false)

       }
       setLoading("")
    }
    const handleUnlinkAccount = async () => {
        setLoading(`unlinking-${data.providerId}`)
        try {
            let res = await authClient.unlinkAccount({
                providerId: data.providerId,
                accountId: data.accountId
            })
            if (res.error) {
                toast.error(res.error.message)
                return
            }
            if (res.data.status) {
                setLinkedAccounts((prev) => {
                    return prev.map((acc)=>{
                        if (acc.providerId === data.providerId){
                            return { id: crypto.randomUUID(), isLinked: false, providerId: acc.providerId }
                        }
                        return acc
                    })
                })
            }
        } catch (error) {
            console.log(error.message)
        } finally {

            setLoading("")
        }
    }
    return (
        <div className="flex flex-col gap-3 bg-gray-6 rounded-lg  p-3 ">

            <div className="flex items-center  gap-2 flex-1">

                <div className="flex flex-1 items-center   justify-between gap-2">
                    <div className=" px-2 py-1.5  h-full flex gap-1 rounded-full bg-gray-200 items-center  ">
                        <ShowIcon provider={data.providerId} />
                        <p className="text-gray-2 capitalize">{data.providerId}</p>
                    </div>
                    {isLinked ? <div className="flex items-center gap-4">
                        <p className=" text-green-300 tracking-wider ">Linked</p>
                        <button disabled={loading === "unlinking-account"} onClick={handleUnlinkAccount} className="text-red-50 cursor-pointer hover:bg-red-500 duration-100 bg-red-400 py-1 px-4 rounded-lg ">
                            {loading === `unlinking-${data.providerId}` ? <Loader className="animate-spin text-gray-300" /> :
                                <Unlink size={20} />}
                        </button>
                    </div> :
                        <button disabled={loading === "connecting-account"} onClick={handleLinkAccount} className="py-2 rounded-lg font-bold cursor-pointer hover:ring-indigo-300 text-sm bg-gray-7 hover:ring-2 duration-100 px-10 ">
                            {loading === `connecting-${data.providerId}` ? <div className="">
                                <span>Connecting...</span>
                            </div> : data.providerId === "credential" ? <div>
                                {showPasswordInput ? <p>Cancel</p> :  
                                <p>Set Password</p>
                                }   
                                
                            </div> :
                                "Connect"}
                        </button>
                    }
                </div>

            </div>
            {(data.providerId === "credential" && !isLinked && showPasswordInput) &&
            <div className="flex flex-col gap-2 ">

                <form className="flex items-center gap-2" onSubmit={handleSubmit(handleSetPassword)}>

                <input {...register("password")} type="text" className="flex-1 py-1 px-2 outline-none ring-2 ring-gray-8 rounded-lg focus:ring-indigo-300 duration-100" placeholder="Enter password" />
                <button type="submit" className="py-1 px-2 bg-indigo-400 rounded-lg  cursor-pointer ">
                    {loading === "changing-password" ? <Loader className="animate-spin text-gray-300" /> : "Set Password" }
                </button>
                </form>
                {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
            </div>
           
            }
        </div>
    )
}

let ShowIcon = ({ provider }) => {
    if (provider === "google") {
        return <Image src={googleIcon} width={20} height={20} alt={provider} />
    }
    if (provider === "github") {
        return <Image src={githubIcon} width={20} height={20} alt={provider} />
    }
    return <User className="text-gray-600 size-5" />
}