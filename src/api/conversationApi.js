import axios from "axios";
import API from "./axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getConversations = () =>
  API.get("/");

export const getArchivedConversations = () =>
  API.get("/conversation/archived");

export const muteConversation = (conversationId) =>
  API.post("/conversation/mute", { conversationId });

export const unmuteConversation = (conversationId) =>
  API.post("/conversation/unmute", { conversationId });

export const archiveConversation = (conversationId) =>
  API.post("/conversation/archive", { conversationId });

export const unarchiveConversation = (conversationId) =>
  API.post("/conversation/unarchive", { conversationId });