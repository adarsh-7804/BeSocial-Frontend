import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchConversations,
  getOrCreateConversation,
  createGroupConversation,
  setActiveConversation,
  updateGroupName,
  updateGroupProfilePic,
  removeMemberFromGroup,
  searchConversations,
  clearSearchResults,
  fetchArchivedConversations,
} from "../../../features/conversationSlice";
import {
  fetchMessages,
  sendMessage,
  sendMediaMessage,
  deleteMessage,
  deleteMessageLocal,
  markMessageAsRead,
  replyToMessage,
  editMessage,
  pinMessage,
  unpinMessage,
  fetchPinnedMessages,
  forwardMessage,
} from "../../../features/messageSlice";
import { getSocket } from "../../../hooks/socketMiddleware";
import { MdEmojiEmotions } from "react-icons/md";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { CiFileOn } from "react-icons/ci";
import { RiChat1Fill } from "react-icons/ri";
import { MdOutlineAdminPanelSettings, MdDeleteForever } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import { FiShare2 } from "react-icons/fi";
import Navbar from "../Navbar";
import SideBar from "../SideBar";
import RecentConversations from "../RecentConversations";
import { useConversationActions } from "../../../hooks/useConversationActions";
import {
  IoVolumeMute,
  IoArchiveOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { ConversationMenu } from "./ConversationMenu";
import {
  FaUserFriends,
  FaReplyAll,
  FaRegEdit,
  FaShareAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { ImPushpin } from "react-icons/im";
import { useNavigate } from "react-router-dom";

export default function TestChat() {
  const dispatch = useDispatch();
  const { list, active, searchResults, isSearching } = useSelector(
    (s) => s.conversation,
  );
  const navigate = useNavigate();

  const { messages } = useSelector((s) => s.message);
  const { user } = useSelector((s) => s.user);
  const { message, pinnedMessages } = useSelector((s) => s.message);
  const activePinned = active ? pinnedMessages[active._id] || [] : [];

  const [text, setText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Typing indicator states
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  //  Group creation state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [pinnedIndex, setPinnedIndex] = useState(0);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupProfilePicFile, setGroupProfilePicFile] = useState(null);
  const [groupProfilePicPreview, setGroupProfilePicPreview] = useState(null);
  const [isUploadingGroupPic, setIsUploadingGroupPic] = useState(false);
  const groupProfilePicInputRef = useRef(null);

  const [showConvMenu, setShowConvMenu] = useState(null);
  const { archivedList } = useSelector((s) => s.conversation);
  const [showArchived, setShowArchived] = useState(false);
  const {
    handleMuteConversation,
    handleUnmuteConversation,
    handleArchiveConversation,
    handleUnarchiveConversation,
  } = useConversationActions();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Reply
  const [replyingTo, setReplyingTo] = useState(null);

  // Edit
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");

  // Forward message
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      dispatch(clearSearchResults());
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(searchConversations(value));
      setShowSearchResults(true);
    }, 500);
  };

  const handleSearchResultClick = (conv) => {
    dispatch(setActiveConversation(conv));
    setSearchQuery("");
    setShowSearchResults(false);
    dispatch(clearSearchResults());
  };

  const renderTextWithLinks = (text) => {
    if (!text) return "";

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        let href = part;

        if (!href.startsWith("http://") && !href.startsWith("https://")) {
          href = "https://" + href;
        }

        return (
          <a
            key={i}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // internal post links
              if (href.includes("localhost:5173/post/")) {
                const postId = href.split("/post/")[1];
                navigate(`/post/${postId}`);
                return;
              }

              // external links
              window.open(href, "_blank");
            }}
            className="text-[#291D1C] underline break-all cursor-pointer"
          >
            {part}
          </a>
        );
      }

      return part;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSearchResults && !e.target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSearchResults]);

  useEffect(() => {
    const handleClickOutside = () => setShowEmojiPicker(false);
    if (showEmojiPicker) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showEmojiPicker]);

  const bottomRef = useRef(null);
  const activeMessages = active ? messages[active._id] || [] : [];

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchArchivedConversations());
  }, [dispatch]);

  useEffect(() => {
    if (!active?._id) return;

    const socket = getSocket();
    if (!socket) return;

    socket.on("typing_indicator", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.userId === data.userId);
          return exists ? prev : [...prev, data];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    });

    socket.on("group_name_updated", (data) => {
      console.log("Group name updated:", data);
    });

    socket.on("group_profile_pic_updated", (data) => {
      console.log("Group profile picture updated:", data);
    });

    socket.on("member_removed", (data) => {
      console.log("Member removed:", data);
    });

    socket.on("removed_from_group", (data) => {
      console.log("You were removed from group:", data.groupName);
    });

    dispatch(fetchMessages(active._id));
    dispatch(fetchPinnedMessages({ conversationId: active._id }));

    return () => {
      socket.off("typing_indicator");
      socket.off("group_name_updated");
      socket.off("group_profile_pic_updated");
      socket.off("member_removed");
      socket.off("removed_from_group");
      setTypingUsers([]);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [active?._id]);

  useEffect(() => {
    if (!active?._id || !activeMessages.length) return;
    dispatch(markMessageAsRead({ conversationId: active._id }));
  }, [activeMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleDelete = (msg, type) => {
    dispatch(
      deleteMessageLocal({
        messageId: msg._id,
        conversationId: active._id,
        deleteFor: type,
      }),
    );

    dispatch(
      deleteMessage({
        messageId: msg._id,
        conversationId: active._id,
        deleteFor: type,
      }),
    );
  };

  const handleFriendClick = async (friendId) => {
    const result = await dispatch(getOrCreateConversation(friendId));
    if (result.payload?._id) dispatch(setActiveConversation(result.payload));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    const socket = getSocket();
    if (!socket || !active?._id) return;

    if (value.trim() && !isTyping) {
      socket.emit("typing_start", { conversationId: active._id });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socket.emit("typing_stop", { conversationId: active._id });
        setIsTyping(false);
      }
    }, 3000);
  };

  const handleInputBlur = () => {
    const socket = getSocket();
    if (socket && active?._id && isTyping) {
      socket.emit("typing_stop", { conversationId: active._id });
      setIsTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const toggleSelectFriend = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Enter a group name");
    if (selectedIds.length < 2) return toast.error("Select at least 2 members");

    const result = await dispatch(
      createGroupConversation({ groupName, participantsIds: selectedIds }),
    );

    if (result.payload?._id) {
      dispatch(setActiveConversation(result.payload));
      setShowGroupModal(false);
      setGroupName("");
      setSelectedIds([]);
    }
  };

  const getOtherParticipant = (conv) => {
    const currentUserId = user?._id?.toString?.() || user?._id;
    return conv.participants?.find((p) => {
      const pId = (typeof p === "object" ? p._id : p)?.toString?.() || p;
      return pId !== currentUserId;
    });
  };

  const getConvDisplayName = (conv) => {
    if (conv.isGroup) return conv.groupName;
    const other = getOtherParticipant(conv);
    return `${other?.firstName ?? ""} ${other?.lastName ?? ""}`;
  };

  const getConvAvatar = (conv) => {
    if (conv.isGroup) return null;
    return getOtherParticipant(conv)?.avatar ?? null;
  };

  const handlePin = (msg) => {
    dispatch(pinMessage({ messageId: msg._id, conversationId: active._id }));
    setOpenMenuId(null);
  };

  const handleUnpin = (messageId) => {
    dispatch(unpinMessage({ messageId, conversationId: active._id }));
  };

  const Avatar = ({ src, name, size = 36 }) => (
    <div
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      className="rounded-full bg-[#bbb] overflow-hidden shrink-0 flex items-center justify-center"
    >
      {src ? (
        <img
          src={`${import.meta.env.VITE_SERVER_URL}/${src}`}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        name?.[0]?.toUpperCase()
      )}
    </div>
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "file",
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    }));

    setSelectedFiles(files);
    setPreviewFiles(previews);
    e.target.value = "";
  };

  const removePreviewFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMedia = () => {
    if (!selectedFiles.length || !active?._id) return;
    dispatch(
      sendMediaMessage({ conversationId: active._id, files: selectedFiles }),
    );
    setSelectedFiles([]);
    setPreviewFiles([]);
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    setEditingMsg(null);
    setOpenMenuId(null);
  };

  const handleSendReply = () => {
    if (!text.trim() || !replyingTo) return;
    dispatch(
      replyToMessage({
        conversationId: active._id,
        content: text,
        replyTo: replyingTo._id,
      }),
    );
    setText("");
    setReplyingTo(null);
  };

  const handleStartEdit = (msg) => {
    setEditingMsg(msg);
    setEditText(msg.content);
    setReplyingTo(null);
    setOpenMenuId(null);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingMsg) return;
    dispatch(
      editMessage({
        messageId: editingMsg._id,
        content: editText,
        conversationId: active._id,
      }),
    );
    setEditingMsg(null);
    setEditText("");
  };

  const handleForwardMessage = async (targetConversationId) => {
    if (!forwardingMessage || !targetConversationId) return;

    try {
      const result = await dispatch(
        forwardMessage({
          messageId: forwardingMessage._id,
          targetConversationId,
        }),
      );

      if (result.payload) {
        toast.success("Message forwarded successfully!");
        setShowForwardModal(false);
        setForwardingMessage(null);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to forward message");
    }
  };

  const handleSend = () => {
    if (!text.trim() || !active?._id) return;

    if (replyingTo) {
      handleSendReply();
    } else {
      dispatch(sendMessage({ conversationId: active._id, content: text }));
      setText("");
    }

    const socket = getSocket();
    if (socket) {
      socket.emit("typing_stop", { conversationId: active._id });
    }

    setIsTyping(false);
  };

  const isGroupAdmin =
    active?.isGroup &&
    (() => {
      if (!active?.groupAdmin || !user?._id) return false;

      if (active.groupAdmin?._id) {
        return active.groupAdmin._id.toString() === user._id.toString();
      }
      if (typeof active.groupAdmin === "string") {
        return active.groupAdmin === user._id.toString();
      }
      return active.groupAdmin.toString() === user._id.toString();
    })();

  const handleOpenGroupSettings = () => {
    if (active?.isGroup) {
      setEditingGroupName(active.groupName);
      setShowGroupSettingsModal(true);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!editingGroupName.trim())
      return toast.error("Group name cannot be empty");

    const result = await dispatch(
      updateGroupName({
        conversationId: active._id,
        newGroupName: editingGroupName,
      }),
    );

    if (result.payload) {
      setIsEditingName(false);
      toast.success("Group name updated successfully! ✓");
    } else {
      toast.error("Failed to update group name: " + result.payload);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from group?`)) return;

    const result = await dispatch(
      removeMemberFromGroup({
        conversationId: active._id,
        memberIdToRemove: memberId,
      }),
    );

    if (result.payload) {
      toast.success(`${memberName} has been removed from the group ✓`);
    } else {
      toast.error("Failed to remove member: " + result.payload);
    }
  };

  const handleGroupProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setGroupProfilePicFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadGroupProfilePic = async () => {
    if (!groupProfilePicFile || !active?._id) return;

    setIsUploadingGroupPic(true);
    try {
      const result = await dispatch(
        updateGroupProfilePic({
          conversationId: active._id,
          file: groupProfilePicFile,
        }),
      );

      if (result.payload) {
        toast.success("Group profile picture updated successfully! ✓");
        setGroupProfilePicFile(null);
        setGroupProfilePicPreview(null);
        if (groupProfilePicInputRef.current) {
          groupProfilePicInputRef.current.value = "";
        }
      } else {
        toast.error(
          "Failed to upload profile picture: " +
            (result.payload || "Unknown error"),
        );
      }
    } catch (err) {
      toast.error("Error uploading profile picture: " + err.message);
    } finally {
      setIsUploadingGroupPic(false);
    }
  };

  const MemberItem = ({ member, onRemove, isAdmin, isCurrentUser }) => (
    <div
      className={`flex items-center justify-between px-3 py-2.5 border-b border-[#eee] rounded-md mb-1 ${isCurrentUser ? "bg-[#f0f4ff]" : "bg-[#f9f9f9]"}`}
    >
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate(`/profile/${member._id}`)}
      >
        <Avatar src={member.avatar} name={member.firstName} size={36} />
        <div>
          <div className="text-[13px] font-bold">
            {member.firstName} {member.lastName}
            {isCurrentUser && <span className="text-[#6c63ff]"> (You)</span>}
            {member._id === active?.groupAdmin?._id && (
              <span className="text-[#ff6b6b] ml-1.5"> Admin</span>
            )}
          </div>
          <div className="text-[11px] text-[#888] flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${member.onlineStatus === "online" ? "bg-green-500" : "bg-[#999]"}`}
            />
            {member.onlineStatus === "online" ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      {isAdmin && !isCurrentUser && (
        <button
          onClick={() => onRemove(member._id, member.firstName)}
          className="px-2.5 py-1 bg-[#ff4757] text-white border-none rounded cursor-pointer text-xs font-bold"
        >
          ✕ Remove
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col bg-[#FFF8F0] h-screen font-mono relative overflow-x-hidden">
      {/* GROUP CREATION MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-6 w-[340px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <h3 className="mt-0 mb-4">👥 Create Group</h3>

            <input
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 mb-3 rounded-md border border-[#ccc] text-sm box-border"
            />

            <p className="m-0 mb-2 text-xs text-[#666]">
              Select members ({selectedIds.length} selected — need at least 2):
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-3.5">
              {user?.friends?.map((friend) => {
                const id = typeof friend === "object" ? friend._id : friend;
                const firstName =
                  typeof friend === "object" ? friend.firstName : "User";
                const lastName =
                  typeof friend === "object" ? friend.lastName : "";
                const avatar =
                  typeof friend === "object" ? friend.avatar : null;
                const checked = selectedIds.includes(id);

                return (
                  <div
                    key={id}
                    onClick={() => toggleSelectFriend(id)}
                    className={`flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded-md mb-0.5 ${checked ? "bg-[#e8f0fe]" : "bg-transparent"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelectFriend(id)}
                      className="cursor-pointer"
                    />
                    <Avatar src={avatar} name={firstName} size={30} />
                    <span className="text-[13px]">
                      {firstName} {lastName}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                className="flex-1 p-2.5 rounded-md bg-[#0084ff] text-white border-none cursor-pointer text-sm"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setSelectedIds([]);
                }}
                className="flex-1 p-2.5 rounded-md bg-[#eee] border-none cursor-pointer text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GROUP SETTINGS MODAL */}
      {showGroupSettingsModal && active?.isGroup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150]"
          onClick={() => {
            setShowGroupSettingsModal(false);
            setGroupProfilePicFile(null);
            setGroupProfilePicPreview(null);
            if (groupProfilePicInputRef.current) {
              groupProfilePicInputRef.current.value = "";
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-0 w-[420px] max-h-[80vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#f0f0f0] bg-[#fafafa]">
              <h2
                className="m-0 text-lg text-[#291D1C] font-bold flex items-center gap-2.5
              "
              >
                <IoSettingsOutline /> Group Settings
              </h2>
              <button
                onClick={() => {
                  setShowGroupSettingsModal(false);
                  setGroupProfilePicFile(null);
                  setGroupProfilePicPreview(null);
                  if (groupProfilePicInputRef.current) {
                    groupProfilePicInputRef.current.value = "";
                  }
                }}
                className="bg-transparent border-none text-2xl cursor-pointer text-[#888]"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {isGroupAdmin && (
                <>
                  <div className="mb-6">
                    <h3 className="m-0 mb-3 text-sm font-bold">
                      📝 Group Name
                    </h3>

                    {isEditingName ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          autoFocus
                          className="flex-1 px-3 py-2 rounded-md border-2 border-[#0084ff] text-sm box-border"
                        />
                        <button
                          onClick={handleUpdateGroupName}
                          className="px-4 py-2 bg-[#0084ff] text-white border-none rounded-md cursor-pointer text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingName(false);
                            setEditingGroupName(active.groupName);
                          }}
                          className="px-4 py-2 bg-[#eee] border-none rounded-md cursor-pointer text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-2.5 bg-[#f9f9f9] rounded-md border border-[#e0e0e0]">
                        <span className="text-sm font-bold">
                          {active?.groupName}
                        </span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="bg-transparent border-none text-[#0084ff] cursor-pointer text-sm font-bold"
                        >
                          ✎ Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="m-0 mb-3 text-sm font-bold">
                      🖼️ Group Profile Picture
                    </h3>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#f0f4ff] flex items-center justify-center overflow-hidden border border-[#d0d8ff]">
                        {groupProfilePicPreview ? (
                          <img
                            src={groupProfilePicPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : active?.groupProfilePic ? (
                          <img
                            src={active.groupProfilePic}
                            alt="Group Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📸</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <input
                          ref={groupProfilePicInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleGroupProfilePicChange}
                          className="hidden"
                        />
                        <button
                          onClick={() =>
                            groupProfilePicInputRef.current?.click()
                          }
                          className="w-full px-3 py-2 bg-[#f0f0f0] border border-[#ddd] rounded-md cursor-pointer text-sm font-bold text-[#333] hover:bg-[#e8e8e8] mb-2"
                        >
                          📁 Choose Image
                        </button>

                        {groupProfilePicFile && (
                          <button
                            onClick={handleUploadGroupProfilePic}
                            disabled={isUploadingGroupPic}
                            className="w-full px-3 py-2 bg-[#0084ff] text-white border-none rounded-md cursor-pointer text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploadingGroupPic ? "Uploading..." : "✓ Upload"}
                          </button>
                        )}
                      </div>
                    </div>

                    {groupProfilePicFile && (
                      <div className="text-[11px] text-[#666] bg-[#f9f9f9] px-2 py-1.5 rounded-md">
                        📄 {groupProfilePicFile.name}
                        <button
                          onClick={() => {
                            setGroupProfilePicFile(null);
                            setGroupProfilePicPreview(null);
                            if (groupProfilePicInputRef.current) {
                              groupProfilePicInputRef.current.value = "";
                            }
                          }}
                          className="ml-2 text-[#ff4757] font-bold cursor-pointer bg-transparent border-none"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mb-6">
                <h3 className="flex items-center gap-2.5 m-0 mb-3 text-sm font-bold">
                  <FaInfoCircle /> Group Info
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-[#f0f4ff] rounded-md text-center">
                    <div className="text-xl font-bold">
                      {active?.participants?.length}
                    </div>
                    <div className="text-[11px] text-[#666]">Members</div>
                  </div>
                  <div className="p-2.5 bg-[#f0f4ff] rounded-md text-center">
                    <div className="text-2xl flex justify-center mt-1">
                      <MdOutlineAdminPanelSettings />{" "}
                    </div>
                    <div className="text-[#666] text-xs">Admin</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2.5 m-0 mb-3 text-sm font-bold">
                  <FaUserFriends /> Members ({active?.participants?.length})
                </h3>

                <div className="max-h-[300px] overflow-y-auto border border-[#e0e0e0] rounded-lg p-2 bg-[#fafafa]">
                  {active?.participants?.map((member) => {
                    const memberObj =
                      typeof member === "object" ? member : { _id: member };
                    const isCurrentUser = memberObj._id === user?._id;

                    return (
                      <MemberItem
                        key={memberObj._id}
                        member={memberObj}
                        onRemove={handleRemoveMember}
                        isAdmin={isGroupAdmin}
                        isCurrentUser={isCurrentUser}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORWARD MESSAGE MODAL */}
      {showForwardModal && forwardingMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-6 w-[380px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="m-0">⤳ Forward Message</h3>
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardingMessage(null);
                }}
                className="bg-transparent border-none text-2xl cursor-pointer text-[#888]"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#f0f4ff] rounded-lg border-l-4 border-[#0084ff]">
              <div className="text-xs text-[#666] mb-1">Original message:</div>
              <div className="text-sm text-[#333] truncate">
                {forwardingMessage.type === "image" ||
                forwardingMessage.type === "video" ||
                forwardingMessage.type === "file"
                  ? `📎 ${forwardingMessage.content || forwardingMessage.type}`
                  : forwardingMessage.content}
              </div>
            </div>

            <p className="m-0 mb-3 text-xs text-[#666] font-bold">
              Select conversation to forward to:
            </p>

            <div className="max-h-[300px] overflow-y-auto mb-4 border border-[#e2e8f0] rounded-lg p-2 bg-[#f9fafb]">
              {list
                .filter((conv) => conv._id !== active._id)
                .map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => handleForwardMessage(conv._id)}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md hover:bg-[#e8f0fe] transition-colors mb-1.5"
                  >
                    {conv.isGroup ? (
                      <div className="w-10 h-10 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-base shrink-0 overflow-hidden border border-[#6c63ff]">
                        {conv.groupProfilePic ? (
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}${conv.groupProfilePic}`}
                            alt={conv.groupName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>#</span>
                        )}
                      </div>
                    ) : (
                      <Avatar
                        src={getOtherParticipant(conv)?.avatar}
                        name={getOtherParticipant(conv)?.firstName}
                        size={40}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#333]">
                        {conv.isGroup
                          ? conv.groupName
                          : getConvDisplayName(conv)}
                      </div>
                      <div className="text-xs text-[#888] truncate">
                        {conv.isGroup
                          ? `${conv.participants?.length || 0} members`
                          : getOtherParticipant(conv)?.onlineStatus === "online"
                            ? "Online"
                            : "Offline"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardingMessage(null);
                }}
                className="flex-1 p-2.5 rounded-md bg-[#eee] border-none cursor-pointer text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>
      <div className="flex flex-row mx-[8vw]">
        <SideBar />

        {/* LEFT CHAT WINDOW  */}
        <div className="mt-[4vw] mx-[1vw] bg-[#FFFFFF] h-[calc(100vh-4vw)] rounded-t-3xl flex-[0.73] flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="sticky top-0  z-10 bg-[#FFF8F0] border border-[#E2BE9F] rounded-full p-2 flex justify-between">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => {
                    if (!active.isGroup) {
                      navigate(`/profile/${getOtherParticipant(active)?._id}`);
                    }
                  }}
                >
                  {active.isGroup ? (
                    <div className="w-[38px] h-[38px] rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-xl overflow-hidden border-2 border-[#6c63ff]">
                      {active?.groupProfilePic ? (
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}${active.groupProfilePic}`}
                          alt="Group"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>#</span>
                      )}
                    </div>
                  ) : (
                    <Avatar
                      src={getOtherParticipant(active)?.avatar}
                      name={getOtherParticipant(active)?.firstName}
                      size={38}
                    />
                  )}
                  <div>
                    <div className="font-bold text-[15px] flex items-center gap-2">
                      {getConvDisplayName(active)}
                      {active.isMutedByUser && (
                        <span
                          className="text-lg"
                          title="This conversation is muted"
                        >
                          <IoVolumeMute />
                        </span>
                      )}
                    </div>
                    {active.isGroup && (
                      <div className="text-[11px] text-[#888]">
                        {active.participants
                          ?.map((p) =>
                            typeof p === "object" ? p.firstName : "",
                          )
                          .join(", ")}
                      </div>
                    )}
                    {!active.isGroup && (
                      <div className="text-[11px] text-[#8C5A3C] flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${getOtherParticipant(active)?.onlineStatus === "online" ? "bg-green-500" : "bg-[#8C5A3C]"}`}
                        />
                        {getOtherParticipant(active)?.onlineStatus === "online"
                          ? "Online"
                          : `Last seen ${getOtherParticipant(active)?.lastSeen ? new Date(getOtherParticipant(active)?.lastSeen).toLocaleDateString() : "offline"}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {active.isGroup && (
                    <button
                      onClick={handleOpenGroupSettings}
                      title="Group settings"
                      className="px-3 py-3 bg-[#f0f0f0] border border-[#ddd] rounded-full cursor-pointer text-base"
                    >
                      <IoSettingsOutline />
                    </button>
                  )}
                  {/* HEADER MENU BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConvMenu({
                        conv: active,
                        convId: active._id,
                        x: e.currentTarget.getBoundingClientRect().right,
                        y: e.currentTarget.getBoundingClientRect().bottom,
                      });
                    }}
                    title="Mute, Archive, etc."
                    className="px-4 py-1.5 bg-[#f0f0f0] border border-[#ddd] rounded-full cursor-pointer text-lg hover:bg-[#e8e8e8]"
                  >
                    ⋮
                  </button>
                </div>
              </div>

              {/* CONTEXT MENU */}
              {showConvMenu && (
                <ConversationMenu
                  conversation={showConvMenu.conv}
                  position={showConvMenu}
                  onClose={() => setShowConvMenu(null)}
                />
              )}
              {activePinned.length > 0 && (
                <div className="bg-[#f0f4ff] border border-[#c7d2fe] rounded-lg px-3 py-2 mb-2 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base">📌</span>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#6366f1] font-bold mb-px">
                        Pinned Message
                        {activePinned.length > 1 && (
                          <span className="text-[#94a3b8] font-normal ml-1.5">
                            {pinnedIndex + 1} / {activePinned.length}
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-[#334155] whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
                        {activePinned[pinnedIndex]?.content}
                      </div>
                      <div className="text-[10px] text-[#94a3b8] mt-px">
                        by {activePinned[pinnedIndex]?.sender?.firstName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activePinned.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setPinnedIndex(
                              (i) =>
                                (i - 1 + activePinned.length) %
                                activePinned.length,
                            )
                          }
                          className="px-2 py-0.5 rounded border border-[#c7d2fe] bg-white cursor-pointer text-[13px] text-[#6366f1]"
                          title="Previous pinned"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            setPinnedIndex((i) => (i + 1) % activePinned.length)
                          }
                          className="px-2 py-0.5 rounded border border-[#c7d2fe] bg-white cursor-pointer text-[13px] text-[#6366f1]"
                          title="Next pinned"
                        >
                          ›
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        handleUnpin(activePinned[pinnedIndex]._id);
                        setPinnedIndex(0);
                      }}
                      className="px-2.5 py-[3px] rounded border border-[#fca5a5] bg-white cursor-pointer text-[11px] text-[#ef4444]"
                      title="Unpin this message"
                    >
                      Unpin
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
                {activeMessages.length === 0 && (
                  <p className="text-[#aaa] text-center mt-10">
                    No messages yet. Say hi!
                  </p>
                )}

                {activeMessages.map((msg) => {
                  const isMe = (msg.sender?._id ?? msg.sender) === user?._id;
                  const isRead = Array.isArray(msg.readBy)
                    ? msg.readBy.some(
                        (r) => r.user?.toString() !== user._id.toString(),
                      )
                    : false;
                  return (
                    <div
                      className={`flex w-full mb-3 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className="relative flex items-end gap-1.5 max-w-[75%]"
                        key={msg._id}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === msg._id ? null : msg._id,
                            );
                          }}
                          className={` w-[27px] flex justify-center h-[27px]   rounded-full bg-slate-300 cursor-pointer text-xl ${isMe ? "mr-2" : "ml-2"}`}
                        >
                          ⋮
                        </button>

                        {openMenuId === msg._id && !msg.isDeleted && (
                          <div
                            className={`w-[6.8vw]  absolute bg-[#FFF8F0] border-2 border-white rounded-md p-3 mt-4 shadow-2xl z-10 top-[60%] animate-fade-in 
                              ${isMe ? "-right-[6%]" : "left-[80%]"}`}
                          >
                            {!activePinned.find((p) => p._id === msg._id) && (
                              <div
                                onClick={() => handlePin(msg)}
                                className="p-2 text-[13px] cursor-pointer text-[#291D1C] bg-slate-200 rounded-md mb-1.5"
                              >
                                <div className="flex gap-2 ">
                                  <span className="mt-0.5">
                                    <ImPushpin />{" "}
                                  </span>
                                  Pin
                                </div>
                              </div>
                            )}
                            {activePinned.find((p) => p._id === msg._id) && (
                              <div
                                onClick={() => {
                                  handleUnpin(msg._id);
                                  setOpenMenuId(null);
                                }}
                                className="p-2 text-[13px] cursor-pointer text-[#291D1C] bg-slate-200 rounded-md mb-1.5"
                              >
                                Unpin message
                              </div>
                            )}

                            <div
                              onClick={() => handleReply(msg)}
                              className="p-2 text-[13px] cursor-pointer text-[#291D1C] bg-slate-200 rounded-md mb-1.5"
                            >
                              <div className="flex gap-2 ">
                                <span className="mt-0.5">
                                  <FaReplyAll />{" "}
                                </span>
                                Reply
                              </div>
                            </div>

                            <div
                              onClick={() => {
                                setForwardingMessage(msg);
                                setShowForwardModal(true);
                                setOpenMenuId(null);
                              }}
                              className="p-2 text-[13px] cursor-pointer text-[#291D1C] bg-slate-200 rounded-md mb-1.5"
                            >
                              <div className="flex gap-2 ">
                                <span className="mt-0.5">
                                  <FaShareAlt />{" "}
                                </span>
                                Share
                              </div>
                            </div>

                            {isMe && msg.type === "text" && (
                              <div
                                onClick={() => handleStartEdit(msg)}
                                className="p-2 text-[13px] cursor-pointer text-[#291D1C ] bg-slate-200 rounded-md mb-1.5"
                              >
                                <div className="flex gap-2 ">
                                  <span className="mt-0.5">
                                    <FaRegEdit />{" "}
                                  </span>
                                  Edit
                                </div>
                              </div>
                            )}
                            {isMe && (
                              <div
                                onClick={() => {
                                  handleDelete(msg, "everyone");
                                  setOpenMenuId(null);
                                }}
                                className="p-2 cursor-pointer text-[13px] text-[#291D1C] bg-slate-200 rounded-md"
                              >
                                <div className="flex gap-2 ">
                                  <span className="mt-0.5">
                                    <MdDeleteForever />{" "}
                                  </span>
                                  Delete
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div
                            className={`flex ${isMe ? "justify-end" : "justify-between"}`}
                          >
                            {active.isGroup && !isMe && (
                              <div className="text-[11px] text-[#6366f1] font-semibold mb-1 ml-1">
                                {msg.sender?.firstName}
                              </div>
                            )}

                            <div className="text-[10px] text-[#aaa] mt-0.5">
                              {msg.isEdited && "edited · "}
                              {new Date(msg.createdAt).toLocaleTimeString()}
                              {isMe && !msg.isDeleted && (
                                <span className="ml-1">
                                  {isRead ? (
                                    <span
                                      className="text-[#0084FF] font-bold"
                                      title="Read"
                                    >
                                      ✓✓
                                    </span>
                                  ) : (
                                    <span className="text-[#aaa]" title="Sent">
                                      ✓
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {msg.replyTo && !msg.replyTo.isDeleted && (
                            <div
                              className={` inline-block max-w-[60%] mb-[-4px] px-2.5 py-1 text-[11px] rounded-t-md border-l-[3px] border-[#6366f1] bg-[#BE8C63]`}
                            >
                              <div
                                className={`font-bold ${
                                  isMe ? "text-[#c7d2fe]" : "text-[#6366f1]"
                                }`}
                              >
                                {msg.replyTo.sender?.firstName}
                              </div>

                              <div className="opacity-85 whitespace-nowrap overflow-hidden text-ellipsis">
                                {msg.replyTo.type === "image" &&
                                msg.replyTo.mediaUrl ? (
                                  <img
                                    src={`${import.meta.env.VITE_SERVER_URL}/${msg.replyTo.mediaUrl}`}
                                    alt="replied image"
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                ) : msg.replyTo.type === "video" &&
                                  msg.replyTo.mediaUrl ? (
                                  <video
                                    src={`${import.meta.env.VITE_SERVER_URL}/${msg.replyTo.mediaUrl}`}
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                ) : msg.replyTo.type === "file" ? (
                                  <span>📄 {msg.replyTo.content}</span>
                                ) : (
                                  msg.replyTo.content
                                )}
                              </div>
                            </div>
                          )}

                          {msg.replyToStory?.storyId && (
                            <div className="inline-block max-w-[60%] mb-[-4px] px-2.5 py-1 text-[11px] rounded-t-md border-l-[3px] border-pink-500 bg-[#fff1f2]">
                              <div className="font-bold text-pink-600">
                                Replied to story
                              </div>

                              {msg.replyToStory.type === "image" &&
                                msg.replyToStory.mediaUrl && (
                                  <img
                                    src={`${import.meta.env.VITE_SERVER_URL}/${msg.replyToStory.mediaUrl}`}
                                    alt="story"
                                    className="h-12 w-12 object-cover rounded mt-1"
                                  />
                                )}

                              {msg.replyToStory.type === "video" &&
                                msg.replyToStory.mediaUrl && (
                                  <div className="h-12 w-12 rounded mt-1 bg-black text-white flex items-center justify-center">
                                    ▶
                                  </div>
                                )}

                              {msg.replyToStory.type === "text" && (
                                <div className="opacity-80 mt-1 line-clamp-2">
                                  {msg.replyToStory.textContent}
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`inline-block  ${
                              active.isGroup ? "bg-[#f8fafc]  rounded-2xl " : ""
                            }`}
                          >
                            {msg.isDeleted ? (
                              <span
                                className={`inline-block px-3 py-1.5 rounded-2xl text-sm 
                                ${isMe ? "bg-gradient-to-br from-[#A7764A] to-[#27261A] text-white" : "bg-gradient-to-br from-[#A7764A] to-[#27261A] text-white"}`}
                              >
                                <i className="opacity-50">
                                  This message was deleted
                                </i>
                              </span>
                            ) : msg.type === "image" && msg.mediaUrl ? (
                              <img
                                src={`${import.meta.env.VITE_SERVER_URL}/${msg.mediaUrl}`}
                                alt="shared image"
                                className="max-w-full max-h-[300px] rounded-xl object-cover cursor-pointer"
                                onClick={() =>
                                  window.open(
                                    `${import.meta.env.VITE_SERVER_URL}/${msg.mediaUrl}`,
                                    "_blank",
                                  )
                                }
                                title="Click to view full image"
                              />
                            ) : msg.type === "video" && msg.mediaUrl ? (
                              <video
                                src={`${import.meta.env.VITE_SERVER_URL}/${msg.mediaUrl}`}
                                className="max-w-full max-h-[300px] rounded-xl object-cover"
                                controls
                              />
                            ) : msg.type === "file" && msg.mediaUrl ? (
                              <a
                                href={`${import.meta.env.VITE_SERVER_URL}/${msg.mediaUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1.5 rounded-xl bg-[#f1f5f9] text-[#4B2E2B] text-[7px] no-underline border border-[#e2e8f0]"
                              >
                                📄 {msg.content}
                              </a>
                            ) : (
                              <div
                                className={`text-[14px] whitespace-pre-wrap break-words block px-3 py-2 rounded-2xl max-w-[320px]
                                            ${isMe ? "bg-blue-400 text-white" : "bg-slate-100 text-slate-800"}`}
                              >
                                {renderTextWithLinks(msg.content)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    {typingUsers.map((u) => u.name).join(", ")}
                    {typingUsers.length === 1 ? " is typing" : " are typing"}...
                  </span>
                </div>
              )}

              {previewFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap px-2.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg mb-2">
                  {previewFiles.map((pf, i) => (
                    <div key={i} className="relative">
                      {pf.type === "image" && (
                        <img
                          src={pf.url}
                          alt={pf.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}

                      {pf.type === "video" && (
                        <video
                          src={pf.url}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}

                      {pf.type === "file" && (
                        <div className="w-20 h-20 bg-[#e8f0fe] rounded-md flex flex-col items-center justify-center p-1">
                          <span className="text-2xl">📄 </span>
                          <span className="text-[9px] text-center text-[#475569] break-all max-w-[72px]">
                            {pf.name.length > 12
                              ? pf.name.slice(0, 10) + "..."
                              : pf.name}
                          </span>
                          <span className="text-[9px] text-[#94a3b8]">
                            {pf.size}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => removePreviewFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#ef4444] text-white border-none cursor-pointer text-[11px] leading-none flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={handleSendMedia}
                    className="self-end px-3.5 py-1.5 rounded-md bg-[#0084ff] text-white border-none cursor-pointer text-[13px]"
                  >
                    Send{" "}
                    {previewFiles.length > 1 ? `(${previewFiles.length})` : ""}
                  </button>
                </div>
              )}

              {replyingTo && (
                <div className="flex items-center justify-between bg-[#f0f4ff] border border-[#c7d2fe] rounded-lg px-3 py-1.5 mb-1.5">
                  <div className="border-l-[3px] border-[#6366f1] pl-2">
                    <div className="text-[10px] text-[#6366f1] font-bold">
                      Replying to {replyingTo.sender?.firstName ?? ""}
                    </div>
                    <div className="text-xs text-[#475569]">
                      {replyingTo.type !== "text"
                        ? `📎 ${replyingTo.mediaName || replyingTo.type}`
                        : replyingTo.content?.slice(0, 60)}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="bg-transparent border-none cursor-pointer text-lg text-[#94a3b8]"
                  >
                    ×
                  </button>
                </div>
              )}

              {editingMsg && (
                <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-lg px-3 py-2 mb-1.5">
                  <div className="text-[10px] text-[#d97706] font-bold mb-1">
                    ✏️ Editing message
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") {
                          setEditingMsg(null);
                          setEditText("");
                        }
                      }}
                      autoFocus
                      className="flex-1 p-[7px] text-[13px] rounded-md border border-[#fcd34d]"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 rounded-md bg-[#f59e0b] text-white border-none cursor-pointer text-[13px]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingMsg(null);
                        setEditText("");
                      }}
                      className="px-3 py-1.5 rounded-md bg-[#e5e7eb] border-none cursor-pointer text-[13px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="sticky bottom-0 bg-[#FFF8F0] flex items-center gap-2 p-2 border-t border-[#ccc]">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.docx,.xlsx,.zip,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  className="px-2.5 py-1.5 rounded-md bg-[#f1f5f9] border border-[#e2e8f0] cursor-pointer text-lg leading-none"
                >
                  <CiFileOn />
                </button>

                <div className="relative">
                  <MdEmojiEmotions
                    className="text-amber-600 text-2xl cursor-pointer"
                    title="Pick an Emoji"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmojiPicker((p) => !p);
                    }}
                  />
                  {showEmojiPicker && (
                    <div
                      className="absolute bottom-10 left-0 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji) =>
                          setText((p) => p + emoji.native)
                        }
                      />
                    </div>
                  )}
                </div>

                <input
                  value={text}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !selectedFiles.length && handleSend()
                  }
                  placeholder="Type a message..."
                  className="flex-1 p-2 text-sm rounded-md border border-[#ccc]"
                />

                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className={`px-5 py-2 rounded-md text-white border-none ${text.trim() ? "bg-[#0084ff] cursor-pointer" : "bg-[#cbd5e1] cursor-default"}`}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <RecentConversations />
          )}
        </div>

        {/* RIGHT SIDEBAR WITH SEARCH */}
        <div
          className="fixed mt-[3.5vw] right-[8vw] w-[260px] bg-[#FFFFFF] border-r border-[#F4E8DC] flex flex-col"
          style={{ height: "calc(100vh - 3.5vw)" }}
        >
          {/* SEARCH BAR */}
          <div className="px-3 pt-3 pb-2 border-b border-[#F4E8DC] search-container relative">
            <div className="relative">
              <IoSearchSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-base" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2
                bg-[#FFF8F0] text-[#291d1c]
                text-sm border border-[#ddd] rounded-full"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#0084ff] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* SEARCH RESULTS DROPDOWN */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-[#ddd] rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-50">
                <div className="p-2">
                  <div className="text-[10px] text-[#888] font-bold mb-2 px-2">
                    SEARCH RESULTS ({searchResults.length})
                  </div>
                  {searchResults.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => handleSearchResultClick(conv)}
                      className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-md hover:bg-[#f0f4ff] transition-colors"
                    >
                      {conv.isGroup ? (
                        <div className="w-9 h-9 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-base shrink-0 overflow-hidden border border-[#6c63ff]">
                          {conv.groupProfilePic ? (
                            <img
                              src={`${import.meta.env.VITE_SERVER_URL}${conv.groupProfilePic}`}
                              alt={conv.groupName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>#</span>
                          )}
                        </div>
                      ) : (
                        <Avatar
                          src={getConvAvatar(conv)}
                          name={getConvDisplayName(conv)}
                        />
                      )}
                      <div className="overflow-hidden flex-1">
                        <div className="font-bold text-[13px] truncate">
                          {getConvDisplayName(conv)}
                        </div>
                        {conv.isGroup && (
                          <div className="text-[10px] text-[#6c63ff]">
                            Group · {conv.participants?.length} members
                          </div>
                        )}
                        {conv.lastMessage && (
                          <div className="text-[11px] text-[#888] truncate">
                            {conv.lastMessage.content}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NO RESULTS MESSAGE */}
            {showSearchResults &&
              searchQuery &&
              searchResults.length === 0 &&
              !isSearching && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-[#ddd] rounded-lg shadow-lg p-4 z-50">
                  <div className="text-center text-[#888] text-sm">
                    No conversations found for "{searchQuery}"
                  </div>
                </div>
              )}
          </div>

          {/* FRIENDS SECTION */}
          <div className="flex flex-col flex-1 min-h-0 bg-[#FFFFFF]">
            <div className="px-3 pt-3 pb-1.5 flex justify-between items-center shrink-0">
              <h4 className="m-0 text-[#555] gap-3 flex">
                {" "}
                <span className="mt-1">
                  <FaUserFriends />{" "}
                </span>{" "}
                Friends
              </h4>
              <button
                onClick={() => setShowGroupModal(true)}
                title="Create group"
                className="text-[11px] px-2 py-[3px] rounded-full bg-gradient-to-br from-[#A7764A] to-[#27261A] text-white border-none cursor-pointer"
              >
                + Group
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 scroll-smooth">
              {(!user?.friends || user.friends.length === 0) && (
                <p className="px-3 py-0 text-[#aaa] text-xs">No friends yet.</p>
              )}
              {user?.friends?.map((friend) => {
                const friendId =
                  typeof friend === "object" ? friend._id : friend;
                const firstName =
                  typeof friend === "object" ? friend.firstName : "User";
                const lastName =
                  typeof friend === "object" ? friend.lastName : "";
                const avatar =
                  typeof friend === "object" ? friend.avatar : null;
                return (
                  <div
                    key={friendId}
                    onClick={() => handleFriendClick(friendId)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-full mx-1.5 my-0.5 ${active && getOtherParticipant(active)?._id === friendId ? "bg-[#FFF8F0]" : "bg-transparent"}`}
                  >
                    <Avatar src={avatar} name={firstName} />
                    <div className="font-semibold text-[14px]  text-[#4B2E2B]">
                      {firstName} {lastName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT CHATS SECTION */}
          <div className="flex flex-col flex-1 min-h-0 border-t-2 border-[#F4E8DC]">
            <div className="px-3 pt-2.5 pb-1 shrink-0 flex justify-between items-center">
              <h4 className="m-0 flex gap-3 text-[#555]">
                <span className="mt-1">
                  <RiChat1Fill />
                </span>{" "}
                Recent Chats
              </h4>
              <button
                onClick={() => {
                  setShowArchived(!showArchived);
                  if (!showArchived) dispatch(fetchArchivedConversations());
                }}
                className="text-[11px] px-2 py-1 rounded-full bg-[#f0f0f0] border border-[#ddd] cursor-pointer hover:bg-[#e0e0e0]"
                title="View archived"
              >
                <span className="flex gap-2">
                  <span className="mt-0.5">
                    <IoArchiveOutline />{" "}
                  </span>
                  ({archivedList.length})
                </span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 scroll-smooth">
              {showArchived ? (
                // ARCHIVED CHATS VIEW
                archivedList.length === 0 ? (
                  <p className="px-3 py-2 text-[#aaa] text-xs">
                    No archived chats.
                  </p>
                ) : (
                  archivedList.map((conv) => (
                    <div
                      key={conv._id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-full mx-1.5 my-0.5 bg-[#f9f9f9] hover:bg-[#FFF8F0] relative group"
                      onClick={() => {
                        dispatch(setActiveConversation(conv));
                        // setShowArchived(false);
                      }}
                    >
                      {conv.isGroup ? (
                        <div className="w-9 h-9 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-base shrink-0 overflow-hidden border border-[#6c63ff]">
                          {conv.groupProfilePic ? (
                            <img
                              src={`${import.meta.env.VITE_SERVER_URL}${conv.groupProfilePic}`}
                              alt={conv.groupName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>#</span>
                          )}
                        </div>
                      ) : (
                        <Avatar
                          src={getConvAvatar(conv)}
                          name={getConvDisplayName(conv)}
                        />
                      )}
                      <div className="overflow-hidden flex-1">
                        <div className="font-bold text-[13px]">
                          {getConvDisplayName(conv)}
                        </div>
                        <div className="text-[11px] text-[#888] whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                          {conv.lastMessage?.content ?? "No messages"}
                        </div>
                      </div>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleUnarchiveConversation(conv._id);
                          dispatch(fetchArchivedConversations());
                          dispatch(fetchConversations());
                        }}
                        className="text-[11px] px-2 py-1 rounded bg-[#6c63ff] text-white border-none cursor-pointer hover:bg-[#5a52cc]"
                        title="Unarchive"
                      >
                        ↩
                      </button>
                    </div>
                  ))
                )
              ) : (
                // ACTIVE CHATS VIEW
                list.map((conv) => (
                  <div
                    key={conv._id}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-full mx-1.5 my-0.5 relative group"
                    onClick={() => dispatch(setActiveConversation(conv))}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setShowConvMenu({
                        conv: conv,
                        convId: conv._id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    style={{
                      backgroundColor:
                        active?._id === conv._id ? "#FFF8F0" : "transparent",
                    }}
                  >
                    {conv.isGroup ? (
                      <div className="w-9 h-9 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-base shrink-0 overflow-hidden border border-[#6c63ff]">
                        {conv.groupProfilePic ? (
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}${conv.groupProfilePic}`}
                            alt={conv.groupName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>#</span>
                        )}
                      </div>
                    ) : (
                      <Avatar
                        src={getConvAvatar(conv)}
                        name={getConvDisplayName(conv)}
                      />
                    )}

                    <div className="overflow-hidden flex-1">
                      <div className="font-semibold text-[#4B2E2B] text-[14px] flex items-center gap-1">
                        {getConvDisplayName(conv)}
                        {conv.isMutedByUser && (
                          <span title="Muted">
                            <IoVolumeMute />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#888] whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                        {conv.lastMessage?.content ?? "No messages yet"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CLOSE MENU ON OUTSIDE CLICK */}
          {showConvMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowConvMenu(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
