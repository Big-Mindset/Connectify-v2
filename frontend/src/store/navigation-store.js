import { create } from "zustand";

export const navigationStore = create((set ,get)=>({
    selectedPage : "main",
    setSelectedPage : (selectedPage)=>set({selectedPage}),
    searchTab : false,
    setSearchTab : (searchTab)=>set({searchTab}),
    filters : {},
    setFilters : (func)=>set((state)=>({filters : func(state.filters)})),
      
    
}))