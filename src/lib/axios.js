import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: "https://backendsocial-1.onrender.com",
    withCredentials: true,
});