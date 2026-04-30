import { configureStore } from "@reduxjs/toolkit";  
import userreducer from '../features/userSlice.js'
import postsreducer from '../features/postsSlice.js'
import draftsreducer from '../features/draftSlice.js'
import scheduledPostReducer from '../features/scheduledPostSlice.js'
import notificationReducer from "../features/notificationSlice.js";
import savedPostsReducer from "../features/savedPostsSlice.js";
import feedReducer from "../features/feedSlice.js"
import notInterestedReducer from "../features/notInterestedSlice.js"
import storyReducer from "../features/storySlice.js"
import highlightReducer from "../features/highlightSlice.js"
import messageReducer from "../features/messageSlice.js"
import conversationReducer from "../features/conversationSlice.js"
import socketMiddleware from "../hooks/socketMiddleware.js";
import { js } from '@eslint/js';


export const store = configureStore({
    reducer :{
        user : userreducer,
        posts : postsreducer,
        drafts : draftsreducer, 
        scheduledPost : scheduledPostReducer ,
        notifications : notificationReducer,
        savedPosts: savedPostsReducer,    
        feed: feedReducer,
        notInterested: notInterestedReducer,
        stories: storyReducer,
        highlights: highlightReducer,
        conversation: conversationReducer,
        message: messageReducer
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
})

export const { user } = store.getState();
export default store;