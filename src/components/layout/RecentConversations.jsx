import { useDispatch, useSelector } from "react-redux";
import {
  setActiveConversation,
  fetchConversations,
} from "../../features/conversationSlice";
import { fetchMessages } from "../../features/messageSlice";
import { useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

const getConvDisplayName = (conv, currentUserId) => {
  if (conv.isGroup) return conv.groupName;
  const otherParticipant = conv.participants?.find(
    (p) => (typeof p === "object" ? p._id : p) !== currentUserId,
  );
  return otherParticipant
    ? typeof otherParticipant === "object"
      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
      : "Unknown"
    : "Unknown";
};

const getConvAvatar = (conv, currentUserId) => {
  if (conv.isGroup || !currentUserId) return null; 
  const otherParticipant = conv.participants?.find((p) => {
    const pId = (p?._id || p)?.toString();
    return pId !== currentUserId.toString();
  });
  return otherParticipant?.avatar || null;
};

const getOtherParticipant = (conv, currentUserId) => {
  if (conv.isGroup) return null;
  return conv.participants?.find((p) => {
    const pId = (typeof p === "object" ? p._id : p)?.toString?.() || p;
    const currentId = currentUserId?.toString?.() || currentUserId;
    return pId !== currentId;
  });
};

const RecentConversations = () => {
  const dispatch = useDispatch();
  const { list: conversations = [] } = useSelector((s) => s.conversation) || {};
  const { user } = useSelector((s) => s.user) || {};

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const conversationList = Array.isArray(conversations) ? conversations : [];

  if (conversationList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">💬</div>
        <p className="text-[#aaa] text-base">No conversations yet</p>
        <p className="text-[#ccc] text-sm">Start chatting with friends!</p>
      </div>
    );
  }

  const handleConversationClick = (conversation) => {
    dispatch(setActiveConversation(conversation));
    if (conversation._id) {
      dispatch(fetchMessages(conversation._id));
    }
  };

  const getLastMessagePreview = (conv) => {
    if (!conv.lastMessage) return "No messages yet";

    const msg = typeof conv.lastMessage === "object" ? conv.lastMessage : {};
    if (msg?.isDeleted) return "This message was deleted";
    if (msg?.type === "image") return "📷 Image";
    if (msg?.type === "video") return "🎥 Video";
    if (msg?.type === "file") return "📄 " + (msg?.content || "File");
    return msg?.content || "📎 Media";
  };

  const getLastMessageTime = (conv) => {
    if (!conv?.lastMessage) return "";
    const msgDate = new Date(conv.lastMessage.createdAt);
    const now = new Date();
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    return msgDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FFF8F0] overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FFF8F0] border-b border-[#F4E8DC] px-4 py-3">
        <h2 className="text-xl font-bold text-[#2C1A0E] m-0">
          Recent Conversations
        </h2>
        <p className="text-xs text-[#999] m-0 mt-1">
          {conversationList.length} conversation
          {conversationList.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversationList.map((conv) => {
          if (!conv || !conv._id) return null;

          const avatarPath = getConvAvatar(conv, user?._id);

          const getFullUrl = (path) => {
            if (!path) return null;
            if (path.startsWith("http")) return path;
            // Ensure there is a / between the domain and the path
            const cleanPath = path.startsWith("/") ? path : `/${path}`;
            return `http://localhost:5000${cleanPath}`;
          };

          const finalUrl = getFullUrl(avatarPath);

          console.log("Loading avatar for:", conv._id, "URL:", finalUrl);

          return (
            <div
              key={conv._id}
              onClick={() => handleConversationClick(conv)}
              className="border-b border-[#F4E8DC] px-4 py-3 cursor-pointer hover:bg-[#FFF0E6] transition-colors duration-200 flex items-start gap-3"
            >
              {/* Avatar */}
           

              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#C08552] flex items-center justify-center text-white shadow-sm overflow-hidden">
                  {avatarPath && finalUrl ? (
                    <img
                      src={finalUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";
                      }}
                    />
                  ) : (
                    <FaUserCircle size={48} />
                  )}
                </div>
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[#2C1A0E] text-sm truncate">
                    {getConvDisplayName(conv, user?._id)}
                  </h3>
                  <span className="text-xs text-[#999] flex-shrink-0">
                    {getLastMessageTime(conv)}
                  </span>
                </div>

                {/* Group info */}
                {conv.isGroup && (
                  <p className="text-[10px] text-[#6c63ff] font-semibold mb-1">
                    👥 {conv.participants?.length || 0} members
                  </p>
                )}

                {/* Last message preview */}
                <p className="text-xs text-[#666] truncate">
                  {conv.lastMessage?.sender?._id === user?._id
                    ? "You: "
                    : conv.isGroup
                      ? `${conv.lastMessage?.sender?.firstName || "Someone"}: `
                      : ""}
                  {getLastMessagePreview(conv)}
                </p>

                {/* Online status for 1-on-1 */}
                {!conv.isGroup &&
                  (() => {
                    const otherParticipant = getOtherParticipant(
                      conv,
                      user?._id,
                    );
                    const isOnline =
                      otherParticipant?.onlineStatus === "online";
                    return (
                      <div className="text-[9px] text-[#999] mt-1 flex items-center gap-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? "bg-green-500" : "bg-[#ccc]"
                          }`}
                        />
                        {isOnline
                          ? "Online"
                          : otherParticipant?.lastSeen
                            ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleDateString()}`
                            : "Offline"}
                      </div>
                    );
                  })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentConversations;
