import axios from "axios";
import { env } from "process";

// const localUrl = env.LOCAL_URL
const apiUrl = env.API_URL;

export const api = axios.create({
    baseURL: apiUrl,
    // baseURL: localUrl,
    withCredentials: true
})