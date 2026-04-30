// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// import * as api from "../api/schedulePostApi"

// export const fetchScheduledPostThunk = createAsyncThunk(
//     "scheduledPost/fetchAll",
//     async(_, thunkAPI) => {
//         try{

//             const token  = localStorage.getItem("accessToken");

//             if(!token) {
//                 throw new Error("Token not found");
//             }

//             const { data } = await api.fetchScheduledPost(token);
//             return data;
//         } catch(err) {
//             return thunkAPI.rejectWithValue(
//                 err.response?.data?.message || err.message
//             )
//         }
//     }
// )

// export const schedulePostThunk  = createAsyncThunk(
//     "scheduledPost/schedule",
//     async(FormData, thunkAPI) => {
//         try {
//             const token = localStorage.getItem("accessToken");
            
//             const { data } = await api.schedulePost(FormData, token)

//             return data;
//         } catch(err) {
//             return thunkAPI.rejectWithValue(
//                 err.response?.data?.message || "Failed to scheduele a post"
//             );
//         }
//     },
// );

// export const updateScheduledPostThunk = createAsyncThunk(
//     "scheduledPost/update",
//     async ({ id, formData }, thunkAPI) => {
//         try {

//             const token = localStorage.getItem("accessToken");

//             const { data } = await api.updateScheduledPost(id, formData);
//             return data;
//         } catch (err) {
//             return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update scheduled post");
//         }
//     }
// );

// export const cancelScheduledPostThunk = createAsyncThunk(
//     "scheduledPost/cancel",
//     async (id, thunkAPI) => {
//         try {
//             await api.cancelScheduledPost(id);
//             return id;
//         } catch (err) {
//             return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to cancel scheduled post");
//         }
//     }
// );

// const scheduledPostSlice  = createSlice({
//     name: "scheduledPost",
//     initialState:{
//         posts: [],
//         loading : false,
//         saving : false,
//         error : null,  
//     },
//     reducers: {
//         clearError(state) {
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {

//         // Fetch all scheduled post 
//         builder 
//           .addCase(fetchScheduledPostThunk.pending, (state) => {
//             state.loading = true;
//             state.error = null;  
//           })
//           .addCase(fetchScheduledPostThunk.fulfilled, (state,{
//             action }) => {
//                 state.loading = false;
//                 state.posts = action.payload.scheduledPosts;
//             })
//             .addCase(fetchScheduledPostThunk.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//         //  schedule a post 
//         builder 
//           .addCase(schedulePostThunk.pending, (state) => {
//             state.saving  = true;
//             state.error = null;  
//           })
//           .addCase(schedulePostThunk.fulfilled, (state,{
//             action }) => {
//                 state.loading = false;
//                 state.saving = false;
//                 state.posts.push(action.payload.scheduledPost);
//                 state.posts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
//             })
//             .addCase(schedulePostThunk.rejected, (state, action) => {
//                 state.saving  = false;
//                 state.error = action.payload;
//             })

//         // Update Scheduled Post 
//         builder 
//           .addCase(updateScheduledPostThunk.pending, (state) => {
//             state.loading = true;
//             state.error = null;  
//           })
//           .addCase(updateScheduledPostThunk.fulfilled, (state,{
//             payload }) => {
//                 state.loading = false;
//                 state.saving = false;
//                 const index = state.posts.findIndex(
//                     (p) => p._id === action.payload.scheduledPost._id
//                 );
//                 if (index !== -1) {
//                     state.posts[index] = action.payload.scheduledPost;
//                 }
//             })
//             .addCase(updateScheduledPostThunk.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//         // Delete/Cancel Schedule Post
//         builder 
//           .addCase(cancelScheduledPostThunk.pending, (state) => {
//             state.loading = true;
//             state.error = null;  
//           })
//           .addCase(cancelScheduledPostThunk.fulfilled, (state,{
//             payload }) => {
//                 state.loading = false;
//                 state.saving = false;
//                 state.posts = state.posts.filter((p) => p._id !== action.payload);
//             })
//             .addCase(cancelScheduledPostThunk.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })
        
//         }
//     })
    
// export const { clearError } = scheduledPostSlice.actions;

// export const selectScheduledPosts = (state) => state.scheduledPost?.posts ?? [];

// export const selectScheduledPostsLoading = (state) => state.scheduledPost?.loading;

// export const selectScheduledPostsSave = (state) => state.scheduledPost?.saving;

// export const selectScheduledPostsError = (state) => state.scheduledPost?.error;

// export default scheduledPostSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/schedulePostApi";

export const fetchScheduledPostThunk = createAsyncThunk(
    "scheduledPost/fetchAll",
    async (_, thunkAPI) => {
        try {
            const { data } = await api.fetchScheduledPosts();
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || err.message
            );
        }
    }
);

