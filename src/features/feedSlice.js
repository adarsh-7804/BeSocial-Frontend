import { createSlice } from "@reduxjs/toolkit";
import {
  toggleLike,
  reactToPost,
  addComment,
  replyComment,
  sharePost,
  deletePost,
  deleteComment,
  deleteReply,
  updateViewCount,
  pinPost,
  unpinPost,
  votePoll,
  createPost,
} from "./postsSlice";

const initialState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  type: "following",
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchSuccess: (state, action) => {
      state.loading = false;

      const posts = action.payload.posts;

      // 🔥 ensure sorted
      posts.sort((a, b) => b.score - a.score);

      state.posts = posts;
      state.page = 2;
      state.hasMore = posts.length > 0;
    },

    // fetchSuccess: (state, action) => {
    //   state.loading = false;
    //   state.posts = action.payload.posts;
    //   state.page = 2;
    //   state.hasMore = action.payload.posts.length > 0;
    // },

    // fetchMore: (state, action) => {
    //   state.loading = false;

    //   const newPosts = action.payload.posts;
    //   const existingIds = new Set(state.posts.map((p) => p._id));
    //   const filtered = newPosts.filter((p) => !existingIds.has(p._id));

    //   state.posts = [...state.posts, ...filtered];
    //   state.page += 1;
    //   state.hasMore = newPosts.length > 0;
    // },

    fetchMore: (state, action) => {
      state.loading = false;

      const newPosts = action.payload.posts;
      const existingIds = new Set(state.posts.map((p) => p._id));
      const filtered = newPosts.filter((p) => !existingIds.has(p._id));

      // merge
      const merged = [...state.posts, ...filtered];

      // 🔥 FIX: sort by score
      merged.sort((a, b) => b.score - a.score);

      state.posts = merged;

      state.page += 1;
      state.hasMore = newPosts.length > 0;
    },

    fetchError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    setFeedType: (state, action) => {
      state.type = action.payload;
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },

    refreshFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // reactToPost returns { postId, action: act, type, likesCount }
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { postId, action: act, type } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          if (act === "added") post.likesCount += 1;
          if (act === "removed")
            post.likesCount = Math.max(0, post.likesCount - 1);
          // "updated" — count stays same
        }
      })

      // toggleLike returns { postId, likesCount }
      .addCase(toggleLike.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) post.likesCount = action.payload.likesCount;
      })

      // addComment returns { postId, comments }
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) post.comments = action.payload.comments;
      })

      // replyComment returns { postId, commentId, reply }
      .addCase(replyComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          const comment = post.comments.find(
            (c) => String(c._id) === String(action.payload.commentId),
          );
          if (comment) comment.replies.push(action.payload.reply);
        }
      })

      // sharePost returns { post, alreadyShared }
      .addCase(sharePost.fulfilled, (state, action) => {
        const { post, alreadyShared } = action.payload;
        if (alreadyShared || !post) return;
        const index = state.posts.findIndex((p) => p._id === post._id);
        if (index !== -1) state.posts[index].sharesCount = post.sharesCount;
      })

      // deletePost returns postId string
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })

      // deleteComment returns { postId, commentId }
      .addCase(deleteComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post)
          post.comments = post.comments.filter(
            (c) => c._id !== action.payload.commentId,
          );
      })

      // deleteReply returns { postId, commentId, replyId }
      .addCase(deleteReply.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          const comment = post.comments.find(
            (c) => c._id === action.payload.commentId,
          );
          if (comment)
            comment.replies = comment.replies.filter(
              (r) => r._id !== action.payload.replyId,
            );
        }
      })

      .addCase(updateViewCount, (state, action) => {
        const { postId, viewCount } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.views = { ...post.views, count: viewCount };
        }
      })

      // pinPost returns { postId, isPinned: true }
      .addCase(pinPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.isPinned = true;
        }
      })

      // unpinPost returns { postId, isPinned: false }
      .addCase(unpinPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.isPinned = false;
        }
      })

      // votePoll returns { postId, poll }
      .addCase(votePoll.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.poll = action.payload.poll;
        }
      })

      // createPost returns the new post object
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      });
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchMore,
  fetchError,
  setFeedType,
  refreshFeed,
} = feedSlice.actions;

export default feedSlice.reducer;
