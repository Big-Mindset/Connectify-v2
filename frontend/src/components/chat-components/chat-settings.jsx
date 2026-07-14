

import {  CheckCheck,  Heart, Pin, Trash } from "lucide-react";
import { Archive } from "lucide-react";
import {motion} from "framer-motion"
import OptionButton from "../option-button";
export default function ChatSettings(){
   
    let options = [{text : "Archive Chat" , icon :<Archive size={16} /> } , {text : "Pin Chat" , icon :<Pin size={16} /> } , {text : "Mark as favourite" , icon : <Heart size={16} />} , {text : "Mark as Read" ,  icon : <CheckCheck size={16} />} , {text : "Delete" , icon : <Trash size={16} /> } ]
    
    return (
    <motion.div
    initial={{opacity : 0 , scale : 0}}
    animate={{opacity : 1 , scale : 1}}
    exit={{opacity : 0 , scale : 0}}
    transition={{duration : 0.09}}
      className={`absolute  origin-top-right  p-4 rounded-lg bg-gray-1 border border-gray-4 z-40  right-1 top-1`}>
        <div className="flex flex-col gap-1">
        {options.map((data)=>{
            return <OptionButton key={data.text} icon={data.icon}  text={data.text} />
        })}
        </div>
    </motion.div>
    )
}