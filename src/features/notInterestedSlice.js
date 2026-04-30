import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import API, { markNotInterested, undoNotInterested } from "../api/postsApi"; 
//  Thunks 

export const markNotInterestedThunk = createAsyncThunk(
  "notInterested/mark",
  async (postId, { rejectWithValue }) => {
    try {
      await markNotInterested(postId);
      return postId; // we only need the id to remove from UI
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const undoNotInterestedThunk = createAsyncThunk(
  "notInterested/undo",
  async (postId, { rejectWithValue }) => {
    try {
      await undoNotInterested(postId);
      return postId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

//  Slice 

const notInterestedSlice = createSlice({
  name: "notInterested",
  initialState: {
    hiddenPostIds: [],      // posts hidden this session (for instant UI removal)
    lastHiddenPostId: null, // for the undo toast
    loading: false,
  },
  reducers: {
    clearLastHidden(state) {
      state.lastHiddenPostId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark
      .addCase(markNotInterestedThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotInterestedThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.hiddenPostIds.push(action.payload);
        state.lastHiddenPostId = action.payload;
      })
      .addCase(markNotInterestedThunk.rejected, (state) => {
        state.loading = false;
      })
      // Undo
      .addCase(undoNotInterestedThunk.fulfilled, (state, action) => {
        state.hiddenPostIds = state.hiddenPostIds.filter(
          (id) => id !== action.payload
        );
        state.lastHiddenPostId = null;
      });
  },
});

export const { clearLastHidden } = notInterestedSlice.actions;
export default notInterestedSlice.reducer;

//  Selectors 
export const selectHiddenPostIds = (state) => state.notInterested.hiddenPostIds;

export const selectIsPostHidden = (postId) => 
  createSelector(
    selectHiddenPostIds,
    (hiddenPostIds) => hiddenPostIds.includes(postId)
  );