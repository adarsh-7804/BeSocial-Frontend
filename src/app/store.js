import { configureStore } from "@reduxjs/toolkit";  
import userreducer from '../features/userSlice'
import postsreducer from '../features/postsSlice'
import draftsreducer from '../features/draftSlice'
import scheduledPostReducer from '../features/scheduledPostSlice'
import notificationReducer from "../features/notificationSlice.js";
import savedPostsReducer from "../features/savedPostsSlice";
import feedReducer from "../features/feedSlice"
import notInterestedReducer from "../features/notInterestedSlice"
import storyReducer from "../features/storySlice"
import highlightReducer from "../features/highlightSlice"
import messageReducer from "../features/messageSlice"
import conversationReducer from "../features/conversationSlice"
import socketMiddleware from "../hooks/socketMiddleware";
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