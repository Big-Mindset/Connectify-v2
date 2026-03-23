export default function OptionButton({icon , text , textsize,red}){
    return (
         <div className={`flex text-sm px-3.5 
         ${red ? "hover:bg-red-500/30 hover:text-red-200": "hover:bg-indigo-800 hover:text-indigo-100"} 
          duration-50 cursor-pointer p-1.5 rounded-lg items-center gap-2.5`}>
                {icon}
                <span className={textsize}>{text}</span>
         </div>
    )
}