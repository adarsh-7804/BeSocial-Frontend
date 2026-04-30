import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/userApi";
import { CiSearch } from "react-icons/ci";

// Thunks

export const registerUser = createAsyncThunk(
  "user/register",
  async (formData, thunkAPI) => {
    try {
      const response = await api.register(formData);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Your registration is failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "user/login",
  async ({ identifier, password }, thunkAPI) => {
    try {
      const response = await api.login({ identifier, password });
      // localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Login failed");
    }
  },
);

export const verifyLoginOtp = createAsyncThunk(
  "user/verify-login-otp",
  async (data, thunkAPI) => {
    try {
      const res = await api.verifyLoginOtp(data);
      localStorage.setItem("accessToken", res.data.accessToken);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPasswod",
  async ({ email }, thunkAPI) => {
    try {
      const response = await api.forgotPassword({ email });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Process failed",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ email, newPassword, resetPasswordOtp }, thunkAPI) => {
    try {
      const response = await api.resetPassword({
        email,
        resetPasswordOtp,
        newPassword,
      });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Reset password failed",
      );
    }
  },
);

export const getProfile = createAsyncThunk(
  "user/getProfile",
  async (_, thunkApi) => {
    try {
      const token = thunkApi.getState().user.token;

      const response = await api.getProfile();
      return response.data.user;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.message || "Failed to fetch user detail ",
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ currentPassword, newPassword }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;

      const response = await api.changePassword(
        { currentPassword, newPassword },
        token,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Password change failed",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "user/delete",
  async (_, thunkAPI) => {
    try {
      const response = await api.deleteUser();

      localStorage.removeItem("accessToken");

      return response.data;
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);

// export const deactivateUser = createAsyncThunk(
//   "user/deactivate",
//   async (_) => {
//     try{
//       const response = await api.deactivateUser();

//       localStorage.removeItem("token");

//       return response.data
//     } catch (err) {
//       return res.status(500).json({message: err.message})
//     }
//   },
// );

// SLice

export const deactivateUser = createAsyncThunk(
  "user/deactivate",
  async (_, thunkAPI) => {
    try {
      const response = await api.deactivateUser();

      console.log("Before remove:", localStorage.getItem("accessToken"));

      localStorage.removeItem("accessToken");

      console.log("After remove:", localStorage.getItem("accessToken"));

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const requestReactivation = createAsyncThunk(
  "user/requestReactivation",
  async ({ userId }, thunkAPI) => {
    try {
      const response = await api.requestReactivation({ userId });

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, thunkApi) => {
    try {
      const response = await api.updateProfile(data);
      return response.data.user;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.message || "Profile Update Fail",
      );
    }
  },
);

export const sendRequest = createAsyncThunk(
  "user/sendRequest",
  async (userId, thunkAPI) => {
    try {
      const res = await api.sendFriendRequest(userId);
      return { userId, data: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Request sended",
      );
    }
  },
);

export const acceptRequest = createAsyncThunk(
  "user/acceptRequest",
  async (userId, thunkAPI) => {
    try {
      const res = await api.acceptFriendRequest(userId);
      return { userId, data: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Request Accpeted",
      );
    }
  },
);

export const cancelRequest = createAsyncThunk(
  "user/cancelRequest",
  async (userId, thunkAPI) => {
    try {
      const res = await api.cancelFriendRequest(userId); 
      return { userId, data: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to cancel request",
      );
    }
  },
);

export const rejectRequest = createAsyncThunk(
  "user/rejectRequest",
  async (userId, thunkAPI) => {
    try {
      const res = await api.rejectFriendRequest(userId);
      return { userId, data: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Request Rejected",
      );
    }
  },
);

export const unfriend = createAsyncThunk(
  "user/unfriend",
  async (userId, thunkAPI) => {
    try {
      const res = await api.unfriendUser(userId);
      return { userId };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Unfreind Successfully",
      );
    }
  },
);

export const getMutualConnections = createAsyncThunk(
  "user/getMutualConnections",
  async (userId, thunkAPI) => {
    try {
      const res = await api.getMutualConnection(userId);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch mutual connection.",
      );
    }
  },
);

export const fetchSuggestions = createAsyncThunk(
  "user/fetchSuggestions",
  async () => {
    const res = await api.getSuggestions();
    return res.data;
  },
);

export const searchUserThunk = createAsyncThunk(
  "user/searchUser",
  async (query, thunkAPI) => {
    try {
      const res = await api.searchUser(query);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Search failed",
      );
    }
  },
);

export const fetchFriendRequests = createAsyncThunk(
  "user/fetchFriendRequests",
  async (_, thunkAPI) => {
    try {
      const res = await api.getProfile();
      return res.data.user.friendRequestsReceived;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch friend requests",
      );
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    // user: JSON.stringify(localStorage.getItem("user")) || null,
    user: (() => {
      try {
        const data = localStorage.getItem("user");
        if (!data || data === "undefined") return null;
        return JSON.parse(data);
      } catch (err) {
        return null;
      }
    })(),
    token: localStorage.getItem("accessToken") || null,
    loading: false,
    error: null,
    successMessage: null,
    mutualConnections: [],
    mutualCount: 0,
    mutualLoading: false,
    suggestions: [],
    searchResults: [],
    searchLoading: false,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    clearError(state) {
      state.error = null;
    },

    clearSuccessMessage(state) {
      state.successMessage = null;
    },

    // Handle real-time friend request cancellation from socket
    handleFriendRequestCancelled(state, action) {
      const cancelledById = action.payload.cancelledById;
      
      // Remove the cancelled user from friendRequestsReceived array
      if (state.user?.friendRequestsReceived) {
        state.user.friendRequestsReceived = state.user.friendRequestsReceived.filter(
          (id) =>
            (id._id ? id._id.toString() : id.toString()) !==
            cancelledById.toString(),
        );
      }
    },
  },

  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder

      // User Registration Section
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.status = "Success";
        // state.user = payload.user;
        // state.token = payload.token;
      })
      .addCase(registerUser.rejected, rejected);

    // User Login Section
    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        // state.user = payload.user;
        // state.token = payload.accessToken;
        // localStorage.setItem("accessToken", payload.accessToken);
        // localStorage.setItem("user", JSON.stringify(payload.user));
      })
      .addCase(loginUser.rejected, rejected);

    //Verifying login OTP
    builder
      .addCase(verifyLoginOtp.pending, pending)
      .addCase(verifyLoginOtp.fulfilled, (state, { payload }) => {
        state.loading = false;

        state.token = payload.accessToken;
        state.user = payload.user;

        localStorage.setItem("accessToken", payload.accessToken);
        localStorage.setItem("user", JSON.stringify(payload.user));

        // Now navbar will dispatch fetchFriendRequests() to get fresh notifications
      })
      .addCase(verifyLoginOtp.rejected, rejected);

    // User Forgot Password Section
    builder
      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload;
      })
      .addCase(forgotPassword.rejected, rejected);

    // User Reset Password Section
    builder
      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.message;
      })
      .addCase(resetPassword.rejected, rejected);

    // User Change Password Section
    builder
      .addCase(changePassword.pending, pending)
      .addCase(changePassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.successMessage;
      })
      .addCase(changePassword.rejected, rejected);

    // Profile Of The User.
    builder
      .addCase(getProfile.pending, pending)
      .addCase(getProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(getProfile.rejected, rejected);

    //Delete User
    builder
      .addCase(deleteUser.pending, pending)
      .addCase(deleteUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(deleteUser.rejected, rejected);

    //Deactivate User
    builder
      .addCase(deactivateUser.pending, pending)
      .addCase(deactivateUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(deactivateUser.rejected, rejected);

    //Update Profile
    builder
      .addCase(updateUserProfile.pending, pending)
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "Profile Updated Successfully";
      })
      .addCase(updateUserProfile.rejected, rejected);

    // Send Request
    builder
      .addCase(sendRequest.pending, pending)
      .addCase(sendRequest.fulfilled, (state, { payload }) => {
        // state.loading = false;
        const userId = payload.userId;

        if (!state.user.friendRequestsSent) {
          state.user.friendRequestsSent = [];
        }

        const alreadyExists = state.user.friendRequestsSent.some(
          (u) => (u._id || u).toString() === userId.toString(),
        );

        if (!alreadyExists) {
          // Look up full user object from suggestions (has firstName, lastName, avatar)
          const fullUser = state.suggestions?.find(
            (u) => u._id?.toString() === userId.toString(),
          ) || { _id: userId }; // fallback to bare ID if not found in suggestions

          state.user.friendRequestsSent.push(fullUser);
        }
      })
      .addCase(sendRequest.rejected, rejected);

    // Cancel Requuest
    builder
      .addCase(cancelRequest.pending, pending)
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const userId = action.payload.userId;
        state.loading = false;

        // Remove from friendRequestsSent array
        if (state.user?.friendRequestsSent) {
          state.user.friendRequestsSent = state.user.friendRequestsSent.filter(
            (id) =>
              (id._id ? id._id.toString() : id.toString()) !==
              userId.toString(),
          );
        }
      })
      .addCase(cancelRequest.rejected, rejected);

    // Accept Request
    builder
      .addCase(acceptRequest.pending, pending)
      .addCase(acceptRequest.fulfilled, (state, action) => {
        const acceptedUserId = action.meta.arg;

        // remove from requests
        state.user.friendRequestsReceived =
          state.user.friendRequestsReceived.filter(
            (user) => user._id.toString() !== acceptedUserId.toString(),
          );

        // add to friends
        if (!state.user.friends) {
          state.user.friends = [];
        }

        if (
          !state.user.friends.some(
            (id) => id.toString() === acceptedUserId.toString(),
          )
        ) {
          state.user.friends.push(acceptedUserId);
        }
      })
      .addCase(acceptRequest.rejected, rejected);

    // Reject Request
    builder
      .addCase(rejectRequest.pending, pending)

      .addCase(rejectRequest.fulfilled, (state, action) => {
        const userId = action.meta.arg;

        state.user.friendRequestsReceived =
          state.user.friendRequestsReceived?.filter((id) =>
            id._id
              ? id._id.toString() !== userId.toString()
              : id.toString() !== userId.toString(),
          );

        state.user.friendRequestsSent = state.user.friendRequestsSent?.filter(
          (id) =>
            id._id
              ? id._id.toString() !== userId.toString()
              : id.toString() !== userId.toString(),
        );
      })
      .addCase(rejectRequest.rejected, rejected);

    // Unfriend User
    builder
      .addCase(unfriend.pending, pending)
      .addCase(unfriend.fulfilled, (state, { payload }) => {
        const userId = payload.userId;
        state.user.friends = state.user.friends?.filter(
          (friend) =>
            (friend._id ? friend._id.toString() : friend.toString()) !==
            userId.toString(),
        );
      })
      .addCase(unfriend.rejected, rejected);

    // Get MutualConnection List
    builder
      .addCase(getMutualConnections.pending, (state) => {
        state.mutualLoading = true;
        state.mutualConnections = [];
        state.mutualCount = 0;
      })
      .addCase(getMutualConnections.fulfilled, (state, action) => {
        state.mutualLoading = false;
        state.mutualConnections = action.payload.mutualConnections;
        state.mutualCount = action.payload.count;
      })
      .addCase(getMutualConnections.rejected, (state, action) => {
        state.mutualLoading = false;
        state.error = action.payload;
      });

    // Suggested User
    builder.addCase(fetchSuggestions.fulfilled, (state, action) => {
      state.suggestions = action.payload;
    });

    //Searching User
    builder
      .addCase(searchUserThunk.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchUserThunk.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUserThunk.rejected, (state) => {
        state.searchLoading = false;
      });

    //Fetch Friend Request
    builder
      .addCase(fetchFriendRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.friendRequestsReceived = action.payload;
        }
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectUser = (state) => state.user.user;

export const selectAuthLoading = (state) => state.user.loading;

export const selectAuthError = (state) => state.user.error;

export const selectIsAuthenticated = (state) => !!state.user.token;

export const selectSuccessMessage = (state) => state.user.successMessage;

export const { logout, clearError, clearSuccessMessage, handleFriendRequestCancelled } = userSlice.actions;

export default userSlice.reducer;
