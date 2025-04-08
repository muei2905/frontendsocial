import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "https://backendsocial-1.onrender.com" : "/api",
    withCredentials: true,

});