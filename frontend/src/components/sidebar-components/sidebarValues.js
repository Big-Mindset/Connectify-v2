import chatsIcon from "@/assets/chats.svg"
import group from "@/assets/group.svg"

import user from "@/assets/user.svg"
import { CircleIcon, PhoneCall } from "lucide-react"

export let options = [
    {name : "Chats" , image:chatsIcon},
    {name : "Contacts" , image :user },
    {name : "Groups" , image :group },
    {name : "Status" , image :null , icon: <CircleIcon size={20} /> },
    {name : "Calls" , image :null , icon: <PhoneCall size={20} /> },
]