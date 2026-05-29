export let messageStatus = (status)=>{
        let delivered = 0
        let read = 0
        
        if (status === "PENDING"){
                 return null
        }
        if (Array.isArray(status) && !status.length){
            return "sent"
        }
        status?.forEach((st)=>{
             if(st.status === "DELIVERED"){
                delivered+=1
            }else if (st.status === "READ"){
                read+=1
            }
        })
         if (delivered > read){
            return "delivered"
        }else if (read > delivered){
            return "read"
        }
    }