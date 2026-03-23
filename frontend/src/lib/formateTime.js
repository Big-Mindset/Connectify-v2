let within24Hours = (datetime)=>{
    const date = new Date(datetime);
    let diff = new Date() - date
    let within = diff / (1000 * 60 * 60)
    return within <=24
}
export const formateTime = (datetime)=>{
    if (!datetime) return null
 let time = datetime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

if (within24Hours(datetime)){
    return  time
}else{
    let month =  new Date(datetime).getMonth()
    let date = new Date(datetime).getDate()
    return  `${date}/${month} ${time}`
}

}

