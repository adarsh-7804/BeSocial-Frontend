import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/stories",
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

// Create Story
export const createStory = (formdata) => 
  API.post("/create", formdata, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get Stories Feed
export const getStories = () => API.get("/");

// Get User's Stories
export const getUserStories = (userId) => API.get(`/user/${userId}`);

// Mark Story as Viewed
export const viewStory = (storyId) => API.put(`/${storyId}/view`);

// Get Story Viewers
export const getStoryViewers = (storyId) => API.get(`/${storyId}/viewers`);

// Delete Story
export const deleteStory = (storyId) => API.delete(`/${storyId}`);

// Like Story
export const likeStory = (storyId, reactionType = "like") =>
  API.post(`/${storyId}/like`, { reactionType });

// Unlike Story
export const unlikeStory = (storyId) => API.delete(`/${storyId}/like`);

// Reply to Story
export const replyToStory = (storyId, text) =>
  API.post(`/${storyId}/reply`, { text });

// Get Story Replies
export const getStoryReplies = (storyId) => API.get(`/${storyId}/replies`);

// Delete Reply
export const deleteReply = (storyId, replyId) =>
  API.delete(`/${storyId}/reply/${replyId}`);

// Mute User Stories
export const muteUserStories = (userId) =>
  API.post(`/mute/${userId}`);

// Unmute User Stories
export const unmuteUserStories = (userId) =>
  API.delete(`/mute/${userId}`);