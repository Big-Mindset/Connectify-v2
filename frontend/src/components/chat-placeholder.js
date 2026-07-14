import Image from "next/image";
import Logo from "@/assets/logop.webp"
export default function ChatPlaceholder() {
    return (
        <div className="flex h-full items-center bg-gray-2 justify-center px-6">
            <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">


                <div className="relative flex size-14 items-center justify-center rounded-full bg-indigo-100 ring-1 ring-indigo-300/40 cursor-pointer transition duration-200 hover:scale-105">
                    <Image src={Logo} alt="Connectify logo" className="object-cover" width={30} height={30} />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-2xl font-bold tracking-wide text-transparent">
                        Welcome to Connectify
                    </p>
                    <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                        Real-time, fast, and secure messaging with a UI built to feel effortless. Pick a conversation on the left to get started.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-gray-700/60 bg-gray-800/40 px-4 py-1.5">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                    </span>
                    <p className="text-xs tracking-wide text-gray-300">End-to-end encrypted</p>
                </div>

            </div>
        </div>
    )
}