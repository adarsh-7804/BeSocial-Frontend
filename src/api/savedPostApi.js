import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/save`,
  withCredentials: true,
});

// Interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const fetchSavedPosts = () => API.get("/saved");

export const savePost = (postId) => API.post(`/${postId}`);

export const unsavePost = (postId) => API.delete(`/${postId}`);

export const checkSavedStatus = (postId) => API.get(`/check/${postId}`);