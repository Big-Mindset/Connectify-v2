"use client";

import {
  Download,
  FileArchive,
  FileText,
  File,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function getFileMeta(file) {
  const type = file?.type || "";
  const name = file?.filename || "Untitled file";
  const ext = name.includes(".")
    ? name.split(".").pop().toUpperCase()
    : "FILE";

  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("7z") ||
    type.includes("compressed") ||
    name.match(/\.(zip|rar|7z|tar|gz)$/i)
  ) {
    return { icon: FileArchive, label: "Archive", ext };
  }

  if (type.includes("pdf") || name.match(/\.pdf$/i)) {
    return { icon: FileText, label: "PDF", ext };
  }

  return { icon: File, label: "File", ext };
}

export default function FileShowcaseCard({ file, deleteButton }) {
  const [hovered , setHovered] = useState(false)
  if (!file) return null;

  const meta = getFileMeta(file);
  const Icon = meta.icon;

  return (
    <div
    onMouseEnter={()=>setHovered(true)}
    onMouseLeave={()=>setHovered(false)}
      className="w-full relative max-w-[400px] rounded-lg border border-white/10 bg-[#0f0f14] p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1c1c26] text-indigo-400">
          <Icon size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {file.filename}
          </p>
          <p className="text-xs text-white/50">
            {formatBytes(file.size)} • {meta.ext}
          </p>
        </div>
    {hovered &&
        <div className="absolute flex items-center rounded-lg overflow-hidden  top-0 right-0  ">

          <Link
            href={file.url}
            download={file.filename}
            className="flex items-center justify-center  bg-[#1c1c26] p-2 text-indigo-400 hover:bg-[#262636] hover:text-indigo-300 transition"
          >
            <Download size={18} />
          </Link>
          {deleteButton &&
          <div

            className={` p-2   bg-gray-3 hover:text-gray-100 text-gray-300  duration-50  hover:bg-red-700   `}>
            <Trash2 size={20} />
          </div>
          }
        </div>
        }
      </div>
    </div>
  );
}

/* Usage
<FileShowcaseCard file={file} />
*/
