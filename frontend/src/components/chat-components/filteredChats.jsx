export default function FilteredChats({name , selectedChat}){
    return (
        <div className={`px-4 ${selectedChat === name ? "bg-indigo-700" : "hover:bg-indigo-700/70  bg-indigo-600/20" } py-1 cursor-pointer   rounded-lg`}>
            {name}
        </div>
    )
}