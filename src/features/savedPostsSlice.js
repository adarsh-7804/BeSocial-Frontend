import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as savedPostApi from "../api/savedPostApi";

// Thunks
export const fetchSavedPostsThunk = createAsyncThunk(
  "savedPosts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await savedPostApi.fetchSavedPosts();
      return data.savedPosts;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch saved posts");
    }
  }
);

export const savePostThunk = createAsyncThunk(
  "savedPosts/save",
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await savedPostApi.savePost(postId);
      return { postId, savedPost: data.savedPost };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to save post");
    }
  }
);

export const unsavePostThunk = createAsyncThunk(
  "savedPosts/unsave",
  async (postId, { rejectWithValue }) => {
    try {
      await savedPostApi.unsavePost(postId);
      return { postId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to unsave post");
    }
  }
);

// Initial state - Using array instead of Set for serialization
const initialState = {
  savedPosts: [],
  savedPostIds: [], // Array instead of Set
  loading: false,
  error: null,
  savingPostId: null,
};

const savedPostsSlice = createSlice({
  name: "savedPosts",
  initialState,
  reducers: {
    clearSavedPostsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch saved posts
      .addCase(fetchSavedPostsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedPostsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload;
        state.savedPostIds = action.payload.map((sp) => sp.post._id);
      })
      .addCase(fetchSavedPostsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save post
      .addCase(savePostThunk.pending, (state, action) => {
        state.savingPostId = action.meta.arg;
      })
      .addCase(savePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.savingPostId = null;
        state.savedPosts.unshift(action.payload.savedPost);
        state.savedPostIds.push(action.payload.postId);
      })
      .addCase(savePostThunk.rejected, (state) => {
        state.savingPostId = null;
      })

      // Unsave post
      .addCase(unsavePostThunk.pending, (state, action) => {
        state.savingPostId = action.meta.arg;
      })
      .addCase(unsavePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.savingPostId = null;
        state.savedPosts = state.savedPosts.filter(
          (sp) => sp.post._id !== action.payload.postId
        );
        state.savedPostIds = state.savedPostIds.filter(
          (id) => id !== action.payload.postId
        );
      })
      .addCase(unsavePostThunk.rejected, (state) => {
        state.savingPostId = null;
      });
  },
});

// Selectors - Using array.includes instead of Set.has
export const selectSavedPosts = (state) => state.savedPosts.savedPosts;
export const selectSavedPostIds = (state) => state.savedPosts.savedPostIds;
export const selectIsPostSaved = (postId) => (state) => 
  state.savedPosts.savedPostIds.includes(postId);
export const selectSavedPostsLoading = (state) => state.savedPosts.loading;
export const selectSavedPostsError = (state) => state.savedPosts.error;
export const selectSavingPostId = (state) => state.savedPosts.savingPostId;

export const { clearSavedPostsError } = savedPostsSlice.actions;
export default savedPostsSlice.reducer;