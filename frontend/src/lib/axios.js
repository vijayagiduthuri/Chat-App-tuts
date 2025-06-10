import axios from 'axios';

export const axiosInstance = axios.create({
    // Base URL for the API
    baseURL : "http://localhost:9000/api",
    withCredentials: true
})