import chatsIcon from "@/assets/chats.svg"
import group from "@/assets/group.svg"

import user from "@/assets/user.svg"
import { CircleIcon, PhoneCall } from "lucide-react"

export let options = [
    {name : "Chats" , image:chatsIcon ,link : "chat"},
    {name : "Contacts" , image :user , link : "contacts" },
    {name : "Status" , image :null , icon: <CircleIcon size={20} /> , link : "status" },
    {name : "Calls" , image :null , icon: <PhoneCall size={20} /> , link : "calls"},
]