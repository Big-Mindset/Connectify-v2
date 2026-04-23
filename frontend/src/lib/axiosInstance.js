

import axios from "axios"
import { redirect } from "next/navigation";
export const Axios = axios.create({
  baseURL: 'http://localhost:2525',
  withCredentials : true,
});
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirect("/login");
    }

    return Promise.reject(error); // 🔥 VERY IMPORTANT
  }
);