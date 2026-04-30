import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import * as api from "../api/draftApi";

export const fetchDraftsThunk = createAsyncThunk(
  "drafts/fetchDraft",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await api.fetchDrafts(token);
      return response.data.drafts;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const saveDraftThunk = createAsyncThunk(
  "drafts/create",
  async (formData, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await api.saveDraft(formData, token);

      return response.data.draft;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to save draft",
      );
    }
  },
);

export const deleteDraftThunk = createAsyncThunk(
  "drafts/delete",
  async (draftId, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      await api.deleteDraft(draftId, token);

      return draftId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to Delete Draft",
      );
    }
  },
);

export const publishDraftThunk = createAsyncThunk(
  "drafts/publish",
  async (draftId, thunkAPI) => {
    try {
      const res = await api.publishDraft(draftId);

      return { post: res.data.post, draftId: res.data.draftId };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to publish draft",
      );
    }
  },
);

const draftSlice = createSlice({
  name: "drafts",
  initialState: {
    drafts: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearDraftError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    //Fetch Drafts
    builder
      .addCase(fetchDraftsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDraftsThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.drafts = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchDraftsThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    //Save Drafts
    builder
      .addCase(saveDraftThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDraftThunk.fulfilled, (state, { payload }) => {
        state.loading = false;

        const draftsArray = Array.isArray(state.drafts) ? state.drafts : [];

        const idx = draftsArray.findIndex((d) => d._id === payload._id);
        if (idx !== -1) {
          state.drafts[idx] = payload;
        } else {
          state.drafts.unshift(payload);
        }
      })
      .addCase(saveDraftThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    //Delete Drafts
    builder
      .addCase(deleteDraftThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDraftThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.drafts = Array.isArray(state.drafts)
          ? state.drafts.filter((d) => d._id !== payload)
          : [];
      })
      .addCase(deleteDraftThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    //Publish Drafts
    builder
      .addCase(publishDraftThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishDraftThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.drafts = state.drafts.filter((d) => d._id !== payload.draftId);
      })
      .addCase(publishDraftThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearDraftError } = draftSlice.actions;

export const selectDrafts = (state) => state.drafts.drafts ?? [];

export const selectDraftsLoading = (state) => state.drafts.loading;

export const selectDraftsSave = (state) => state.drafts.saving;

export const selectDraftsError = (state) => state.drafts.error;

export const selectDraftsCount = (state) => state.drafts.drafts?.length ?? 0;

export default draftSlice.reducer;
