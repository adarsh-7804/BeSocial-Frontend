  import axios from "axios";
  import API from "./axios";

  // const API = axios.create({
  //   baseURL: "http://localhost:5000/api/auth",
  //   withCredentials: true,
  // });  

  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });


  // Register
  export const register = (formData) =>
    API.post("/auth/user/register", formData);

  // Check Email
  export const checkEmail = (email) =>
    API.post("/auth/user/check-email", { email });

  // Login
  export const login = ({ identifier, password }) =>
    API.post("/auth/user/login", { identifier, password });

  // Verify OTP
  export const verifyLoginOtp = (data) =>
    API.post("/auth/user/verify-login-otp", data);

  // Forgot Password
  export const forgotPassword = ({ email }) =>
    API.post("/auth/user/send-otp", { email });

  // Reset Password
  export const resetPassword = (data) =>
    API.post("/auth/user/reset-pass", data);

  // Change Password
  export const changePassword = (data) =>
    API.post("/auth/user/change-password", data);

  // Get Profile
  export const getProfile = () =>
    API.get("/auth/user/profile");

  //  Update Profile
  export const updateProfile = (data) =>
    API.put("/auth/user/update-profile-data", data);

  // Delete User
  export const deleteUser = () =>
    API.delete("/auth/user/delete");

  // Deactivate User
  export const deactivateUser = () =>
    API.patch("/auth/user/deactivate");

  // Reactivation
  export const requestReactivation = (data) =>
    API.post("/auth/user/request-reactivation", data);

  //Email Verification OTP
  export const sendVerifyOtp = (email) =>
    API.post("/auth/user/send-verify-otp", { email });

  // Verify Email OTP
  export const verifyEmailOtp = (email, otp) =>
    API.post("/auth/user/verify-email", {
      email,
      resetPasswordOtp: otp,
    });


  // ALL  FREIND REQUEST API


  export const sendFriendRequest = (userId) => 
    API.post(`/auth/user/friend-request/${userId}`);

  export const acceptFriendRequest = (userId) => 
    API.post(`/auth/user/accept-request/${userId}`);

  export const rejectFriendRequest = (userId) => 
    API.post(`/auth/user/reject-request/${userId}`);

  export const unfriendUser = (userId) => 
    API.post(`/auth/user/unfriend/${userId}`);


  // Follow User

  export const followUser  = (userId) => 
    API.post(`/auth/user/follow/${userId}`)

  // Cnacel request

  export const cancelFriendRequest = (userId) => 
  API.post(`/auth/user/cancel-request/${userId}`);


  // UNFOLLOW USER

  export const unfollowUser = (userId) => 
    API.post(`/auth/user/unfollow/${userId}`)

  //User By ID

  export const getUserById = (userId) =>
    API.get(`/auth/user/${userId}`);

  // GET MUTUAL CONNECTION

  export const getMutualConnection = (userId) => 
    API.get(`/auth/user/mutual/${userId}`);

  // Get Suggestion 

  export const getSuggestions = () =>{
    return API.get("/auth/user/suggestion");
    }

  // Search User API 

  export const searchUser = (query) => {
    return API.get(`/auth/user/search?query=${query}`)
  }

  // Refer A Friend

    export const sendInvite = (toEmail) => {
      return API.post("/auth/user/invite", { toEmail });
      }

    