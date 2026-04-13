export let validate_user = (user)=>{
 if (!user && user.id === null){
       throw new Error("Unauthorized")
    }
}