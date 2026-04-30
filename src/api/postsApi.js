import axios from "axios";


export const BASE_API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

BASE_API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const markNotInterested = (postId) =>
  BASE_API.post(`/not-interested/${postId}`);

export const undoNotInterested = (postId) =>
  BASE_API.delete(`/not-interested/${postId}`);
 
const API = axios.create({
  baseURL: "http://localhost:5000/api/posts",
  withCredentials: true,
});


//INTERCEPTOR
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const fetchPosts = async () => {
  const res = await API.get("/");
  return res.data;
};

export const createPost = (postData) => API.post("/create", postData);

export const votePoll = (postId, optionIndex) =>
  API.post("/vote", { postId, optionIndex });

export const fetchPollVoters = (postId, optionIndex) =>
  API.get(`/${postId}/poll/${optionIndex}/voters`);

export const deletePost = (postId) => API.delete(`/delete/${postId}`);

export const toggleLike = (postId) => API.put(`/${postId}/like`);

export const addComment = (postId, text) =>
  API.post(`/${postId}/comment`, { text });

export const replyComment = (commentId, text) =>
  API.post(`/comment/${commentId}/reply`, { text });

export const fetchUserPosts = async (userId) => {
  const res = await API.get(`/user/${userId}`);
  return res.data;
};
export const fetchPostById = async (postId) => {
  const res = await API.get(`/${postId}`);
  return res.data;
};

export const reactToPost = (postId, type = "like") =>
  API.put(`/${postId}/react`, { type });

export const deleteComment = (commentId) => 
  API.delete(`/comment/${commentId}`);

export const deleteReply = (commentId, replyId) => 
  API.delete(`/comment/${commentId}/reply/${replyId}`);

export const sharePost = (postId) => {
  return API.post(`/${postId}/share/`)
}

export const fetchReactions = (postId) =>
  API.get(`/${postId}/reactions`);

export const incrementViewCount = (postId) =>
  API.put(`/${postId}/view`);

export const pinPost = (postId) =>
  API.put(`/${postId}/pin`);

export const unpinPost = (postId) =>
  API.put(`/${postId}/unpin`);

export default API;