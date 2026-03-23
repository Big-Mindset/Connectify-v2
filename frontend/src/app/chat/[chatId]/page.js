
import ChatWindow from "@/components/chat-window";

export default async function ChatWindowPage({params}){
   let {chatId} = await params
    return <div className="hidden relative lg:block">
            <ChatWindow chatId={chatId} />
          </div>
}