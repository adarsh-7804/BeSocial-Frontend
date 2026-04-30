import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectUser,
  acceptRequest,
  rejectRequest,
  searchUserThunk,
  fetchFriendRequests,
} from "../../features/userSlice";
import {
  fetchNotifications,
  fetchMessageNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectMessageNotifications,
  selectUnreadMessageCount,
  addMessageNotification,
} from "../../features/notificationSlice";
import { CiSearch } from "react-icons/ci";
import { AiOutlineBell } from "react-icons/ai";
import { FaPaperPlane } from "react-icons/fa";
import FriendButton from "./FriendButton";
import { getProfile } from "../../api/userApi";
import { getSocket } from "../../hooks/socketMiddleware";

//  tiny helpers
function avatarSrc(user) {
  if (!user?.avatar)
    return "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";
  return user.avatar.startsWith("http") || user.avatar.startsWith("blob:")
    ? user.avatar
    : `${import.meta.env.VITE_SERVER_URL}/${user.avatar}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// notification type
const TYPE_ICON = {
  tag_in_post: "🏷️",
  like_post: "❤️",
  comment_post: "💬",
  mention_in_post: "@️",
  reply_comment: "↩️",
  new_follower: "👤",
  friend_request_accepted: "🤝",
};

const Navbar = ({ userId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  // notification data
  const notifications = useSelector(selectNotifications);
  const messageNotifications = useSelector(selectMessageNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const unreadMessageCount = useSelector(selectUnreadMessageCount);

  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState("requests");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [acceptedRequestIds, setAcceptedRequestIds] = useState(new Set());
  const [rejectedRequestIds, setRejectedRequestIds] = useState(new Set());

  const results = useSelector((state) => state.user.searchResults);
  const loggedInUser = useSelector(selectUser);
  const isOwnProfile = loggedInUser?._id === profile?._id;

  useEffect(() => {
    if (!currentUser?._id) return;
    dispatch(fetchFriendRequests());
    dispatch(fetchNotifications());
    dispatch(fetchMessageNotifications());
    const interval = setInterval(() => {
      dispatch(fetchFriendRequests());
      dispatch(fetchNotifications());
      dispatch(fetchMessageNotifications());
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?._id, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("message_notification", (data) => {
      dispatch(
        addMessageNotification({
          _id: data.messageId,
          sender: data.sender,
          conversation: data.conversationId,
          messageId: data.messageId,
          message: `${data.sender.firstName} sent you a message`,
          content: data.content,
          read: false,
          createdAt: data.timestamp,
        }),
      );
    });

    socket.on("notification_received", (data) => {
      const notifData = data.notification || data;
      // Only add if it's NOT a message notification
      if (notifData.type !== 'message') {
        dispatch(fetchNotifications());
      }
    });

    return () => {
      socket.off("message_notification");
      socket.off("notification_received");
    };
  }, [dispatch]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (input.trim()) dispatch(searchUserThunk(input));
    }, 300);
    return () => clearTimeout(delay);
  }, [input]);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch {}
    };
    fetchProf();
    const iv = setInterval(fetchProf, 5000);
    return () => clearInterval(iv);
  }, []);

  const requests = currentUser?.friendRequestsReceived || [];
  const displayedRequests = requests.filter((u) => {
    const uid = u?._id?.toString() ?? u?.toString();
    return !acceptedRequestIds.has(uid) && !rejectedRequestIds.has(uid);
  });

  // Filter out message-type notifications from activity notifications
  const activityNotifs = notifications.filter(
    (n) => n.type !== "message" && n.category !== "message"
  );
  const unreadActivity = activityNotifs.filter((n) => !n.read).length;

  const totalBadge =
    displayedRequests.length + unreadActivity + unreadMessageCount;

  const handleAccept = async (userId) => {
    try {
      await dispatch(acceptRequest(userId)).unwrap();
      setAcceptedRequestIds((p) => new Set([...p, userId.toString()]));
    } catch {}
  };
  const handleReject = async (userId) => {
    try {
      await dispatch(rejectRequest(userId)).unwrap();
      setRejectedRequestIds((p) => new Set([...p, userId.toString()]));
    } catch {}
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) dispatch(markNotificationRead(notif._id));
    if (notif.post?._id) navigate(`/post/${notif.post._id}`);
  };

  const handleMarkAllRead = () => dispatch(markAllNotificationsRead());

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const handleLogOut = () => {
    dispatch(logout());
    navigate("/login");
    setShowLogoutModal(false);
    setShowMenu(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        .navbar { font-family: 'DM Sans', sans-serif; }
        .nav-search:focus { border-color: #8C5A3C !important; box-shadow: 0 0 0 3px rgba(140,90,60,0.12); }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 10px; display: flex; align-items: center; color: #4B2E2B; transition: background 0.15s; }
        .icon-btn:hover { background: rgba(75,46,43,0.08); }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .slide-down { animation: slideDown 0.2s ease both; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-content { animation: scaleIn 0.2s ease; }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-thumb { background: #C08552; border-radius: 99px; }
      `}</style>

      <nav
        className="navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #f0e0d0",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 16,
          boxSizing: "border-box",
          boxShadow: "0 1px 8px rgba(140,90,60,0.06)",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/main")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#C08552,#8C5A3C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "#FFF8F0",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#291d1c",
              letterSpacing: "-0.02em",
            }}
          >
            Be<em style={{ color: "#C08552" }}>Social</em>
          </span>
        </div>

        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 500,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <CiSearch
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "#a0714f",
              pointerEvents: "none",
            }}
          />
          <input
            className="nav-search"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search BeSocial…"
            style={{
              width: "100%",
              background: "#FFF8F0",
              border: "1.5px solid #e1bc9c",
              borderRadius: 50,
              padding: "9px 16px 9px 38px",
              fontSize: 13,
              color: "#291d1c",
              outline: "none",
              fontFamily: "'DM Sans',sans-serif",
              boxSizing: "border-box",
              transition: "all 0.2s",
            }}
          />
          {input && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                width: "100%",
                background: "#fff",
                border: "1px solid #e8d5c0",
                borderRadius: 12,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                zIndex: 200,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {results.length === 0 ? (
                <p style={{ padding: 10, fontSize: 12 }}>No users found</p>
              ) : (
                results.map((user) => (
                  <div
                    className="flex flex-row justify-between"
                    key={user._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="flex gap-2"
                      onClick={() => {
                        navigate(`/profile/${user._id}`);
                        setInput("");
                      }}
                    >
                      <img
                        src={avatarSrc(user)}
                        style={{ width: 35, height: 35, borderRadius: "50%" }}
                        alt=""
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: "#888" }}>
                          @{user.email}
                        </div>
                      </div>
                    </div>
                    {!isOwnProfile && user?._id && (
                      <FriendButton userId={user._id} />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right icons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <div
            onClick={() => navigate("/test-chat")}
            title="Message"
            className="icon-btn text-[#4B2E2B] cursor-pointer flex items-center justify-center"
          >
            <FaPaperPlane />
          </div>
          {/* ── Bell button ── */}
          <div style={{ position: "relative" }}>
            <button
              title="Notification"
              className="icon-btn"
              onClick={() => setShowNotifications((p) => !p)}
            >
              <AiOutlineBell style={{ fontSize: 22 }} />
              {totalBadge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 10,
                    height: 10,
                    background: "#C08552",
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    color: "#fff",
                    padding: "0 2px",
                  }}
                >
                  {totalBadge > 9 ? "9+" : ""}
                </span>
              )}
            </button>

            {/*  Notification panel  */}

            {showNotifications && (
              <div
                className="slide-down"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  width: 320,
                  background: "#fff",
                  border: "1.5px solid #e8d5c0",
                  borderRadius: 14,
                  boxShadow: "0 8px 28px rgba(140,90,60,0.14)",
                  zIndex: 200,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px 10px",
                    borderBottom: "1px solid #f0e0d0",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#291d1c" }}
                  >
                    Notifications
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {/* Unread count badge */}
                    {totalBadge > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#a0714f",
                          fontWeight: 600,
                        }}
                      >
                        {totalBadge} unread
                      </span>
                    )}
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        fontSize: 10,
                        color: "#C08552",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                </div>

                {/* Unified sorted list */}
                <div
                  style={{
                    maxHeight: 400,
                    overflowY: "auto",
                    padding: "6px 10px 10px",
                  }}
                  className="notif-scroll"
                >
                  {(() => {
                    // Build unified list with category tag + sort by date desc
                    const allItems = [
                      ...displayedRequests.map((user) => ({
                        _id: user._id,
                        category: "request",
                        createdAt: user.createdAt || new Date().toISOString(),
                        read: false,
                        _user: user,
                      })),
                      ...activityNotifs.map((n) => ({
                        ...n,
                        category: "activity",
                      })),
                      ...messageNotifications.map((m) => ({
                        ...m,
                        category: "message",
                      })),
                    ].sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    );

                    if (allItems.length === 0) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "30px 10px",
                            color: "#a0714f",
                          }}
                        >
                          <div style={{ fontSize: 26 }}>🔔</div>
                          <p style={{ marginTop: 8, fontSize: 12 }}>
                            No notifications yet
                          </p>
                        </div>
                      );
                    }

                    // Category tag styles
                    const categoryTag = {
                      request: {
                        label: "Request",
                        bg: "#FDE8D8",
                        color: "#8C5A3C",
                      },
                      activity: {
                        label: "Activity",
                        bg: "#E8F4FD",
                        color: "#2563a8",
                      },
                      message: {
                        label: "Message",
                        bg: "#E8FDF0",
                        color: "#166534",
                      },
                    };

                    return allItems.map((item) => {
                      const tag = categoryTag[item.category];

                      // ── Friend Request card ──
                      if (item.category === "request") {
                        const user = item._user;
                        return (
                          <div
                            key={`req-${item._id}`}
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 9,
                              padding: "10px 8px 8px",
                              marginBottom: 6,
                              borderRadius: 10,
                              background: "#FFF8F0",
                              border: "1px solid rgba(192,133,82,0.2)",
                            }}
                          >
                            {/* Category tag */}
                            <span
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 8,
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 99,
                                background: tag.bg,
                                color: tag.color,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                              }}
                            >
                              {tag.label}
                            </span>

                            <div
                              style={{ position: "relative", flexShrink: 0 }}
                            >
                              <img
                                src={avatarSrc(user)}
                                alt=""
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1.5px solid rgba(192,133,82,0.3)",
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  fontSize: 12,
                                  lineHeight: 1,
                                }}
                              >
                                🤝
                              </span>
                            </div>

                            <div
                              style={{ flex: 1, minWidth: 0, paddingRight: 50 }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color: "#291d1c",
                                  lineHeight: 1.4,
                                }}
                              >
                                <strong>
                                  {user.firstName} {user.lastName}
                                </strong>{" "}
                                sent you a friend request
                              </p>
                              <p
                                style={{
                                  margin: "3px 0 6px",
                                  fontSize: 10,
                                  color: "#bbb",
                                }}
                              >
                                {timeAgo(item.createdAt)}
                              </p>
                              <div style={{ display: "flex", gap: 4 }}>
                                <button
                                  onClick={() => handleAccept(user._id)}
                                  style={{
                                    fontSize: 10,
                                    padding: "4px 8px",
                                    background: "#C08552",
                                    color: "white",
                                    borderRadius: 6,
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(user._id)}
                                  style={{
                                    fontSize: 10,
                                    padding: "4px 8px",
                                    background: "#eee",
                                    borderRadius: 6,
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                                flexShrink: 0,
                                marginTop: 18,
                              }}
                            >
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: "#C08552",
                                  display: "block",
                                }}
                              />
                            </div>
                          </div>
                        );
                      }

                      // ── Activity card ──
                      if (item.category === "activity") {
                        return (
                          <div
                            key={`act-${item._id}`}
                            onClick={() => handleNotifClick(item)}
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 9,
                              padding: "10px 8px 8px",
                              marginBottom: 6,
                              borderRadius: 10,
                              cursor: "pointer",
                              transition: "background 0.15s",
                              background: item.read ? "#fff" : "#FFF8F0",
                              border: item.read
                                ? "1px solid #f5f5f5"
                                : "1px solid rgba(192,133,82,0.2)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#FFF0E4")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = item.read
                                ? "#fff"
                                : "#FFF8F0")
                            }
                          >
                            {/* Category tag */}
                            <span
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 8,
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 99,
                                background: tag.bg,
                                color: tag.color,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                              }}
                            >
                              {tag.label}
                            </span>

                            <div
                              style={{ position: "relative", flexShrink: 0 }}
                            >
                              <img
                                src={avatarSrc(item.sender)}
                                alt=""
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1.5px solid rgba(192,133,82,0.3)",
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  fontSize: 12,
                                  lineHeight: 1,
                                }}
                              >
                                {TYPE_ICON[item.type] || "🔔"}
                              </span>
                            </div>

                            <div
                              style={{ flex: 1, minWidth: 0, paddingRight: 52 }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color: "#291d1c",
                                  lineHeight: 1.4,
                                }}
                              >
                                <strong>
                                  {item.sender?.firstName}{" "}
                                  {item.sender?.lastName}
                                </strong>{" "}
                                {item.type === "tag_in_post"
                                  ? "tagged you in a post"
                                  : item.type === "like_post"
                                    ? "liked your post"
                                    : item.type === "comment_post"
                                      ? "commented on your post"
                                      : item.type === "mention_in_post"
                                        ? "mentioned you in a post"
                                        : item.type === "reply_comment"
                                          ? "replied to your comment"
                                          : item.type === "new_follower"
                                            ? "started following you"
                                            : item.message}
                              </p>
                              {item.post?.caption && (
                                <p
                                  style={{
                                    margin: "2px 0 0",
                                    fontSize: 10,
                                    color: "#a0714f",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 170,
                                  }}
                                >
                                  "{item.post.caption}"
                                </p>
                              )}
                              <p
                                style={{
                                  margin: "3px 0 0",
                                  fontSize: 10,
                                  color: "#bbb",
                                }}
                              >
                                {timeAgo(item.createdAt)}
                              </p>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                                flexShrink: 0,
                                marginTop: 18,
                              }}
                            >
                              {!item.read && (
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#C08552",
                                    display: "block",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      }

                      // ── Message card ──
                      return (
                        <div
                          key={`msg-${item._id}`}
                          onClick={() => {
                            if (!item.read)
                              dispatch(markNotificationRead(item._id));
                            navigate("/test-chat");
                            setShowNotifications(false);
                          }}
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 9,
                            padding: "10px 8px 8px",
                            marginBottom: 6,
                            borderRadius: 10,
                            cursor: "pointer",
                            transition: "background 0.15s",
                            background: item.read ? "#fff" : "#FFF8F0",
                            border: item.read
                              ? "1px solid #f5f5f5"
                              : "1px solid rgba(192,133,82,0.2)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#FFF0E4")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = item.read
                              ? "#fff"
                              : "#FFF8F0")
                          }
                        >
                          {/* Category tag */}
                          <span
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 8,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 99,
                              background: tag.bg,
                              color: tag.color,
                              letterSpacing: "0.03em",
                              textTransform: "uppercase",
                            }}
                          >
                            {tag.label}
                          </span>

                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img
                              src={avatarSrc(item.sender)}
                              alt=""
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1.5px solid rgba(192,133,82,0.3)",
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                fontSize: 12,
                                lineHeight: 1,
                              }}
                            >
                              💬
                            </span>
                          </div>

                          <div
                            style={{ flex: 1, minWidth: 0, paddingRight: 52 }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "#291d1c",
                                lineHeight: 1.4,
                              }}
                            >
                              <strong>
                                {item.sender?.firstName} {item.sender?.lastName}
                              </strong>
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#a0714f",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 170,
                              }}
                            >
                              {item.content || item.message}
                            </p>
                            <p
                              style={{
                                margin: "3px 0 0",
                                fontSize: 10,
                                color: "#bbb",
                              }}
                            >
                              {timeAgo(item.createdAt)}
                            </p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                              flexShrink: 0,
                              marginTop: 18,
                            }}
                          >
                            {!item.read && (
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: "#C08552",
                                  display: "block",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: "50%",
                display: "flex",
              }}
            >
              <img
                src={avatarSrc(currentUser)}
                alt="profile"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #C08552",
                }}
              />
            </button>

            {showMenu && (
              <div
                className="slide-down"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  background: "#fff",
                  border: "1.5px solid #e8d5c0",
                  borderRadius: 14,
                  minWidth: 180,
                  boxShadow: "0 8px 28px rgba(140,90,60,0.14)",
                  zIndex: 200,
                  overflow: "hidden",
                  padding: "6px 0",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f0e0d0",
                    marginBottom: 4,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#291d1c",
                      textTransform: "capitalize",
                    }}
                  >
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#a0714f" }}>
                    {currentUser?.email}
                  </p>
                </div>
                {[
                  { label: "👤 View Profile", path: "/profile" },
                  { label: "⚙️ Settings", path: "/settings" },
                ].map(({ label, path }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setShowMenu(false);
                      navigate(path);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      fontSize: 13,
                      color: "#4B2E2B",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#FFF8F0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    {label}
                  </button>
                ))}
                <div
                  style={{ height: 1, background: "#f0e0d0", margin: "4px 0" }}
                />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowLogoutModal(true);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    fontSize: 13,
                    color: "#ef4444",
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fee2e2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "28px 32px",
              maxWidth: 360,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              textAlign: "center",
              border: "1px solid #e8d5c0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              🚪
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#291d1c",
              }}
            >
              Log Out?
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to log out from <strong>BeSocial</strong>?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "1.5px solid #e8d5c0",
                  background: "#fff",
                  color: "#4B2E2B",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogOut}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "#C08552",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(192,133,82,0.3)",
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;