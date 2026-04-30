import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/highlightApi";

export const fetchHighlights = createAsyncThunk(
  "highlights/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getHighlights();
      return res.data.highlights;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch highlights");
    }
  }
);

export const getSingleHighlight = createAsyncThunk(
  "highlights/fetchSingle",
  async (highlightId, { rejectWithValue }) => {
    try {
      const res = await api.getSingleHighlight(highlightId);
      return res.data.highlight;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch highlight");
    }
  }
);

export const createHighlightThunk = createAsyncThunk(
  "highlights/create",
  async ({ title, description, coverImage }, { rejectWithValue }) => {
    try {
      const res = await api.createHighlight(title, description, coverImage);
      return res.data.highlight;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create highlight");
    }
  }
);

export const updateHighlightThunk = createAsyncThunk(
  "highlights/update",
  async ({ highlightId, title, description, coverImage, isPublic }, { rejectWithValue }) => {
    try {
      const res = await api.updateHighlight(highlightId, title, description, coverImage, isPublic);
      return res.data.highlight;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update highlight");
    }
  }
);

export const addStoryToHighlight = createAsyncThunk(
  "highlights/addStory",
  async ({ highlightId, storyId }, { rejectWithValue }) => {
    try {
      const res = await api.addStoryToHighlight(highlightId, storyId);
      return res.data.highlight;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add story");
    }
  }
);

export const removeStoryFromHighlight = createAsyncThunk(
  "highlights/removeStory",
  async ({ highlightId, storyId }, { rejectWithValue }) => {
    try {
      await api.removeStoryFromHighlight(highlightId, storyId);
      return { highlightId, storyId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove story");
    }
  }
);

export const deleteHighlightThunk = createAsyncThunk(
  "highlights/delete",
  async (highlightId, { rejectWithValue }) => {
    try {
      await api.deleteHighlight(highlightId);
      return highlightId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete highlight");
    }
  }
);

const highlightSlice = createSlice({
  name: "highlights",
  initialState: { 
    highlights: [], 
    selectedHighlight: null,
    loading: false, 
    error: null 
  },
  reducers: {
    clearHighlightError(state) { 
      state.error = null; 
    },
    clearSelectedHighlight(state) {
      state.selectedHighlight = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all highlights
    builder
      .addCase(fetchHighlights.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchHighlights.fulfilled, (s, { payload }) => { s.loading = false; s.highlights = payload; })
      .addCase(fetchHighlights.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });

    // Fetch single highlight
    builder
      .addCase(getSingleHighlight.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(getSingleHighlight.fulfilled, (s, { payload }) => { s.loading = false; s.selectedHighlight = payload; })
      .addCase(getSingleHighlight.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });

    // Create highlight
    builder
      .addCase(createHighlightThunk.fulfilled, (s, { payload }) => { s.highlights.unshift(payload); })
      .addCase(createHighlightThunk.rejected, (s, { payload }) => { s.error = payload; });

    // Update highlight
    builder
      .addCase(updateHighlightThunk.fulfilled, (s, { payload }) => {
        const idx = s.highlights.findIndex((h) => h._id === payload._id);
        if (idx !== -1) s.highlights[idx] = payload;
        if (s.selectedHighlight?._id === payload._id) s.selectedHighlight = payload;
      })
      .addCase(updateHighlightThunk.rejected, (s, { payload }) => { s.error = payload; });

    // Add story to highlight
    builder.addCase(addStoryToHighlight.fulfilled, (s, { payload }) => {
      const idx = s.highlights.findIndex((h) => h._id === payload._id);
      if (idx !== -1) s.highlights[idx] = payload;
      if (s.selectedHighlight?._id === payload._id) s.selectedHighlight = payload;
    });

    // Remove story from highlight
    builder.addCase(removeStoryFromHighlight.fulfilled, (s, { payload }) => {
      const h = s.highlights.find((h) => h._id === payload.highlightId);
      if (h) h.stories = h.stories.filter((sid) => (sid._id || sid) !== payload.storyId);
      if (s.selectedHighlight?._id === payload.highlightId) {
        s.selectedHighlight.stories = s.selectedHighlight.stories.filter((sid) => (sid._id || sid) !== payload.storyId);
      }
    });

    // Delete highlight
    builder.addCase(deleteHighlightThunk.fulfilled, (s, { payload }) => {
      s.highlights = s.highlights.filter((h) => h._id !== payload);
      if (s.selectedHighlight?._id === payload) s.selectedHighlight = null;
    });
  },
});

export const { clearHighlightError, clearSelectedHighlight } = highlightSlice.actions;
export default highlightSlice.reducer;
