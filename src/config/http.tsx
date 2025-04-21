//configuring axios to send localStorage.getItem("token") in the headers of every request
import axios from "axios";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
    },
});