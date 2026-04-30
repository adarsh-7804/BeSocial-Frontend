import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";

import * as api from "../api/notificationapi";

export const fetchNotifications = createAsyncThunk(
  "notification/fetch",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await api.fetchNotifications(token);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const fetchMessageNotifications = createAsyncThunk(
  "notification/fetchMessages",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await api.fetchMessageNotifications(token);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notification/markRead",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await api.markNotificationRead(id, token);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);
export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllRead",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await api.markAllNotificationsRead(token);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);
export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await api.deleteNotification(id, token);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    messageNotifications: [],
    unreadCount: 0,
    unreadMessageCount: 0,
    loading: false,
    messageLoading: false,
    error: null,
  },
  reducers: {
    addMessageNotification: (state, action) => {
      // Add new message notification to the front of the list
      state.messageNotifications.unshift(action.payload);
      state.unreadMessageCount += 1;
    },
    markMessageNotificationRead: (state, action) => {
      const notification = state.messageNotifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadMessageCount = Math.max(0, state.unreadMessageCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetching all notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.notifications = payload.notifications;
        state.unreadCount = payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // Fetching message notifications
    builder
      .addCase(fetchMessageNotifications.pending, (state) => {
        state.messageLoading = true;
      })
      .addCase(fetchMessageNotifications.fulfilled, (state, { payload }) => {
        state.messageLoading = false;
        state.messageNotifications = payload.notifications;
        state.unreadMessageCount = payload.unreadCount;
      })
      .addCase(fetchMessageNotifications.rejected, (state, { payload }) => {
        state.messageLoading = false;
        state.error = payload;
      });

    // Mark one read
    builder
      .addCase(markNotificationRead.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, { payload }) => {
        const n = state.notifications.find((n) => n._id === payload);
        if (n && !n.read) {
          n.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // Mark all read
    builder
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.read = true));
        state.messageNotifications.forEach((n) => (n.read = true));
        state.unreadCount = 0;
        state.unreadMessageCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // Delete
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(deleteNotification.fulfilled, (state, { payload }) => {
        const removed = state.notifications.find((n) => n._id === payload);
        if (removed && !removed.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n._id !== payload,
        );
      })
      .addCase(deleteNotification.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

// export const selectNotifications = (state) => state.notifications.notifications ?? [];

const selectNotificationState = (state) => state.notifications;

export const selectNotifications = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.notifications || []
);

export const selectMessageNotifications = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.messageNotifications || []
);

export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectUnreadMessageCount = (state) => state.notifications.unreadMessageCount;
export const selectNotificationsLoading = (state) =>
  state.notifications.loading;

export const { addMessageNotification, markMessageNotificationRead } = notificationSlice.actions;

export default notificationSlice.reducer;
