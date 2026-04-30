import axios from "axios";
import API from "./axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/stories",
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

// Create Story
export const createStory = (formdata) => 
  API.post("/stories/create", formdata, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get Stories Feed
export const getStories = () => API.get("/stories/");

// Get User's Stories
export const getUserStories = (userId) => API.get(`/stories/user/${userId}`);

// Mark Story as Viewed
export const viewStory = (storyId) => API.put(`/stories/${storyId}/view`);

// Get Story Viewers
export const getStoryViewers = (storyId) => API.get(`/stories/${storyId}/viewers`);

// Delete Story
export const deleteStory = (storyId) => API.delete(`/stories/${storyId}`);

// Like Story
export const likeStory = (storyId, reactionType = "like") =>
  API.post(`/stories/${storyId}/like`, { reactionType });

// Unlike Story
export const unlikeStory = (storyId) => API.delete(`/stories/${storyId}/like`);

// Reply to Story
export const replyToStory = (storyId, text) =>
  API.post(`/stories/${storyId}/reply`, { text });

// Get Story Replies
export const getStoryReplies = (storyId) => API.get(`/stories/${storyId}/replies`);

// Delete Reply
export const deleteReply = (storyId, replyId) =>
  API.delete(`/stories/${storyId}/reply/${replyId}`);

// Mute User Stories
export const muteUserStories = (userId) =>
  API.post(`/stories/mute/${userId}`);

// Unmute User Stories
export const unmuteUserStories = (userId) =>
  API.delete(`/stories/mute/${userId}`);