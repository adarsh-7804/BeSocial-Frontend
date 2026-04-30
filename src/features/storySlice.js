import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/storyApi";

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchStories = createAsyncThunk(
  "stories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getStories();
      return res.data.stories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch stories");
    }
  }
);

export const createStory = createAsyncThunk(
  "stories/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.createStory(formData);
      return res.data.story;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create story");
    }
  }
);

export const viewStory = createAsyncThunk(
  "stories/view",
  async (storyId, { rejectWithValue }) => {
    try {
      const res = await api.viewStory(storyId);
      return { storyId, viewCount: res.data.viewCount };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to record view");
    }
  }
);

export const fetchStoryViewers = createAsyncThunk(
  "stories/fetchViewers",
  async (storyId, { rejectWithValue }) => {
    try {
      const res = await api.getStoryViewers(storyId);
      return { storyId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch viewers");
    }
  }
);

export const deleteStoryThunk = createAsyncThunk(
  "stories/delete",
  async (storyId, { rejectWithValue }) => {
    try {
      await api.deleteStory(storyId);
      return storyId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete story");
    }
  }
);

export const reactToStory = createAsyncThunk(
  "stories/react",
  async ({ storyId, reactionType }, { rejectWithValue, getState }) => {
    try {
      const res = await api.likeStory(storyId, reactionType);
      const userId = getState().user.user._id;
      return { storyId, userId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to react");
    }
  }
);

export const unreactToStory = createAsyncThunk(
  "stories/unreact",
  async (storyId, { rejectWithValue, getState }) => {
    try {
      const res = await api.unlikeStory(storyId);
      const userId = getState().user.user._id;
      return { storyId, userId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove reaction");
    }
  }
);

export const replyToStory = createAsyncThunk(
  "stories/reply",
  async ({ storyId, text }, { rejectWithValue }) => {
    try {
      const res = await api.replyToStory(storyId, text);
      return { storyId, reply: res.data.reply };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to reply");
    }
  }
);

export const muteUser = createAsyncThunk(
  "stories/mute",
  async (userId, { rejectWithValue }) => {
    try {
      await api.muteUserStories(userId);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mute");
    }
  }
);

export const unmuteUser = createAsyncThunk(
  "stories/unmute",
  async (userId, { rejectWithValue }) => {
    try {
      await api.unmuteUserStories(userId);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to unmute");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const storySlice = createSlice({
  name: "stories",
  initialState: {
    groupedStories: [],   // Array of { user, stories[], hasUnviewed }
    loading: false,
    creating: false,
    error: null,
    viewerData: {},       // { [storyId]: { viewers, viewCount, showAnalytics } }
    activeStoryGroup: null, // Index of currently viewing user group
    activeStoryIndex: 0,    // Index within that group
    viewerModalOpen: false,
  },
  reducers: {
    clearStoryError(state) {
      state.error = null;
    },
    setActiveStoryGroup(state, action) {
      state.activeStoryGroup = action.payload;
      state.activeStoryIndex = 0;
      state.viewerModalOpen = true;
    },
    setActiveStoryIndex(state, action) {
      state.activeStoryIndex = action.payload;
    },
    closeStoryViewer(state) {
      state.viewerModalOpen = false;
      state.activeStoryGroup = null;
      state.activeStoryIndex = 0;
    },
    nextStory(state) {
      if (state.activeStoryGroup === null) return;
      const group = state.groupedStories[state.activeStoryGroup];
      if (!group) return;
      if (state.activeStoryIndex < group.stories.length - 1) {
        state.activeStoryIndex += 1;
      } else if (state.activeStoryGroup < state.groupedStories.length - 1) {
        state.activeStoryGroup += 1;
        state.activeStoryIndex = 0;
      } else {
        state.viewerModalOpen = false;
        state.activeStoryGroup = null;
        state.activeStoryIndex = 0;
      }
    },
    prevStory(state) {
      if (state.activeStoryGroup === null) return;
      if (state.activeStoryIndex > 0) {
        state.activeStoryIndex -= 1;
      } else if (state.activeStoryGroup > 0) {
        state.activeStoryGroup -= 1;
        const prevGroup = state.groupedStories[state.activeStoryGroup];
        state.activeStoryIndex = prevGroup ? prevGroup.stories.length - 1 : 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStories.fulfilled, (state, { payload }) => { state.loading = false; state.groupedStories = payload; })
      .addCase(fetchStories.rejected, (state, { payload }) => { state.loading = false; state.error = payload; });

    builder
      .addCase(createStory.pending, (state) => { state.creating = true; state.error = null; })
      .addCase(createStory.fulfilled, (state) => { state.creating = false; })
      .addCase(createStory.rejected, (state, { payload }) => { state.creating = false; state.error = payload; });

    builder.addCase(viewStory.fulfilled, (state, { payload }) => {
      const { storyId } = payload;
      state.groupedStories.forEach((group) => {
        const story = group.stories.find((s) => s._id === storyId);
        if (story) story.isViewed = true;
      });
    });

    builder.addCase(fetchStoryViewers.fulfilled, (state, { payload }) => {
      state.viewerData[payload.storyId] = {
        viewers: payload.viewers,
        viewCount: payload.viewCount,
        showAnalytics: payload.showAnalytics,
      };
    });

    builder.addCase(deleteStoryThunk.fulfilled, (state, { payload }) => {
      state.groupedStories.forEach((group) => {
        group.stories = group.stories.filter((s) => s._id !== payload);
      });
      state.groupedStories = state.groupedStories.filter((g) => g.stories.length > 0);
    });

    builder.addCase(reactToStory.fulfilled, (state, { payload }) => {
      const { storyId, userId, reactionType } = payload;
      state.groupedStories.forEach((group) => {
        const story = group.stories.find((s) => s._id === storyId);
        if (story) {
          if (!story.reactions) story.reactions = [];
          const existing = story.reactions.find((r) => (r.userId?._id || r.userId) === userId);
          if (existing) {
            existing.type = reactionType;
          } else {
            story.reactions.push({ userId: { _id: userId }, type: reactionType });
          }
        }
      });
    });

    builder.addCase(unreactToStory.fulfilled, (state, { payload }) => {
      const { storyId, userId } = payload;
      state.groupedStories.forEach((group) => {
        const story = group.stories.find((s) => s._id === storyId);
        if (story && story.reactions) {
          story.reactions = story.reactions.filter((r) => (r.userId?._id || r.userId) !== userId);
        }
      });
    });

    builder.addCase(muteUser.fulfilled, (state, { payload }) => {
      state.groupedStories = state.groupedStories.filter(
        (g) => g.user._id !== payload
      );
    });
  },
});

export const {
  clearStoryError, setActiveStoryGroup, setActiveStoryIndex,
  closeStoryViewer, nextStory, prevStory,
} = storySlice.actions;

export default storySlice.reducer;
