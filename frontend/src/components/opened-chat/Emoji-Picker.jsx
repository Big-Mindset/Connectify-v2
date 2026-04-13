import data from '@emoji-mart/data'
import  Picker  from '@emoji-mart/react'
export default function EmojiPicker({setInputText , setOpenEmojiPicker}) {
    const handleEmojiSelect = (emoji)=>{
      console.log(emoji)
        setInputText(prev=>prev+=emoji.native)
    }
    return <div
              

    className=''>
        <Picker
        onClickOutside={()=>{
        setOpenEmojiPicker(prev=>{
          if (prev === 1){
            return 2
          }
          if (prev === 2){
            return 0
          }
        })

        }}
         data={data} 
         onEmojiSelect={handleEmojiSelect}
         
         />
    </div>
}