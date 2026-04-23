import { create } from "zustand";

export const navigationStore = create((set ,get)=>({
    selectedPage : "main",
    setSelectedPage : (selectedPage)=>set({selectedPage})
}))