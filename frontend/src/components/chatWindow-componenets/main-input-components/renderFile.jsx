"use client"

import {
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { sizeText } from "@/lib/formateSize";

export default function RenderFile({ data , thumbnailsUrl }) {

  const IconCard = ({ children, label, subtitle, variant = "default" }) => {
    const variantClasses = {
      video: "text-indigo-400 dark:text-indigo-300 ",
      audio: "text-gray-400 dark:text-indigo-200",
      pdf: "text-rose-400 dark:text-rose-300",
      image: "text-fuchsia-400 dark:text-fuchsia-300",
      default: "text-slate-500 dark:text-slate-300",
    };

    return (
      <div className={`flex flex-col justify-center items-center  gap-0.5 gap-3 p-3 rounded-lg overflow-hidden h-full : ${variantClasses[variant] || variantClasses.default}`}>
        <div className="flex-shrink-0 ">
          {children}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{label}</div>
          <div className="text-xs opacity-70">{subtitle}</div>
        </div>
      </div>
    );
  };

  if (data?.type?.startsWith("image") || data?.type?.startsWith("video")) {
    return (
      <div className="size-40 overflow-hidden  ">
        <img
          src={thumbnailsUrl[data.url] || data.url}
          alt={data.name || "image preview"}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

 

  if (data?.type?.startsWith("audio")) {
    return (
      <IconCard label={data.name} subtitle={sizeText(data.size)} variant="audio">
      <i className="fa-solid   fa-file fa-5x  relative">
        
     <i style={{fontSize : "30px"}} className="fa-solid fa-volume text-indigo-400 absolute left-1/2 top-[60%] -translate-1/2 "></i>
     
      </i>
     
      </IconCard>
    );
  }

  if (data?.type === "application/pdf") {
    return (
      <IconCard label={data.name} subtitle={sizeText(data.size)} variant="pdf">
        <FileText className="size-16" aria-hidden />
      </IconCard>
    );
  }

  return (
    <IconCard label={data.name} subtitle={sizeText(data.size)} variant="default">
  
      <i className="fa-solid fa-file fa-5x"></i>
     
    </IconCard>
  );
}
