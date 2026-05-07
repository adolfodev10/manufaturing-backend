import axios from "axios";

const apiUrl =  "http://localhost:3300";

export const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true
})