import google from "@/assets/google.svg"
import github from "@/assets/github.svg"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"

export const OauthButtons = () => {
    const handleSocialLogin = async (provider) => {
        await authClient.signIn.social({
            provider,
            callbackURL: "http://localhost:3000",
            
        })
    }
    return (
        <div className="flex gap-3 text-gray-200 mb-2.5 px-2.5">
            <button 
                onClick={() => handleSocialLogin("google")} 
                className="flex flex-1 bg-gray-800/50 border border-gray-700 cursor-pointer hover:border-blue-500/50 hover:bg-blue-600/10 duration-200 rounded-lg p-2.5 gap-2 items-center justify-center transition-colors"
            >
                <Image src={google} alt="google" width={18} height={18} />
                <span className="font-medium">Google</span>
            </button>

            <button 
                onClick={() => handleSocialLogin("github")} 
                className="flex flex-1 bg-gray-800/50 border border-gray-700 cursor-pointer hover:border-gray-600 hover:bg-gray-700/50 duration-200 rounded-lg p-2.5 gap-2 items-center justify-center transition-colors"
            >
                <Image src={github} alt="github" width={18} height={18} />
                <span className="font-medium">GitHub</span>
            </button>
        </div>
    )
}