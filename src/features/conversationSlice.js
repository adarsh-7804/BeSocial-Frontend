import {
  createSlice,
  createAsyncThunk,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL;

export const getOrCreateConversation = createAsyncThunk(
  "conversation/getOrCreate",
  async (receiverId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/conversation`,
        { receiverId },
        { withCredentials: true },
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchConversations = createAsyncThunk(
  "conversation/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/conversation`, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const createGroupConversation = createAsyncThunk(
  "conversation/createGroup",
  async ({ groupName, participantsIds }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/conversation/group`,
        { groupName, participantsId: participantsIds },
        {
          withCredentials: true,
        },
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const updateGroupName = createAsyncThunk(
  "conversation/updateGroupName",
  async ({ conversationId, newGroupName }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE}/conversation/update-group-name`,
        {
          conversationId,
          newGroupName,
        },
        { withCredentials: true },
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const removeMemberFromGroup = createAsyncThunk(
  "conversation/removeMember",
  async ({ conversationId, memberIdToRemove }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/conversation/remove-member`,
        {
          conversationId,
          memberIdToRemove,
        },
        { withCredentials: true },
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const searchConversations = createAsyncThunk(
  "conversation/search",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE}/conversation/search?q=${query}`,
        {
          withCredentials: true,
        },
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchArchivedConversations = createAsyncThunk(
  "conversation/fetchArchived",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/conversation/archived`, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const updateGroupProfilePic = createAsyncThunk(
  "conversation/updateGroupProfilePic",
  async ({ conversationId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("groupProfilePic", file);

      const { data } = await axios.put(
        `${BASE}/conversation/update-group-profile-pic`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    list: [],
    archivedList: [],
    searchResults: [],
    active: null,
    loading: false,
    error: false,
    isSearching: false,
    userStatuses: {},
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.active = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
    groupCreated: (state, action) => {
      const exists = state.list.find((c) => c._id === action.payload._id);
      if (!exists) state.list.unshift(action.payload);
    },
    updateLastMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const conv = state.list.find((c) => c._id === conversationId);
      if (conv) {
        conv.lastMessage = message;
      }
    },
    updateUserStatus: (state, action) => {
      const { userId, status, lastSeen, timestamp } = action.payload;
      const userIdStr = userId?.toString?.() || userId;

      state.userStatuses[userIdStr] = {
        status,
        lastSeen: lastSeen || timestamp || new Date().toISOString(),
      };

      // Update status in all conversations where this user is a participant
      state.list.forEach((conv) => {
        if (conv.isGroup && conv.participants) {
          const participant = conv.participants.find(
            (p) => (p._id?.toString?.() || p._id) === userIdStr,
          );
          if (participant) {
            participant.onlineStatus = status;
            if (lastSeen) participant.lastSeen = lastSeen;
          }
        } else if (!conv.isGroup) {
          // For 1-on-1 conversations
          const otherParticipant = conv.participants?.find(
            (p) => (p._id?.toString?.() || p._id) === userIdStr,
          );
          if (otherParticipant) {
            otherParticipant.onlineStatus = status;
            if (lastSeen) otherParticipant.lastSeen = lastSeen;
          }
        }
      });

      // Update active conversation participants if applicable
      if (state.active) {
        if (state.active.isGroup && state.active.participants) {
          const participant = state.active.participants.find(
            (p) => (p._id?.toString?.() || p._id) === userIdStr,
          );
          if (participant) {
            participant.onlineStatus = status;
            if (lastSeen) participant.lastSeen = lastSeen;
          }
        } else if (!state.active.isGroup) {
          const otherParticipant = state.active.participants?.find(
            (p) => (p._id?.toString?.() || p._id) === userIdStr,
          );
          if (otherParticipant) {
            otherParticipant.onlineStatus = status;
            if (lastSeen) otherParticipant.lastSeen = lastSeen;
          }
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;

        if (state.active?._id) {
          const updatedActive = action.payload.find(
            (c) => c._id === state.active._id,
          );

          if (updatedActive) {
            state.active = updatedActive;
          }
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder.addCase(getOrCreateConversation.fulfilled, (state, action) => {
      state.active = action.payload;
      // Add to list if not already there
      const exists = state.list.find((c) => c._id === action.payload._id);
      if (!exists) state.list.unshift(action.payload);
    });
    builder.addCase(createGroupConversation.fulfilled, (state, action) => {
      state.active = action.payload;
      const exists = state.list.find((c) => c._id === action.payload._id);
      if (!exists) state.list.unshift(action.payload);
    });
    builder.addCase(updateGroupName.fulfilled, (state, action) => {
      const idx = state.list.findIndex(
        (c) => c._id === action.payload.conversation._id,
      );

      if (idx !== -1) {
        state.list[idx].groupName = action.payload.conversation.groupName;
      }
      if (state.active?._id === action.payload.conversation._id) {
        state.active.groupName = action.payload.conversation.groupName;
      }
    });
    builder.addCase(removeMemberFromGroup.fulfilled, (state, action) => {
      const idx = state.list.findIndex(
        (c) => c._id === action.payload.conversation._id,
      );
      if (idx !== -1) {
        state.list[idx].participants = action.payload.conversation.participants;
      }
      if (state.active?._id === action.payload.conversation._id) {
        state.active.participants = action.payload.conversation.participants;
      }
    });
    builder.addCase(updateGroupProfilePic.fulfilled, (state, action) => {
      const idx = state.list.findIndex(
        (c) => c._id === action.payload.conversation._id,
      );
      if (idx !== -1) {
        state.list[idx].groupProfilePic = action.payload.conversation.groupProfilePic;
      }
      if (state.active?._id === action.payload.conversation._id) {
        state.active.groupProfilePic = action.payload.conversation.groupProfilePic;
      }
    });

    // Error handling for group name update
    builder.addCase(updateGroupName.rejected, (state, action) => {
      state.error = action.payload;
    });

    // Error handling for member removal
    builder.addCase(removeMemberFromGroup.rejected, (state, action) => {
      state.error = action.payload;
    });

    builder
      .addCase(searchConversations.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchConversations.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchConversations.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });
    builder.addCase(fetchArchivedConversations.fulfilled, (state, action) => {
      state.archivedList = action.payload;

      if (state.active?._id) {
        const archivedActive = action.payload.find(
          (c) => c._id === state.active._id,
        );

        if (archivedActive) {
          state.active = archivedActive;
        }
      }
    });
  },
});

export const {
  setActiveConversation,
  groupCreated,
  updateLastMessage,
  updateUserStatus,
  clearSearchResults,
} = conversationSlice.actions;

export default conversationSlice.reducer;
