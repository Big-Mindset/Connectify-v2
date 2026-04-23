import { authClient } from "@/lib/auth-client"
import { Mail } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"


export default function EmailVerification({ email }) {
    const handleResendVerificationEmail = async ()=>{
        let res = await authClient.sendVerificationEmail({
            email,
        },{
            onSuccess : ()=>{
                toast.success("Email verification has been sent!!")
            }
        })

    }
    return <div className=" bg-gradient-to-b w-full max-w-[500px]  from-[#2A2A2A] to-[#191919] shadow-[0.5px_-1px_5px_0.5px_gray]  rounded-lg p-2.5">
        <h1 className="text-center mt-1.5 font-bold text-2xl text-gray-300">Email Verification</h1>

        <div className="mt-5">

            <p className="text-center text-gray-300">Verification email has been sent to your email <span className="text-purple-200">{email}</span></p>
            <div className="mt-5 flex group items-center gap-2 cursor-pointer border-violet-300 border px-3 py-2 hover:bg-indigo-700/80 duration-150 rounded-lg w-fit  mx-auto">
               
                <Link href={"https://mail.google.com/mail/"} target="_blank" className="text-center text-gray-200">Open Email</Link>
                <Mail className="duration-200 text-gray-200" size={16} />
            </div>
            <div onClick={handleResendVerificationEmail} className="mt-2.5 text-center w-fit mx-auto  cursor-pointer  text-gray-300 hover:underline" >Resend Verification-Email</div>

        </div>

    </div>
}