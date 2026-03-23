"use client"

export default function MoreOptions({optionsRef}){
    return (
    <div
    ref={optionsRef}
    className="absolute z-40 border border-gray-7  right-17 rounded-sm  bg-gray-5 w-[200px] p-2  top-[9%]">
        <div className="flex flex-col gap-0.5 text-[0.8rem]">

           <Option text={"Edit"} icon={<i className="fa-solid fa-pen"></i>} />
           <Option text={"Reply"} icon={<i className="fa-solid fa-reply"></i>} />
           <Option text={"Reaction"} icon={<i className="fa-solid fa-face-surprise"></i>} />
           <Option text={"Forward"} icon={<i className="fa-solid fa-share"></i>} />

           <hr className="border border-gray-7 my-1.5" />
           <Option text={"Copy text"} icon={<i className="fa-solid fa-copy"></i>} />
           <Option text={"Pin message"} icon={<i className="fa-solid fa-thumbtack"></i>} />

           <hr className="border border-gray-7 my-1.5" />
           <Option text={"Delete"} red={true} icon={<i className="fa-solid fa-trash"></i>} />

        </div>
    </div>
    )
}

function Option({text , icon , red}){
    return <div className={`flex group cursor-pointer items-center justify-between rounded-lg py-2 px-3 
                 ${red ? "hover:bg-red-500/10 text-red-300" : "hover:bg-indigo-500/20 text-gray-100"} 
                 transition duration-150`}>
  <span>{text}</span>
  <div className="opacity-80 group-hover:opacity-100">{icon}</div>
</div>
}