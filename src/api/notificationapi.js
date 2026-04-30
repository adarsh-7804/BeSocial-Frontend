import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/notifications", 
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const fetchNotifications = () => API.get("/");

export const fetchMessageNotifications = () => API.get("/messages");

export const markNotificationRead = (id) =>
  API.patch(`/${id}/read`);

export const markAllNotificationsRead = () =>
  API.patch("/read-all");

export const deleteNotification = (id) =>
  API.delete(`/${id}`);