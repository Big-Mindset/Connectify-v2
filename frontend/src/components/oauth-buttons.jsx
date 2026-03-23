

import google from "@/app/assets/google.svg"
import github from "@/app/assets/github.svg"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"

export const OauthButtons = () => {
    const handleSocialLogin = async (provider) => {
        await authClient.signIn.social({
            provider,
            callbackURL: "/",
        })
    }
    return <div className="flex gap-7 mb-2.5 px-2.5">
        <button onClick={() => handleSocialLogin("google")} className="flex flex-1 bg-[#2A2A2A] border cursor-pointer hover:bg-[#181717]  duration-200 border-indigo-500/60 rounded-lg p-2 gap-2 items-center justify-center">
            <span>Google</span>
            <Image className="text-[#181717]" src={google} alt="google" width={20} height={20} />
        </button>

        <button onClick={() => handleSocialLogin("github")} className="flex bg-[#2A2A2A] rounded-lg cursor-pointer hover:bg-[#181717] duration-200 border-indigo-500/60 border flex-1 p-2 gap-2 items-center justify-center">
            <span>GitHub</span>
            <Image src={github} alt="github" width={20} height={20} />
        </button>
    </div>
}