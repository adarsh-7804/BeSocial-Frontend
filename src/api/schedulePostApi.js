import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/scheduled-posts`,
    withCredentials: true
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const fetchScheduledPosts = () => API.get("/");

export const schedulePost = (formData) => API.post("/schedule", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

export const updateScheduledPost = (id, formData) => API.put(`/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

export const cancelScheduledPost = (id) => API.delete(`/${id}`);