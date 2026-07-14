
import { authClient } from "@/lib/auth-client";
import { useLoading } from "@/lib/loading_hook";
import {  Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutDialog({setLogoutDialog}){
  let router = useRouter()
    const {loading , setLoading} = useLoading()
    const handleLogout = async ()=>{
        setLoading("logging-out")
        await authClient.signOut()
        setLoading("")
        router.push("/login")

    }
    return   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-gray-700/60 bg-gray-900 p-6 shadow-xl">
      
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
          <i className="fa-solid fa-right-from-bracket text-lg text-red-400"></i>
        </div>
        <p className="text-lg font-semibold text-gray-100">Log out of Connectify?</p>
        <p className="text-sm text-gray-400">
          You'll need to sign in again to access your chats.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setLogoutDialog(false)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800/60 py-2 text-sm font-medium text-gray-300 transition duration-150 hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition duration-150 hover:bg-red-700"
        >
            {loading === "logging-out" ? 
            <Loader2 className="animate-spin mx-auto text-gray-200 " /> : "Log out"}
        </button>
      </div>

    </div>
  </div>
}

