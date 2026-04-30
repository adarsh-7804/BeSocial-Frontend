import axios from "axios";
import API from "./axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/highlights",
//   withCredentials: true,
// });

// Interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Create Highlight
export const createHighlight = (title, description = "", coverImage = "") =>
  API.post("/highlights/", { title, description, coverImage });

// Get All User Highlights
export const getHighlights = () => API.get("/highlights/");

// Get Single Highlight
export const getSingleHighlight = (highlightId) =>
  API.get(`/highlights/${highlightId}`);

// Add Story to Highlight
export const addStoryToHighlight = (highlightId, storyId) =>
  API.post(`/highlights/${highlightId}/add-story`, { storyId });

// Remove Story from Highlight
export const removeStoryFromHighlight = (highlightId, storyId) =>
  API.delete(`/highlights/${highlightId}/remove-story/${storyId}`);

// Update Highlight
export const updateHighlight = (highlightId, title, description, coverImage, isPublic) =>
  API.put(`/highlights/${highlightId}`, { title, description, coverImage, isPublic });

// Delete Highlight
export const deleteHighlight = (highlightId) =>
  API.delete(`/highlights/${highlightId}`);