import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/postsApi";
// add at top of postsSlice.js
import { fetchSuccess, fetchMore } from "./feedSlice";

export const fetchPosts = createAsyncThunk(
  "posts/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No token found");
      }

      const data = await api.fetchPosts(token);

      console.log("API response:", data);

      return data.posts; // correct
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const createPost = createAsyncThunk(
  "posts/create",
  async (postData, thunkAPI) => {
    try {
      // const token = thunkAPI.getState().user.token;
      const token = localStorage.getItem("accessToken");

      const response = await api.createPost(postData, token);

      return response.data.post;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create post",
      );
    }
  },
);

export const votePoll = createAsyncThunk(
  "posts/votePoll",
  async ({ postId, optionIndex }, thunkAPI) => {
    try {
      const res = await api.votePoll(postId, optionIndex);

      return { postId, poll: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const deletePost = createAsyncThunk(
  "posts/delete",
  async (postId, thunkAPI) => {
    try {
      // const token = thunkAPI.getState().user.token;
      const token = localStorage.getItem("accessToken");

      await api.deletePost(postId, token);

      // here we have  return id so we can remove it from state
      return postId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete post",
      );
    }
  },
);

export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await api.toggleLike(postId, token);

      return {
        postId,
        likesCount: response.data.likesCount,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to like post",
      );
    }
  },
);

export const reactToPost = createAsyncThunk(
  "posts/reactToPost",
  async ({ postId, type }, { rejectWithValue }) => {
    try {
      const res = await api.reactToPost(postId, type);
      return { postId, type, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  },
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await api.addComment(postId, text);

      // console.log(response.data);
      return { postId, comments: response.data.comments };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to add comment",
      );
    }
  },
);

