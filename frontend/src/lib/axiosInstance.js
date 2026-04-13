

import axios from "axios"
import { redirect } from "next/navigation";
export const Axios = axios.create({
  baseURL: 'http://localhost:2525',
  withCredentials : true,
});
Axios.interceptors.response.use(undefined , async (error)=>{
    if (error.response.statusCode === 401){
        redirect("/login")
    }
} )
