let within24Hours = (datetime)=>{
    const date = new Date(datetime);
    let diff = new Date() - date
    let within = diff / (1000 * 60 * 60)
    return within <=24
}
let isYesturday = (datetime)=>{
     const date = new Date(datetime);
    let diff = new Date() - date
    let within = diff / (1000 * 60 * 60)
    return within <=48
}
export const formateTime = (datetime)=>{
    if (!datetime) return null
    datetime= new Date(datetime)
 let time = datetime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

if (within24Hours(datetime) ){
    return  time
}else{
    if (isYesturday(datetime)){
    return  `Yesturday at ${time}`
    }
    let month =  new Date(datetime).getMonth()
    let date = new Date(datetime).getDate()
    return  `${date}/${month} ${time}`
}

}

