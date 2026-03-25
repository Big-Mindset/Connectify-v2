import data from '@emoji-mart/data'
import  Picker  from '@emoji-mart/react'
export default function EmojiPicker({setInputText , setOpenEmojiPicker}) {
    const handleEmojiSelect = (emoji)=>{
        setInputText(prev=>prev+=emoji.native)
    }
    return <div
              

    className=''>
        <Picker
        onClickOutside={()=>{
            console.log("hello")
        setOpenEmojiPicker(prev=>{
            console.log(prev)
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