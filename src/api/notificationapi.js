import axios from "axios";
import API from "./axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/notifications", 
//   withCredentials: true,
// });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const fetchNotifications = () => API.get("/notifications/");

export const fetchMessageNotifications = () => API.get("/notifications/messages");

export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  API.patch("/notifications/read-all");

export const deleteNotification = (id) =>
  API.delete(`/notifications/${id}`);