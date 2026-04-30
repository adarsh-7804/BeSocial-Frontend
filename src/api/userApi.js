  import axios from "axios";

  const API = axios.create({
    baseURL: "http://localhost:5000/api/auth",
    withCredentials: true,
  });

  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });


  // Register
  export const register = (formData) =>
    API.post("/user/register", formData);

  // Check Email
  export const checkEmail = (email) =>
    API.post("/user/check-email", { email });

  // Login
  export const login = ({ identifier, password }) =>
    API.post("/user/login", { identifier, password });

  // Verify OTP
  export const verifyLoginOtp = (data) =>
    API.post("/user/verify-login-otp", data);

  // Forgot Password
  export const forgotPassword = ({ email }) =>
    API.post("/user/send-otp", { email });

  // Reset Password
  export const resetPassword = (data) =>
    API.post("/user/reset-pass", data);

  // Change Password
  export const changePassword = (data) =>
    API.post("/user/change-password", data);

  // Get Profile
  export const getProfile = () =>
    API.get("/user/profile");

  //  Update Profile
  export const updateProfile = (data) =>
    API.put("/user/update-profile-data", data);

  // Delete User
  export const deleteUser = () =>
    API.delete("/user/delete");

  // Deactivate User
  export const deactivateUser = () =>
    API.patch("/user/deactivate");

  // Reactivation
  export const requestReactivation = (data) =>
    API.post("/user/request-reactivation", data);

  //Email Verification OTP
  export const sendVerifyOtp = (email) =>
    API.post("/user/send-verify-otp", { email });

  // Verify Email OTP
  export const verifyEmailOtp = (email, otp) =>
    API.post("/user/verify-email", {
      email,
      resetPasswordOtp: otp,
    });


  // ALL  FREIND REQUEST API


  export const sendFriendRequest = (userId) => 
    API.post(`/user/friend-request/${userId}`);

  export const acceptFriendRequest = (userId) => 
    API.post(`/user/accept-request/${userId}`);

  export const rejectFriendRequest = (userId) => 
    API.post(`/user/reject-request/${userId}`);

  export const unfriendUser = (userId) => 
    API.post(`/user/unfriend/${userId}`);


  // Follow User

  export const followUser  = (userId) => 
    API.post(`/user/follow/${userId}`)

  // Cnacel request

  export const cancelFriendRequest = (userId) => 
  API.post(`/user/cancel-request/${userId}`);


  // UNFOLLOW USER

  export const unfollowUser = (userId) => 
    API.post(`/user/unfollow/${userId}`)

  //User By ID

  export const getUserById = (userId) =>
    API.get(`/user/${userId}`);

  // GET MUTUAL CONNECTION

  export const getMutualConnection = (userId) => 
    API.get(`/user/mutual/${userId}`);

  // Get Suggestion 

  export const getSuggestions = () =>{
    return API.get("/user/suggestion");
    }

  // Search User API 

  export const searchUser = (query) => {
    return API.get(`/user/search?query=${query}`)
  }

  // Refer A Friend

    export const sendInvite = (toEmail) => {
      return API.post("/user/invite", { toEmail });
      }

    