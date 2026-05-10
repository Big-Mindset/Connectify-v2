import { create } from "zustand";


export let mediaStore = create((set, get) => ({
    selectedMedia: null,
    setSelectedMedia: (func)=>{
        set((state)=>({selectedMedia : func(state.selectedMedia)}))
    },
}))