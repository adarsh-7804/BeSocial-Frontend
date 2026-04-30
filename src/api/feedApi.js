import API from "./postsApi"; 

export const fetchFeedApi = (type, page = 1) =>
  API.get(`/posts?type=${type}&page=${page}&limit=10`);

