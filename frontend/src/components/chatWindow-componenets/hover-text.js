export default function HoverText({groups , text}){
    return   <div className={`
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2 py-1 text-[0.8rem]
        border border-gray-7 bg-gray-6 rounded-lg
        invisible opacity-0
        ${groups}
        transition-all duration-150
        pointer-events-none
    
        before:content-['']
        before:absolute
        before:top-full
        before:left-1/2
        before:-translate-x-1/2
        before:border-8
        before:border-transparent
        before:border-t-gray-6
      `}>
                                        {text}
                                    </div>
}