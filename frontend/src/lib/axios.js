import axios from 'axios';

export const axiosInstance = axios.create({
    // Base URL for the API
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:9000/api" : "/api",
    withCredentials: true
})