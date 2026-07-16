export let messageStatus = (status , totalMembers)=>{
        let delivered = 0
        let read = 0
        
        if (status === "PENDING"){
                 return null
        }
        if (status === "FAILED"){
            return "failed"
        }
        if (Array.isArray(status) && !status.length){
            return "sent"
        }
        status?.forEach((st)=>{
             if(st.status === "DELIVERED"){
                delivered+=1
            }else if (st.status === "READ"){
                read+=1
                delivered+=1

            }
        })
        if (read === totalMembers) return "read"
        if (delivered === totalMembers) return "delivered"
        return "sent"
    }