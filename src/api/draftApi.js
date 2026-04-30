import axios from "axios";
import API from "./axios";

// const API = axios.create({
//     baseURL: "http://localhost:5000/api/draft",
//     withCredentials: true
// })

// INTERCEPTOR

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("accessToken");

    if(token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
})

export const fetchDrafts = () =>
  API.get("/draft/", {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

export const saveDraft = (formData) => 
    API.post("/draft/save" , formData,{
        headers:{"Content-Type" : "multipart/form-data"},
    });

export const deleteDraft = (draftId) => 
    API.delete(`/draft/${draftId}`)


export const publishDraft = (draftId) => API.post(`/draft/${draftId}/publish`);