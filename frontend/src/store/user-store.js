const { create } = require("zustand");

export const userStore = create((set , get)=>({
    session : null,
    setSession : (session)=>set({session})
}))