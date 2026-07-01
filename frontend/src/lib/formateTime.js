import { TruckElectric } from "lucide-react";

let within24Hours = (datetime)=>{
   let today = new Date()
  return today.getFullYear() === datetime.getFullYear() && today.getMonth() === datetime.getMonth() && today.getDate() === datetime.getDate()

}
let isYesturday = (datetime)=>{
    let yestruday = new Date()
    yestruday.setDate(yestruday.getDate() - 1)
     return  yestruday.getFullYear() === datetime.getFullYear() && yestruday.getMonth() === datetime.getMonth() && yestruday.getDate() === datetime.getDate()


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