export const schedulePostThunk = createAsyncThunk(
    "scheduledPost/schedule",
    async (formData, thunkAPI) => {
        try {
            const { data } = await api.schedulePost(formData);
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Failed to schedule a post"
            );
        }
    }
);

export const updateScheduledPostThunk = createAsyncThunk(
    "scheduledPost/update",
    async ({ id, formData }, thunkAPI) => {
        try {
            const { data } = await api.updateScheduledPost(id, formData);
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update scheduled post");
        }
    }
);

export const cancelScheduledPostThunk = createAsyncThunk(
    "scheduledPost/cancel",
    async (id, thunkAPI) => {
        try {
            await api.cancelScheduledPost(id);
            return id;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to cancel scheduled post");
        }
    }
);

const scheduledPostSlice = createSlice({
    name: "scheduledPost",
    initialState: {
        posts: [],           // Changed from 'drafts' to 'posts'
        loading: false,
        saving: false,
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all scheduled posts
        builder
            .addCase(fetchScheduledPostThunk.pending, (state) => {
                state.loading = true;
                state.error = null;  // Fixed: was 'false', should be 'null'
            })
            .addCase(fetchScheduledPostThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.scheduledPosts;  // Fixed: was 'isAction.payload.schedulePost'
            })
            .addCase(fetchScheduledPostThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;  // Fixed: was just 'payload'
            });

        // Schedule a post
        builder
            .addCase(schedulePostThunk.pending, (state) => {
                state.saving = true;  // Fixed: was 'loading', should be 'saving'
                state.error = null;
            })
            .addCase(schedulePostThunk.fulfilled, (state, action) => {
                state.saving = false;
                state.posts.push(action.payload.scheduledPost);
                state.posts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
            })
            .addCase(schedulePostThunk.rejected, (state, action) => {
                state.saving = false;  // Fixed: was 'loading', should be 'saving'
                state.error = action.payload;
            });

        // Update Scheduled Post
        builder
            .addCase(updateScheduledPostThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateScheduledPostThunk.fulfilled, (state, action) => {
                state.saving = false;
                const index = state.posts.findIndex(
                    (p) => p._id === action.payload.scheduledPost._id
                );
                if (index !== -1) {
                    state.posts[index] = action.payload.scheduledPost;
                }
            })
            .addCase(updateScheduledPostThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // Delete/Cancel Schedule Post
        builder
            .addCase(cancelScheduledPostThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(cancelScheduledPostThunk.fulfilled, (state, action) => {
                state.saving = false;
                state.posts = state.posts.filter((p) => p._id !== action.payload);
            })
            .addCase(cancelScheduledPostThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = scheduledPostSlice.actions;

// Fixed selectors - 'scheduledPost' not 'schedulePost'
export const selectScheduledPosts = (state) => state.scheduledPost?.posts ?? [];
export const selectScheduledPostsLoading = (state) => state.scheduledPost?.loading;
export const selectScheduledPostsSave = (state) => state.scheduledPost?.saving;
export const selectScheduledPostsError = (state) => state.scheduledPost?.error;

export default scheduledPostSlice.reducer;