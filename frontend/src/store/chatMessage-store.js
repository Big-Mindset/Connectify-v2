import {create} from "zustand"

export let chatMessageStore = create((set , get)=>({
    selectedMedia : null,
    setSelectedMedia : (media)=> set({selectedMedia :media })
    
}))