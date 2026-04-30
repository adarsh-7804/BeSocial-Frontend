import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api";

export const fetchMessages = createAsyncThunk(
  "message/fetch",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/messages/${conversationId}`, {
        withCredentials: true,
      });

      console.log("fetchMessages response:", data);

      return {
        conversationId,
        messages: data.messages || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  },
);
export const sendMessage = createAsyncThunk(
  "message/send",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages`,
        { conversationId, content, type: "text" },
        { withCredentials: true },
      );

      return { conversationId, message: data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong",
      );
    }
  },
);
export const deleteMessage = createAsyncThunk(
  "message/delete",
  async ({ messageId, conversationId, deleteFor }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`${BASE}/messages/${messageId}`, {
        data: { deleteFor },
        withCredentials: true,
      });
      return { messageId, conversationId, deleteFor };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  },
);

export const markMessageAsRead = createAsyncThunk(
  "message/markAsRead",
  async ({ conversationId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages/read`,
        { conversationId },
        { withCredentials: true },
      );
      return { conversationId, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const pinMessage = createAsyncThunk(
  "message/pin",
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages/pin`,
        { messageId, conversationId },
        { withCredentials: true },
      );
      return { conversationId, messageId: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const unpinMessage = createAsyncThunk(
  "message/unpin",
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages/unpin`,
        { messageId, conversationId },
        { withCredentials: true },
      );
      return { conversationId, messageId: data.messageId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchPinnedMessages = createAsyncThunk(
  "message/fetchPinned",
  async ({ conversationId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages/pinned/${conversationId}`,
        { conversationId },
        { withCredentials: true },
      );
      return { conversationId, pinnedMessages: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const sendMediaMessage = createAsyncThunk(
  "message/sendMedia",
  async ({ conversationId, files, replyTo }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      if (replyTo) formData.append("replyTo", replyTo);

      files.forEach((file) => formData.append("media", file));

      const { data } = await axios.post(`${BASE}/messages/media`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return {
        conversationId: data.conversationId,
        messages: data.messages || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const replyToMessage = createAsyncThunk(
  "message/reply",
  async ({ conversationId, content, replyTo }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages/reply`,
        { conversationId, content, replyTo },
        { withCredentials: true },
      );
      return { conversationId, message: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const editMessage = createAsyncThunk(
  "message/edit",
  async ({ messageId, content, conversationId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE}/messages/${messageId}`,
        { content },
        { withCredentials: true },
      );
      return {
        conversationId,
        messageId,
        content: data.content,
        editedAt: data.editedAt,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const forwardMessage = createAsyncThunk(
  "message/forward",
  async ({ messageId, targetConversationId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages/forward`,
        { messageId, targetConversationId },
        { withCredentials: true },
      );
      return {
        conversationId: targetConversationId,
        message: data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: {},
    pinnedMessages: {},
    loading: false,
    error: null,
  },
  reducers: {
    messageReceived: (state, action) => {
      const msg = action.payload;

      const convId =
        typeof msg.conversation === "object"
          ? msg.conversation._id
          : msg.conversation;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      const exists = state.messages[convId].find((m) => m._id === msg._id);

      if (!exists) {
        state.messages[convId].push(msg);
      }
    },
    deleteMessageLocal: (state, action) => {
      const { messageId, conversationId, deleteFor } = action.payload;

      const msgs = state.messages[conversationId];
      if (!msgs) return;

      const msg = msgs.find((m) => m._id === messageId);
      if (!msg) return;

      if (deleteFor === "everyone") {
        msg.isDeleted = true;
        msg.content = "This message was deleted";
      } else {
        state.messages[conversationId] = msgs.filter(
          (m) => m._id !== messageId,
        );
      }
    },
    readReceiptmessage: (state, action) => {
      const { conversationId, readBy } = action.payload;
      const msgs = state.messages[conversationId];
      if (!msgs) return;

      msgs.forEach((msg) => {
        // skip own messages
        if ((msg.sender?._id || msg.sender)?.toString() === readBy.toString()) {
          return;
        }

        if (!msg.readBy) msg.readBy = [];

        const alreadyRead = msg.readBy.some(
          (r) => r.user?.toString() === readBy.toString(),
        );

        if (!alreadyRead) {
          msg.readBy.push({
            user: readBy,
            readAt: new Date().toISOString(),
          });
        }
      });
    },
    messagePinnedRecived: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.pinnedMessages[conversationId])
        state.pinnedMessages[conversationId] = [];
      const exists = state.pinnedMessages[conversationId].find(
        (m) => m._id === message._id,
      );
      if (!exists) state.pinnedMessages[conversationId].push(message);
    },

    messageUnpinnedRecived: (state, action) => {
      const { conversationId, messageId } = action.payload;
      if (!state.pinnedMessages[conversationId]) return;
      state.pinnedMessages[conversationId] = state.pinnedMessages[
        conversationId
      ].filter((m) => m._id !== messageId);
    },

    messageEditedRecived: (state, action) => {
      const { conversationId, messageId, content, editedAt } = action.payload;

      const msgs = state.messages[conversationId];

      if (!msgs) return;

      state.messages[conversationId] = msgs.map((m) => {
        m._id === messageId ? { ...m, content, isEdited: true, editedAt } : m;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        const exists = state.messages[conversationId].find(
          (m) => m._id === message._id,
        );
        if (!exists) {
          state.messages[conversationId].push(message);
        }
      })

      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId, conversationId, deleteFor } = action.payload;

        const msgs = state.messages[conversationId];
        if (!msgs) return;

        const msg = msgs.find((m) => m._id === messageId);
        if (!msg) return;

        if (deleteFor === "everyone") {
          msg.isDeleted = true;
          msg.content = "This message was deleted";
        } else {
          state.messages[conversationId] = msgs.filter(
            (m) => m._id !== messageId,
          );
        }
      })

      .addCase(fetchPinnedMessages.fulfilled, (state, action) => {
        state.pinnedMessages[action.payload.conversationId] =
          action.payload.pinnedMessages;
      })

      .addCase(pinMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        if (!state.pinnedMessages[conversationId])
          state.pinnedMessages[conversationId] = [];
        const exists = state.pinnedMessages[conversationId].find(
          (m) => m._id === messageId._id,
        );
        if (!exists) state.pinnedMessages[conversationId].push(messageId);
      })

      .addCase(unpinMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        if (!state.pinnedMessages[conversationId]) return;

        state.pinnedMessages[conversationId] = state.pinnedMessages[
          conversationId
        ].filter((m) => m._id !== messageId);
      })

      .addCase(sendMediaMessage.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        if (!state.messages[conversationId])
          state.messages[conversationId] = [];
        messages.forEach((msg) => {
          const exists = state.messages[conversationId].find(
            (m) => m._id === msg._id,
          );
          if (!exists) state.messages[conversationId].push(msg);
        });
      })

      .addCase(replyToMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId])
          state.messages[conversationId] = [];
        const exists = state.messages[conversationId].find(
          (m) => m._id === message._id,
        );
        if (!exists) state.messages[conversationId].push(message);
      })
      
      .addCase(editMessage.fulfilled, (state, action) => {
        const { conversationId, messageId, content, editedAt } = action.payload;
        const msgs = state.messages[conversationId];
        if (!msgs) return;
        state.messages[conversationId] = msgs.map((m) =>
          m._id === messageId ? { ...m, content, isEdited: true, editedAt } : m,
        );
      })

      .addCase(forwardMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId])
          state.messages[conversationId] = [];
        const exists = state.messages[conversationId].find(
          (m) => m._id === message._id,
        );
        if (!exists) state.messages[conversationId].push(message);
      });
  },
});

export const {
  messageReceived,
  deleteMessageLocal,
  readReceiptmessage,
  messageUnpinnedRecived,
  messagePinnedRecived,
  messageEditedRecived,
} = messageSlice.actions;
export default messageSlice.reducer;
