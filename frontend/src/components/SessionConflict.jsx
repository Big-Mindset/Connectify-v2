"use client";

import { useLoading } from "@/lib/loading_hook";
import { socketStore } from "@/store/socket";
import { Loader } from "lucide-react";

const OVERLAY_WRAPPER =
  "fixed inset-0 z-50 flex items-center justify-center bg-gray-3 px-4 backdrop-blur-md";
const OVERLAY_CARD =
  "w-full max-w-[500px] rounded-lg border border-indigo-500/30 bg-gradient-to-r from-indigo-800 to-indigo-700 px-6 py-7";
const SECONDARY_BUTTON =
  "cursor-pointer rounded-lg w-full  bg-indigo-700 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-indigo-600 hover:ring hover:ring-indigo-600 active:scale-[0.98]";
const PRIMARY_BUTTON =
  "cursor-pointer rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 hover:ring hover:ring-indigo-400 active:scale-[0.98]";

export default function SessionConflict({ children }) {
  const sessionStatus = socketStore((s) => s.sessionStatus);
  const setSessionStatus = socketStore((s) => s.setSessionStatus);
  const socket = socketStore((s) => s.socket);
  const { loading, setLoading } = useLoading();

  const handleSessionConflict = (takeover) => {
    setLoading(takeover ? "takeover" : "goback");
    socket?.emit("session:decision", {
      action: takeover ? "takeover" : "goback",
    });
    socket.on("user-connected",()=>{
        setLoading("")
        setSessionStatus("")

    })
  };


  if (sessionStatus === "session:conflict") {
    return (
      <div className={OVERLAY_WRAPPER}>
        <div className={OVERLAY_CARD}>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider text-gray-200">
              Session Conflict
            </h1>
            <p className="mt-3 text-sm leading-6 font-bold text-indigo-200">
              This account looks active in another browser or tab. Choose
              whether to continue here or stay on the other session.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <button onClick={() => handleSessionConflict(false)} disabled={loading} className={SECONDARY_BUTTON}>
               {loading === "goback" ? (
                <Loader className="mx-auto animate-spin text-gray-300" />
              ) : (
                "Cancel"
              )}
            </button>
            <button onClick={() => handleSessionConflict(true)} disabled={loading} className={PRIMARY_BUTTON}>
              {loading === "takeover" ? (
                <Loader className="mx-auto animate-spin text-gray-300" />
              ) : (
                "Use This"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionStatus === "session:terminated" ||sessionStatus === "session:rejected" ) {
    return (
      <div className={OVERLAY_WRAPPER}>
        <div className={OVERLAY_CARD}>
          <div className="text-center">
            <h1 className="text-xl mb-2 font-bold tracking-wider text-gray-200">
              This account looks active in another browser or tab.
            </h1>
          </div>

            <button  onClick={() => handleSessionConflict(false)} disabled={loading} className={SECONDARY_BUTTON}>
              Logout
            </button>
            
        </div>
      </div>
    );
  }

  return children;
}