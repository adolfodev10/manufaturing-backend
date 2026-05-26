import axios from "axios";

const localUrl = "http://localhost:3300"
// const apiUrl = "https://manufaturing-backend.onrender.com";

export const api = axios.create({
    // baseURL: apiUrl,
    baseURL: localUrl,
    withCredentials: true
})