export const replyComment = createAsyncThunk(
  "comment/replyComment",
  async ({ postId, commentId, text }, thunkAPI) => {
    try {
      const response = await api.replyComment(commentId, text);
      // console.log("Reply response:", response.data);

      return {
        postId,
        commentId,
        reply: response.data.reply,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to add reply",
      );
    }
  },
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, thunkAPI) => {
    try {
      await api.deleteComment(commentId);
      return { postId, commentId };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const deleteReply = createAsyncThunk(
  "posts/deleteReply",
  async ({ postId, commentId, replyId }, thunkAPI) => {
    try {
      await api.deleteReply(commentId, replyId);
      return { postId, commentId, replyId };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const sharePost = createAsyncThunk(
  "posts/sharePost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await api.sharePost(postId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error sharing post");
    }
  },
);

export const fetchReactions = createAsyncThunk(
  "posts/fetchReactions",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await api.fetchReactions(postId);
      return { postId, reactions: res.data.reactions };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const pinPost = createAsyncThunk(
  "posts/pinPost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await api.pinPost(postId);
      return { postId, isPinned: res.data.isPinned };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const unpinPost = createAsyncThunk(
  "posts/unpinPost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await api.unpinPost(postId);
      return { postId, isPinned: res.data.isPinned };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    userReactions: {}, // { [postId]: reactionType | null }
    reactionsLists: {}, // { [postId]: [{ _id, user, type }] }
    reactionsLoading: false,
  },
  reducers: {
    clearPostsError(state) {
      state.error = null;
    },
    updateViewCount(state, action) {
      const { postId, viewCount } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.views = { ...post.views, count: viewCount };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.posts = payload;

        payload.forEach((post) => {
          if (post.currentUserReaction) {
            state.userReactions[post._id] = post.currentUserReaction;
          }
        });
      })

      .addCase(fetchPosts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // Create Post
    builder
      // .addCase(create)
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(createPost.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.posts.unshift(payload);
        state.userReactions[payload._id] = null;
      })
      .addCase(createPost.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // Voting poll
    builder.addCase(votePoll.fulfilled, (state, { payload }) => {
      state.loading = false;
      const post = state.posts.find((p) => p._id === payload.postId);
      if (post) {
        post.poll = payload.poll; // update poll UI instantly ⚡
      }
    });

    //  Delete Post
    builder
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(deletePost.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.posts = state.posts.filter((p) => p._id !== payload);
      })
      .addCase(deletePost.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // Toggle Like
    builder
      .addCase(toggleLike.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);

        if (post) {
          post.likesCount = action.payload.likesCount;
        }
      })
      .addCase(toggleLike.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // React on POST
    builder
      .addCase(reactToPost.pending, (state) => {
        // state.loading = true;
        state.error = false;
      })
      // .addCase(reactToPost.fulfilled, (state, action) => {
      //   state.loading = false;
      //   const { postId, action: act } = action.payload;

      //   const post = state.posts.find((p) => p._id === postId);

      //   if (post) {
      //     if (act === "added") post.likesCount += 1;
      //     if (act === "removed") post.likesCount -= 1;
      //   }
      // })
      .addCase(reactToPost.rejected, (state, { payload }) => {
        state.error = payload;
      });

    //  Add Comment
    builder
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(addComment.fulfilled, (state, { payload }) => {
        state.loading = true;
        const post = state.posts.find((p) => p._id === payload.postId);
        if (post) post.comments = payload.comments;
      })
      .addCase(addComment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = true;
      });

    // Reply on Comment

    builder
      .addCase(replyComment.pending, (state) => {
        // state.loading = true;
        state.error = false;
      })
      .addCase(replyComment.fulfilled, (state, { payload }) => {
        state.loading = true;
        3;
        const post = state.posts.find((p) => p._id === payload.postId);
        if (post) {
          const comment = post.comments.find(
            (c) => String(c._id) === String(payload.commentId),
          );
          if (comment) {
            // ← add this null check
            comment.replies.push(payload.reply);
          }
        }
      })
      .addCase(replyComment.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });

    builder.addCase(deleteComment.fulfilled, (state, { payload }) => {
      const post = state.posts.find((p) => p._id === payload.postId);
      if (post)
        post.comments = post.comments.filter(
          (c) => c._id !== payload.commentId,
        );
    });

    builder.addCase(deleteReply.fulfilled, (state, { payload }) => {
      const post = state.posts.find((p) => p._id === payload.postId);
      if (post) {
        const comment = post.comments.find((c) => c._id === payload.commentId);
        if (comment)
          comment.replies = comment.replies.filter(
            (r) => r._id !== payload.replyId,
          );
      }
    });

    // Share POST
    builder
      .addCase(sharePost.fulfilled, (state, action) => {
        const { post, alreadyShared } = action.payload;

        if (alreadyShared || !post) return;

        const index = state.posts.findIndex((p) => p._id === post._id);

        if (index !== -1) {
          state.posts[index].sharesCount = post.sharesCount;
        }
      })

      .addCase(sharePost.rejected, (state, action) => {
        console.error("Share failed:", action.payload);
      });

    

    builder.addCase(reactToPost.fulfilled, (state, action) => {
      const { postId, action: act, type } = action.payload;
      if (act === "added") state.userReactions[postId] = type;
      if (act === "removed") state.userReactions[postId] = null;
      if (act === "updated") state.userReactions[postId] = type;

      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        if (act === "added") post.likesCount += 1;
        if (act === "removed")
          post.likesCount = Math.max(0, post.likesCount - 1);
      }
    });

    builder
      .addCase(fetchReactions.pending, (state) => {
        state.reactionsLoading = true;
      })
      .addCase(fetchReactions.fulfilled, (state, { payload }) => {
        state.reactionsLoading = false;
        state.reactionsLists[payload.postId] = payload.reactions;
      })
      .addCase(fetchReactions.rejected, (state) => {
        state.reactionsLoading = false;
      });

    // Pin/Unpin Post
    builder
      .addCase(pinPost.fulfilled, (state, { payload }) => {
        const post = state.posts.find((p) => p._id === payload.postId);
        if (post) {
          post.isPinned = payload.isPinned;
        }
      })
      .addCase(unpinPost.fulfilled, (state, { payload }) => {
        const post = state.posts.find((p) => p._id === payload.postId);
        if (post) {
          post.isPinned = payload.isPinned;
        }
      });

    builder
      // Seed userReactions when feed loads
      .addCase(fetchSuccess, (state, action) => {
        action.payload.posts?.forEach((post) => {
          if (post.currentUserReaction !== undefined) {
            state.userReactions[post._id] = post.currentUserReaction;
          }
        });
      });
    builder.addCase(fetchMore, (state, action) => {
      action.payload.posts?.forEach((post) => {
        if (post.currentUserReaction !== undefined) {
          state.userReactions[post._id] = post.currentUserReaction;
        }
      });
    });
  },
});

export const { clearPostsError, updateViewCount } = postsSlice.actions;

export const selectPosts = (state) => state.posts.posts;

export const selectPostsLoading = (state) => state.posts.loading;

export const selectPostsError = (state) => state.posts.error;

export const selectUserReactions = (state) => state.posts.userReactions;

export const selectReactionsList = (postId) => (state) =>
  state.posts.reactionsLists[postId] || [];

export const selectReactionsLoading = (state) => state.posts.reactionsLoading;

export default postsSlice.reducer;
