import { io } from "socket.io-client";
import {
  deleteMessageLocal,
  messagePinnedRecived,
  messageReceived,
  messageUnpinnedRecived,
  pinMessage,
  readReceiptmessage,
  messageEditedRecived,
} from "../features/messageSlice";
import {
  groupCreated,
  updateLastMessage,
  updateUserStatus,
  fetchConversations,
} from "../features/conversationSlice";
import { handleFriendRequestCancelled } from "../features/userSlice";

let socket = null;

const socketMiddleware = (store) => (next) => (action) => {
  if (!socket) {
    const token = store.getState().user?.token;

    if (token) {
      socket = io(import.meta.env.VITE_SERVER_URL, {
        auth: { token },
        withCredentials: true,
      });

      socket.on("connect", () => {
        console.log("Socket Connected", socket.id);
      });

      socket.on("receive_message", (message) => {
        console.log("SOCKET MESSAGE RECEIVED:", message);

        store.dispatch(messageReceived(message));

        const convId =
          typeof message.conversation === "object"
            ? message.conversation._id
            : message.conversation;

        store.dispatch(
          updateLastMessage({
            conversationId: convId,
            message,
          }),
        );
      });

      socket.on("group_created", (conversation) => {
        store.dispatch(groupCreated(conversation));
      });

      socket.on("read_receipt", (data) => {
        store.dispatch(readReceiptmessage(data));
      });

      socket.on("read_receipt", (data) => {
        console.log("RECEIVED READ:", data);
      });

      socket.on("message_deleted", (data) => {
        console.log("Message deleted:", data);

        store.dispatch(deleteMessageLocal(data));
      });

      socket.on("conversation_muted", (data) => {
        console.log("Conversation muted:", data);
      });

      socket.on("conversation_unmuted", (data) => {
        console.log("Conversation unmuted:", data);
      });

      socket.on("conversation_archived", (data) => {
        console.log("Conversation archived:", data);
      });

      socket.on("conversation_unarchived", (data) => {
        console.log("Conversation unarchived:", data);
      });

      socket.on("message_pinned", (data) => {
        store.dispatch(messagePinnedRecived(data));
      });

      socket.on("message_unpinned", (data) => {
        store.dispatch(messageUnpinnedRecived(data));
      });

      // Listen for user online/offline status changes
      socket.on("user_online", (data) => {
        store.dispatch(
          updateUserStatus({
            userId: data.userId,
            status: data.status,
            lastSeen: data.lastSeen,
          }),
        );
      });

      // Listen for real-time status changes in conversation
      socket.on("user_status_changed", (data) => {
        store.dispatch(
          updateUserStatus({
            userId: data.userId,
            status: data.status,
            lastSeen: data.lastSeen,
          }),
        );
      });

      socket.on("message_edited", (data) => {
        store.dispatch(messageEditedReceived(data));
      });

      socket.on("friend_request_cancelled", (data) => {
        console.log("Friend request cancelled by:", data.cancelledById);
        store.dispatch(
          handleFriendRequestCancelled({
            cancelledById: data.cancelledById,
          })
        );
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket error:", err.message);
      });
    }
  }

  // LOGOUT
  if (action.type === "auth/logout") {
    if (socket) {
      console.log("User logging out, notifying status change...");
      socket.emit("user_going_offline", {}, () => {
        socket.disconnect();
        socket = null;
      });
    }
  }

  // JOIN ROOM
  if (action.type === "conversation/setActiveConversation") {
    if (socket && action.payload?._id) {
      socket.emit("join_room", action.payload._id);
    }
  }

  return next(action);
};

export const getSocket = () => socket;

export default socketMiddleware;
