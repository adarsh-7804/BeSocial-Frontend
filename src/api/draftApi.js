import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/draft",
    withCredentials: true
})

// INTERCEPTOR

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("accessToken");

    if(token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
})

export const fetchDrafts = () =>
  API.get("/", {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

export const saveDraft = (formData) => 
    API.post("/save" , formData,{
        headers:{"Content-Type" : "multipart/form-data"},
    });

export const deleteDraft = (draftId) => 
    API.delete(`/${draftId}`)


export const publishDraft = (draftId) => API.post(`/${draftId}/publish`);