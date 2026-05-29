
import { messageSettingsStore } from '@/store/messageSettings-store'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
export default function EmojiPicker({ setInputText, setOpenEmojiPicker , perLine , previewPosition , emojiSize , emojiButtonRadius , reactions }) {
  let handleReactionFunc = messageSettingsStore(s=>s.handleReactionFunc)
  let reactMessage = messageSettingsStore(s=>s.reactMessage)
  const handleEmojiSelect = (emoji) => {
    if (reactions){
      let reaction = reactions.find((reaction)=>reaction.emoji === emoji.native)
      if (reaction) {
        handleReactionFunc(reaction,reactMessage?.id)
      }else{
        handleReactionFunc(reaction,reactMessage?.id , {native : emoji.native , name : emoji.name})

      }
    return
    }
    setInputText(prev => prev += emoji.native)

  }
  return <div


    className='z-[2000] relative'>
    <Picker
      
      onClickOutside={() => {
        if (setOpenEmojiPicker){

          setOpenEmojiPicker(prev => {
            if (prev === 1) {
              return 2
            }
            if (prev === 2) {
              return 0
            }
          })
        }
          
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