const { create } = require("zustand");

export const userStore = create((set , get)=>({
    session : null,
    setSession : (session)=>set({session}),
    allFriends : [],
    setAllFriends : ((func)=>{
        set(state=>({allFriends : func(state.allFriends)}))
    }),
    pendingRequest : [],
    setPendingRequest : ((func)=>{
        set(state=>({pendingRequest : func(state.pendingRequest)}))
    }),
    onlineUsers : [],
    setOnlineUsers : ((func)=>{
        set(state=>({onlineUsers : func(state.onlineUsers)}))
    })
}))