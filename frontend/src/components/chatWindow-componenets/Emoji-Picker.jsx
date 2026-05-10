import { chatMessageStore } from '@/store/chatMessage-store'
import { messageSettingsStore } from '@/store/messageSettings-store'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
export default function EmojiPicker({ setInputText, setOpenEmojiPicker , perLine , previewPosition , emojiSize , emojiButtonRadius , reaction }) {
  let handleReaction = chatMessageStore(s=>s.handleReaction)
  const handleEmojiSelect = (emoji) => {
    if (reaction){
      handleReaction(emoji)
    return
    }
    setInputText(prev => prev += emoji.native)

  }
  return <div


    className='z-[2000] relative'>
    <Picker
      
      onClickOutside={() => {
        setOpenEmojiPicker(prev => {
          if (prev === 1) {
            return 2
          }
          if (prev === 2) {
            return 0
          }
        })

      }}
      emojiSize={emojiSize || 30}
perLine={perLine}
emojiButtonRadius={emojiButtonRadius}
  skinTonePosition={"none"}
       previewPosition={previewPosition}
      data={data}
      onEmojiSelect={handleEmojiSelect}
    // set="google"
    />
  </div>
}