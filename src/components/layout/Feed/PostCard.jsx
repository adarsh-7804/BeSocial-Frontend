import { selectUser } from "../../../features/userSlice";
import { getImageUrl } from "../../../utils/getImageUrl";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleLike,
  addComment,
  deletePost,
  replyComment,
  votePoll,
  reactToPost,
  sharePost,
  fetchReactions,
  selectUserReactions,
  selectReactionsList,
  selectReactionsLoading,
  updateViewCount,
  pinPost,
  unpinPost,
} from "../../../features/postsSlice";
import {
  savePostThunk,
  unsavePostThunk,
  selectIsPostSaved,
  selectSavingPostId,
} from "../../../features/savedPostsSlice";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  AiOutlineEllipsis,
  AiOutlineEye,
  AiOutlinePushpin,
} from "react-icons/ai";
import { FcLike } from "react-icons/fc";
import { CiHeart, CiChat1, CiShare2, CiBookmark } from "react-icons/ci";
import { MdEmojiEmotions } from "react-icons/md";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Poll from "./style/Poll";
import { toast } from "react-toastify";
import { AiOutlineDelete } from "react-icons/ai";
import { deleteComment, deleteReply } from "../../../features/postsSlice";
import CommentReplies from "./CommentReplies";
import { FaBookmark } from "react-icons/fa6";
import {
  FaRegThumbsUp,
  FaLaughSquint,
  FaGrin,
  FaSurprise,
  FaSadCry,
  FaAngry,
} from "react-icons/fa";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  markNotInterestedThunk,
  undoNotInterestedThunk,
  selectIsPostHidden,
} from "../../../features/notInterestedSlice";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const calculateAge = (dob) => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const renderTextWithMentions = (text, mentions, navigate) => {
  if (!text || !mentions?.length) return text;

  const mentionMap = {};
  mentions.forEach((m) => {
    if (m?.name && m?.user?._id) {
      mentionMap[m.name.toLowerCase()] = m.user._id;
    }
  });

  const parts = text.split(/(@[\w\s]+?)(?=\s{2,}|[^a-zA-Z\s]|$)/g);

  return parts.map((part, i) => {
    if (!part.startsWith("@")) return part;

    const nameKey = part.slice(1).trim().toLowerCase();
    const userId = mentionMap[nameKey];

    if (!userId) return part;

    return (
      <span
        key={i}
        onClick={() => navigate(`/profile/${userId}`)}
        className="text-amber-700 font-semibold cursor-pointer hover:underline hover:text-amber-900 transition-colors"
      >
        {part}
      </span>
    );
  });
};

const renderTextWithLinks = (text) => {
  if (!text) return "";

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const navigate = useNavigate();

  const isHidden = useSelector(selectIsPostHidden(post._id));
  const niLoading = useSelector((state) => state.notInterested.loading);

  const handleNotInterested = async () => {
    setShowMenu(false);
    const result = await dispatch(markNotInterestedThunk(post._id));

    if (markNotInterestedThunk.fulfilled.match(result)) {
      toast(
        <div className="flex items-center justify-between gap-3 w-full">
          <span className="text-sm">Post hidden</span>
        </div>,
        {
          toastId: "ni-toast",
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
          style: {
            background: "#2C1A0E",
            color: "#FFD6A8",
            border: "1px solid rgba(192,133,82,0.3)",
          },
        },
      );
    }
  };

  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [reply, setReply] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingToReply, setReplyingToReply] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openReplies, setOpenReplies] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [pickerTimeout, setPickerTimeout] = useState(null);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [viewReported, setViewReported] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const viewTimerRef = useRef(null);

  useEffect(() => {}, [post.mentions]);

  useEffect(() => {
    setViewReported(false);
    setIsVideoVisible(false);
    videoRef.current = null;
  }, [currentIndex, post._id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVideoVisible(true);
            console.log(`Video ${post._id} is now VISIBLE in viewport`);
          } else {
            setIsVideoVisible(false);
            console.log(`Video ${post._id} is now HIDDEN from viewport`);

            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "0px",
      },
    );

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
      observer.disconnect();
    };
  }, [post._id]);

  const userAge = calculateAge(currentUser?.dob);

  const isRestricted = post.isAdult && userAge < 18;

  const userReactions = useSelector(selectUserReactions);
  const myReaction = userReactions[post._id] || null;
  const reactionsList = useSelector(selectReactionsList(post._id));
  const reactionsLoading = useSelector(selectReactionsLoading);

  const REACTIONS = [
    { type: "like", emoji: <FaRegThumbsUp />, label: "Like", color: "#3b82f6" },
    { type: "love", emoji: <FcLike />, label: "Love", color: "#ef4444" },
    { type: "haha", emoji: <FaLaughSquint />, label: "Haha", color: "#F6DC3B" },
    { type: "wow", emoji: <FaSurprise />, label: "Wow", color: "#F6DC3B" },
    { type: "sad", emoji: <FaSadCry />, label: "Sad", color: "#3b82f6" },
    { type: "angry", emoji: <FaAngry />, label: "Angry", color: "#F50A1B" },
  ];

  const totalMedia = post.media?.length || 0;
  const hasMultipleMedia = totalMedia > 1;
  const GoLeft = currentIndex > 0;
  const GoRight = currentIndex < totalMedia - 1;

  const isLiked = post.likesCount > 0;
  const isOwner = currentUser?._id === post.user?._id;

  // Saved posts state
  const isSaved = useSelector(selectIsPostSaved(post._id));
  const savingPostId = useSelector(selectSavingPostId);
  const isSaving = savingPostId === post._id;

  const handleSaveToggle = async () => {
    if (isSaving) return;

    if (isSaved) {
      await dispatch(unsavePostThunk(post._id));
    } else {
      await dispatch(savePostThunk(post._id));
    }
  };

  const handleUserClick = () => {
    if (!post.user?._id) return;
    navigate(`/profile/${post.user._id}`);
  };

  const handleLeftClick = () => {
    if (GoLeft) setCurrentIndex((prev) => prev - 1);
  };

  const handleRightClick = () => {
    if (GoRight) setCurrentIndex((prev) => prev + 1);
  };

  const handlePostDoubleClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    dispatch(addComment({ postId: post._id, text: comment }));
    setComment("");
  };

  const reportView = async (duration) => {
    if (!isVideoVisible) {
      console.log(
        `View NOT reported - Video ${post._id} is NOT visible in viewport`,
      );
      return;
    }

    const currentMedia = post.media?.[currentIndex];
    if (currentMedia?.type !== "video") {
      console.log("View NOT reported - Not a video media type");
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      console.log(
        ` Sending view request for post ${post._id} with duration ${duration}s (Visible)`,
      );

      const response = await fetch(`${apiBaseUrl}/api/posts/${post._id}/view`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          duration: Math.round(duration),
        }),
      });

      const data = await response.json();
      console.log(" View reported successfully:", data);

      if (data.views !== undefined) {
        dispatch(
          updateViewCount({
            postId: post._id,
            viewCount: data.views,
          }),
        );
        console.log(" View count updated in Redux:", data.views);
      }

      return data;
    } catch (error) {
      console.error(" Failed to report view:", error);
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    dispatch(
      replyComment({ postId: post._id, commentId: replyingTo, text: reply }),
    );
    setReply("");
    setReplyingTo(null);
    setReplyingToReply(null);
  };

  const handleReplyClick = (commentId, user, replyId = null) => {
    const mention = `@${user.firstName} ${user.lastName} `;
    const isSame = replyingTo === commentId && replyingToReply === replyId;

    if (isSame) {
      setReplyingTo(null);
      setReplyingToReply(null);
      setReply("");
    } else {
      setReplyingTo(commentId);
      setReplyingToReply(replyId);
      setReply((prev) => (prev.startsWith(mention) ? prev : mention));
    }
  };

  const toggleReplies = (commentId) => {
    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleDeleteComment = (commentId) => {
    dispatch(deleteComment({ postId: post._id, commentId }));
  };

  const handleDeleteReply = (commentId, replyId) => {
    dispatch(deleteReply({ postId: post._id, commentId, replyId }));
  };

  const openDeleteModal = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(deletePost(post._id));
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast.success("Link copied to clipboard!", {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            background: "#2C1A0E",
            color: "#FFD6A8",
            border: "1px solid rgba(192,133,82,0.3)",
          },
        });
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        const textArea = document.createElement("textarea");
        textArea.value = postUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!", {
          position: "bottom-center",
          autoClose: 2500,
          theme: "colored",
          style: {
            background: "#2C1A0E",
            color: "#FFD6A8",
            border: "1px solid rgba(192,133,82,0.3)",
          },
        });
      });
    setShowMenu(false);
  };

  const handleShare = async () => {
    dispatch(sharePost(post._id));

    handleCopyLink();
  };

  const handlePin = async () => {
    await dispatch(pinPost(post._id));
    setShowMenu(false);
    toast.success("Post pinned to top of feed!", {
      position: "top-right",
      autoClose: 2500,
      theme: "colored",
      style: {
        background: "#2C1A0E",
        color: "#FFD6A8",
        border: "1px solid rgba(192,133,82,0.3)",
      },
    });
  };

  const handleUnpin = async () => {
    await dispatch(unpinPost(post._id));
    setShowMenu(false);
    toast.success("Post unpinned!", {
      position: "top-right",
      autoClose: 2500,
      theme: "colored",
      style: {
        background: "#2C1A0E",
        color: "#FFD6A8",
        border: "1px solid rgba(192,133,82,0.3)",
      },
    });
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getDate = (date) => new Date(date).toLocaleDateString();

  // const getMediaUrl = (mediaItem) => {
  //   if (mediaItem?.image?.medium) {
  //     const path = mediaItem.image.medium;
  //     return `${import.meta.env.VITE_SERVER_URL}/${path.replace(/\\/g, "/")}`;
  //   }

  //   if (mediaItem?.image?.full) {
  //     const path = mediaItem.image.full;
  //     return `${import.meta.env.VITE_SERVER_URL}/${path.replace(/\\/g, "/")}`;
  //   }

  //   if(mediaItem?.video?.variants) {
  //     const variants = mediaItem.video.variants;

  //     const videoPath = variants["720p"] || variants["360p"] || variants["1080p"]

  //     if(videoPath) {
  //       return `${import.meta.env.VITE_SERVER_URL}/${videoPath.replace(/\\/g, "/")}`
  //     }
  //   }

  //   if (mediaItem?.video?.thumbnail) {
  //     const path = mediaItem.video.thumbnail;
  //     return `${import.meta.env.VITE_SERVER_URL}/${path.replace(/\\/g, "/")}`;
  //   }

  //   if (mediaItem?.url) {
  //     return `${import.meta.env.VITE_SERVER_URL}/${mediaItem.url.replace(/\\/g, "/")}`;
  //   }

  //   return "";
  // };

  const getMediaUrl = (mediaItem) => {
    if (!mediaItem) return "";

    if (mediaItem?.image?.medium) return getImageUrl(mediaItem.image.medium);
    if (mediaItem?.image?.full) return getImageUrl(mediaItem.image.full);
    if (mediaItem?.image?.thumbnail) return getImageUrl(mediaItem.image.thumbnail);

    if (mediaItem?.video?.variants) {
      const v = mediaItem.video.variants;
      const videoPath = v["720p"] || v["360p"] || v["1080p"];
      if (videoPath) return getImageUrl(videoPath);
    }
    if (mediaItem?.video?.thumbnail) return getImageUrl(mediaItem.video.thumbnail);

    if (mediaItem?.url) return getImageUrl(mediaItem.url);

    return "";
  };

  const parseLocation = (loc) => {
    if (!loc) return null;
    try {
      const match = loc.match(/maps\/place\/([^/@]+)/);
      if (match) return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch (_) {}
    return loc;
  };

  const handleVote = async (postId, optionIndex) => {
    await dispatch(votePoll({ postId, optionIndex }));
  };

  const renderMedia = (mediaItem, index) => {
    const url = getMediaUrl(mediaItem);
    const isVideo = mediaItem?.type === "video";
    const isGif = mediaItem?.type === "gif";

    if (isVideo) {
      const thumbnailUrl = mediaItem?.video?.thumbnail
        ? getImageUrl(mediaItem.video.thumbnail)
        : mediaItem?.thumbnailUrl
          ? getImageUrl(mediaItem.thumbnailUrl)
          : url;

      const availableQualities = mediaItem?.video?.variants
        ? Object.keys(mediaItem.video.variants).sort(
            (a, b) => parseInt(b) - parseInt(a),
          )
        : [];

      console.log("Video render:", {
        hasThumb: !!mediaItem?.thumbnailUrl,
        thumbnailUrl,
      });

      return (
        <div key={index} className="relative w-full h-full group">
          <video
            ref={(el) => {
              videoRef.current = el;
            }}
            src={url}
            controls
            className="w-full h-full object-cover"
            poster={thumbnailUrl}
            onPlay={() => handlePlayVideo(post._id)}
            onTimeUpdate={(e) => {
              const currentTime = e.currentTarget.currentTime;

              if (currentTime >= 2 && !viewReported && isVideoVisible) {
                console.log(
                  `⏱️ Video reached ${currentTime}s and is VISIBLE - reporting view`,
                );
                reportView(currentTime);
                setViewReported(true);
              }
            }}
            onPause={() => {
              console.log(" Video paused");
            }}
          />

          {availableQualities.length > 1 && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="bg-black/60 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                ⚙️ {selectedQuality}
              </button>

              {showQualityMenu && (
                <div className="absolute top-full right-0 mt-2 bg-black/90 rounded-lg overflow-hidden shadow-lg min-w-[100px] cursor-pointer">
                  {availableQualities.map((quality) => (
                    <button
                      key={quality}
                      onClick={() => handleQualitySwitch(quality)}
                      className={`block w-full px-4 py-2 text-xs font-medium text-left transition-colors ${
                        selectedQuality === quality
                          ? "bg-amber-600 text-white"
                          : "bg-black/70 text-gray-200 hover:bg-black/80"
                      }`}
                    >
                      {quality} {selectedQuality === quality && "✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      // <Zoom>
      <img
        key={index}
        src={url}
        alt={`post ${index + 1}`}
        className="w-full h-full object-cover"
      />
      // </Zoom>
    );
  };

  const removeHashtags = (text) => {
    if (!text || typeof text !== "string") return "";
    return text.replace(/#\w+/g, "").replace(/\s+/g, " ").trim();
  };

  const reactionEmojis = {
    like: <FaRegThumbsUp />,
    love: <FcLike />,
    haha: <FaLaughSquint />,
    wow: <FaSurprise />,
    sad: <FaSadCry />,
    angry: <FaAngry />,
  };

  const handleMouseEnterLike = () => {
    if (pickerTimeout) clearTimeout(pickerTimeout);
    setShowReactionPicker(true);
  };

  const handleMouseLeaveLike = () => {
    const t = setTimeout(() => setShowReactionPicker(false), 400);
    setPickerTimeout(t);
  };

  const handleReact = (type) => {
    dispatch(reactToPost({ postId: post._id, type }));
    setShowReactionPicker(false);
  };

  const handleOpenReactions = () => {
    dispatch(fetchReactions(post._id));
    setShowReactionsModal(true);
  };

  const handleEmojiClick = (emojiData) => {
    setComment((prev) => prev + emojiData.emoji);
  };

  const handlePlayVideo = (postId) => {
    console.log(`Video started playing for post ${postId}`);
  };

  const handleQualitySwitch = (quality) => {
    setSelectedQuality(quality);
    if (videoRef.current) {
      const variants = post.media[currentIndex]?.video?.variants;
      const newSrc = variants?.[quality];
      if (newSrc) {
        const currentTime = videoRef.current.currentTime;
        const wasPlaying = !videoRef.current.paused;
        const src =
          newSrc.startsWith("http://") || newSrc.startsWith("https://")
            ? newSrc
            : `${import.meta.env.VITE_SERVER_URL}/${newSrc.replace(/\\/g, "/")}`;
        videoRef.current.src = src;
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current
            .play()
            .catch((err) => console.log("Auto-play prevented", err));
        }
        console.log(`Switched to ${quality}p quality`);
      }
      setShowQualityMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowEmojiPicker(false);
    if (showEmojiPicker) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showEmojiPicker]);

  const posts = useSelector((state) => state.feed.posts);
  const postState = useSelector((state) => state.posts);

  const updatedPost = useMemo(() => {
    const found = posts.find((p) => p._id === post._id);
    return found || post;
  }, [posts, post._id]);

  useEffect(() => {}, [updatedPost]);

  const cleanCaption = removeHashtags(post.caption);
  const cleanContent = removeHashtags(post.content);

  return (
    <div className="font-sans w-full md:max-w-[468px] mx-auto bg-white border border-[#E8D5C0] rounded-2xl overflow-hidden shadow-md">
      {/*  HEADER  */}
      <div className=" flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <div
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition"
          onClick={handleUserClick}
        >
          <div className="relative">
            <img
              src={getImageUrl(post.user?.avatar)}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-600 block"
            />
            <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div>
            <p className="m-0 font-bold text-sm text-amber-950 capitalize flex items-center gap-2">
              {post.user
                ? `${post.user.firstName} ${post.user.lastName}`
                : "User"}{" "}
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-amber-900 text-xs font-bold rounded-full">
                  <AiOutlinePushpin className="text-sm" /> PINNED
                </span>
              )}
              {post.isAdvertisement && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full">
                  📢 ADVERTISEMENT
                </span>
              )}
              <span className="ml-0.5 text-[11px] text-amber-700 font-normal ">
                · {timeAgo(post.createdAt)} ago
              </span>
            </p>
            <p className="m-0 text-xs text-amber-700">
              {getDate(post.createdAt)}{" "}
              {post.location?.name && (
                <span className="ml-1 text-xs text-amber-700">
                  {" · "}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parseLocation(post.location.name))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-900 hover:underline cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 {parseLocation(post.location.name)}
                  </a>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="">
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={post.allowDownload === false}
            title={
              post.allowDownload === false
                ? "Downloads are blocked on this post"
                : ""
            }
            className={`bg-transparent border-none p-1.5 rounded-lg text-xl transition-colors flex items-center ${
              post.allowDownload === false
                ? "text-gray-400 cursor-not-allowed opacity-50"
                : "cursor-pointer text-amber-800 hover:bg-amber-900/10"
            }`}
          >
            <AiOutlineEllipsis />
          </button>

          {showMenu && post.allowDownload !== false && (
            <div className="absolute  top-11 -right-10 mt-1 bg-white border border-amber-200 rounded-xl min-w-[140px] shadow-lg z-10 overflow-hidden animate-fade-in">
              {isOwner && (
                <>
                  {!post.isPinned ? (
                    <button
                      onClick={handlePin}
                      className="block w-full px-4 py-2.5 bg-transparent border-none text-left text-amber-900 text-sm font-medium cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      📌 Pin post
                    </button>
                  ) : (
                    <button
                      onClick={handleUnpin}
                      className="block w-full px-4 py-2.5 bg-transparent border-none text-left text-amber-900 text-sm font-medium cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      📌 Unpin post
                    </button>
                  )}
                  <button
                    onClick={openDeleteModal}
                    className="block w-full px-4 py-2.5 bg-transparent border-none text-left text-red-500 text-sm font-semibold cursor-pointer hover:bg-red-50 transition-colors"
                  >
                    <div className="flex gap-x-0.5">
                      <img
                        src="https://www.gstatic.com/android/keyboard/emojikitchen/20230803/u1f5d1-ufe0f/u1f5d1-ufe0f_u1f6cd-ufe0f.png?fbx"
                        className="w-5 h-5 "
                      ></img>{" "}
                      Delete post
                    </div>
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="block w-full px-4 py-2.5 bg-transparent border-none text-left text-amber-900 text-sm font-medium cursor-pointer hover:bg-amber-50 transition-colors"
              >
                🔗 Copy link
              </button>

              {!isOwner && (
                <button
                  onClick={handleNotInterested}
                  disabled={niLoading || isHidden}
                  className="block w-full px-4 py-2.5 bg-transparent border-none text-left text-amber-900 text-sm font-medium cursor-pointer hover:bg-amber-50 transition-colors disabled:opacity-50"
                >
                  😵 Hide
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className={isRestricted ? "blur-md pointer-events-none" : ""}>
          {/*  CONTENT */}
          {!isRestricted && (
            <>
              {cleanContent && (
                <div className="px-4 pb-2">
                  <p className="m-0 text-sm text-amber-950 leading-relaxed">
                    {renderTextWithMentions(
                      cleanContent,
                      post.mentions,
                      navigate,
                    )}
                  </p>
                </div>
              )}

              {/* MEDIA */}

              {post.media && post.media.length > 0 && (
                <div
                  ref={containerRef}
                  className="relative w-full aspect-square bg-black overflow-visible cursor-pointer group"
                  onDoubleClick={handlePostDoubleClick}
                >
                  {/* CURRENT IMAGE */}
                  {renderMedia(post.media[currentIndex], currentIndex)}

                  {/* DOWNLOAD BLOCKED OVERLAY */}
                  {post.allowDownload === false && (
                    <div className="absolute h-[2vw] w-[10%] left-[90%] top-[87%]  inset-0  flex flex-col items-center justify-center z-40 cursor-not-allowed">
                      <div className="text-center"></div>
                    </div>
                  )}

                  {/* LEFT ARROW */}
                  {currentIndex > 0 && (
                    <button
                      onClick={handleLeftClick}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                    >
                      <IoChevronBack />
                    </button>
                  )}

                  {/* RIGHT ARROW */}
                  {currentIndex < post.media.length - 1 && (
                    <button
                      onClick={handleRightClick}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                    >
                      <IoChevronForward />
                    </button>
                  )}

                  {/* DOTS */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {post.media.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i === currentIndex ? "bg-white" : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Age Restricted Curtain */}
          {isRestricted && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center text-white z-20 px-4">
              <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                i
              </div>

              <h2 className="text-lg font-semibold">Restricted Post</h2>

              <p className="text-sm text-gray-300 mt-2">
                You must be 18 years or older to see this post.
              </p>

              <button className="mt-4 px-4 py-2 bg-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-600">
                Continue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Poll Voting */}

      <div className="w-[95%] ml-3">
        {post.poll && <Poll post={post} onVote={handleVote} />}
      </div>

      {/*  ACTION ROW  */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className="flex gap-0.5 w-full">
          {/* Like with reaction picker */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterLike}
            onMouseLeave={handleMouseLeaveLike}
          >
            {/* Reaction Picker Popup */}
            {showReactionPicker && (
              <div
                className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white border border-amber-200 rounded-full px-2 py-1.5 shadow-lg z-20"
                onMouseEnter={handleMouseEnterLike}
                onMouseLeave={handleMouseLeaveLike}
              >
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => handleReact(r.type)}
                    title={r.label}
                    className="text-xl bg-transparent border-none cursor-pointer p-1 rounded-full hover:scale-125 hover:bg-amber-50 transition-transform duration-150"
                    style={{ lineHeight: 1 }}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Like Button */}
            <button
              onClick={() =>
                dispatch(
                  reactToPost({ postId: post._id, type: myReaction || "like" }),
                )
              }
              className="bg-transparent border-none cursor-pointer flex items-center gap-0.5 py-1.5 px-1.5 rounded-lg hover:bg-amber-900/10 transition-colors text-sm scale-90 font-medium"
              style={{
                color: myReaction
                  ? REACTIONS.find((r) => r.type === myReaction)?.color ||
                    "#92400e"
                  : "#92400e",
              }}
            >
              <span
                className={`text-xl transition-transform duration-200 ${
                  myReaction ? "scale-110" : "scale-100"
                }`}
                style={{ lineHeight: 1 }}
              >
                {myReaction ? (
                  reactionEmojis[myReaction]
                ) : (
                  <CiHeart className="text-amber-900" />
                )}
              </span>
            </button>
          </div>

          {updatedPost.likesCount > 0 ? (
            <button
              onClick={handleOpenReactions}
              className="bg-transparent border-none cursor-pointer flex items-center gap-0 py-1.5 px- rounded-lg hover:bg-amber-900/10 transition-colors text-sm font-medium text-amber-900"
            >
              {updatedPost.likesCount}
            </button>
          ) : (
            <button
              onClick={handleOpenReactions}
              className="bg-transparent border-none cursor-pointer flex items-center gap-0 py-1.5  rounded-lg hover:bg-amber-900/10 transition-colors text-sm font-medium text-amber-900"
            >
              0
            </button>
          )}

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="bg-transparent border-none cursor-pointer flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-amber-900/10 transition-colors text-sm font-medium text-amber-900"
          >
            <span className="text-lg">
              <CiChat1 />
            </span>
            <span>
              {updatedPost.comments?.length || updatedPost.commentsCount || 0}
            </span>
          </button>

          {/* Share */}
          <button
            className="bg-transparent border-none cursor-pointer flex flex-row items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-amber-900/10 transition-colors text-sm font-medium text-amber-900"
            onClick={handleShare}
          >
            <span className="text-lg">
              <CiShare2 />
            </span>
            <span>{updatedPost.sharesCount ?? 0}</span>
          </button>

          {/* Views */}
          <div className="flex flex-row items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-sm font-medium text-amber-900">
            <span className="text-lg">
              <AiOutlineEye />
            </span>
            <span>{updatedPost.views?.count || 0}</span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSaveToggle}
          disabled={isSaving}
          className={`bg-transparent border-none cursor-pointer flex items-center py-1.5 px-2.5 rounded-lg hover:bg-amber-900/10 transition-all duration-200 text-lg relative ${isSaved ? "text-[#C08552]" : "text-amber-900"} ${isSaving ? "opacity-60" : ""}`}
        >
          <span
            className={`transition-transform duration-200 ${isSaving ? "scale-100" : "scale-90"}`}
          >
            {isSaved ? <FaBookmark /> : <CiBookmark />}
          </span>
        </button>
      </div>

      {/*  CAPTION  */}
      {cleanCaption && (
        <div className="px-4 pb-2.5 pt-0.5">
          <p className="m-0 text-sm text-amber-950 leading-relaxed">
            <strong className="mr-1">
              @
              {post.user
                ? `${post.user.firstName} ${post.user.lastName}`
                : "User"}
            </strong>
            {renderTextWithMentions(cleanCaption, post.mentions, navigate)}
          </p>
        </div>
      )}

      {/*  HASHTAGS  */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {post.hashtags.map((tag, index) => (
            <span
              key={index}
              className="text-xs text-amber-600 hover:text-amber-800 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="  border-t border-[#E1BC9C] px-4 py-3 ">
          {/* Comments list */}
          {!post.comments?.length ? (
            <p className="text-amber-700 text-sm text-center my-2">
              No comments yet — be the first!
            </p>
          ) : (
            <div className="flex flex-col gap-3 mb-3.5">
              {post.comments.filter(Boolean).map((c) => (
                <div key={c._id}>
                  <div className="flex gap-2.5 items-start">
                    <img
                      src={
                        c.user?.profilePicture ||
                        "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
                      }
                      alt={c.user?.username}
                      className="w-8 h-8 rounded-full object-cover border border-[#E9D8C4] flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-[#F4E9E0] rounded-tr-xl rounded-br-xl rounded-bl-xl px-3 pb-1 border border-[#E9D8C4]">
                        <strong className="text-xs text-amber-800">
                          @
                          {c.user
                            ? `${c.user.firstName} ${c.user.lastName}`
                            : "User"}
                        </strong>
                        <p className="mt-0.5 mb-0 text-sm text-amber-950">
                          {renderTextWithLinks(c.text)}
                        </p>
                      </div>

                      {/* Comment actions */}
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <button
                          onClick={() => handleReplyClick(c._id, c.user)}
                          className="bg-transparent border-none cursor-pointer text-xs text-amber-800 font-bold"
                        >
                          {replyingTo === c._id && replyingToReply === null
                            ? "Cancel"
                            : "Reply"}
                        </button>

                        {/* Delete — owner only */}
                        {currentUser?._id === c.user?._id && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className=" cursor-pointer text-xs text-[#FF6467] flex items-center gap-0.5 font-semibold  "
                          >
                            <AiOutlineDelete size={13} /> Delete
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      <CommentReplies
                        c={c}
                        openReplies={openReplies}
                        toggleReplies={toggleReplies}
                        handleReplyClick={handleReplyClick}
                        handleDeleteReply={handleDeleteReply}
                        replyingTo={replyingTo}
                        replyingToReply={replyingToReply}
                        reply={reply}
                        setReply={setReply}
                        handleReply={handleReply}
                        currentUser={currentUser}
                      />

                      {/* Comment reply */}
                      {replyingTo === c._id && replyingToReply === null && (
                        <form
                          onSubmit={handleReply}
                          className="flex gap-2 mt-2 ml-4"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder={`Reply to @${c.user?.firstName}…`}
                            className="flex-1 bg-amber-50 border border-amber-300 rounded-full px-4 py-2 text-sm text-amber-950 outline-none focus:border-amber-600 transition-colors"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 border-none text-xs font-semibold cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <form
            onSubmit={handleComment}
            className="flex items-center gap-2.5 w-full"
          >
            <img
              src={
                currentUser?.profilePicture ||
                "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
              }
              alt="me"
              className="w-8 h-8 rounded-full object-cover border-2 border-[#C08552] flex-shrink-0"
            />

            <div className="relative flex-1">
              {/* Emoji Icon */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <MdEmojiEmotions
                  className="text-amber-600 text-lg cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent closing
                    setShowEmojiPicker((prev) => !prev);
                  }}
                />

                {showEmojiPicker && (
                  <div className="absolute h-full bottom-50 left- z-50">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji) =>
                          setComment((prev) => prev + emoji.native)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="w-full bg-[#F9F4F1] border border-[#E1BC9C] rounded-full pl-9 pr-4 py-2 text-sm text-amber-950 outline-none focus:border-amber-600 transition-colors box-border"
              />
            </div>

            <button
              type="submit"
              disabled={!comment.trim()}
              className={`px-4 py-2 rounded-full border-none text-xs font-bold whitespace-nowrap transition-all ${
                comment.trim()
                  ? "bg-gradient-to-br from-[#C08552] to-[#131912]  text-amber-50 cursor-pointer hover:opacity-90"
                  : "bg-gradient-to-br from-[#C08552] to-[#131912]  text-amber-50 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </form>
        </div>
      )}
      {showDeleteModal && (
        <div
          className="fixed  inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(44,26,14,0.6)",
            backdropFilter: "blur(3px)",
          }}
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-2xl flex flex-col ml-[50%] justify-center items-center shadow-2xl w-80 overflow-hidden animate-fade-in"
            style={{ border: "2px solid rgba(192,133,82,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-amber-200/50">
              <h3 className="text-lg font-bold text-[#2C1A0E] flex items-center gap-2">
                <span className="text-red-500">🗑️</span> Delete Post?
              </h3>
            </div>

            {/* Body */}
            <div className=" px-5 py-4">
              <p className="text-sm text-[#4B2E2B] leading-relaxed">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex px-5 py-4 border-2 border-[#E1BC9C] bg-[#FFF8F0] flex gap-3 justify-end items-center rounded-full mb-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#8C5A3C] hover:bg-amber-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* REACTIONS MODAL */}
      {showReactionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(44,26,14,0.5)",
            backdropFilter: "blur(3px)",
          }}
          onClick={() => setShowReactionsModal(false)}
        >
          <div
            className="bg-white rounded-2xl  shadow-2xl w-80 max-h-[70vh] flex flex-col overflow-hidden "
            style={{ border: "2px solid rgba(192,133,82,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                {REACTIONS.map((r) => (
                  <span
                    key={r.type}
                    className="text-lg"
                    title={r.label}
                    style={{ lineHeight: 1 }}
                  >
                    {r.emoji}
                  </span>
                ))}
                <span className="text-sm font-semibold text-amber-900 ml-1">
                  {post.likesCount}
                </span>
              </div>
              <button
                onClick={() => setShowReactionsModal(false)}
                className="bg-transparent border-none cursor-pointer text-amber-800 text-lg font-bold hover:text-amber-950"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto  flex-1 px-4 py-2">
              {reactionsLoading ? (
                <p className="text-center text-amber-700 text-sm py-4">
                  Loading…
                </p>
              ) : reactionsList.length === 0 ? (
                <p className="text-center text-amber-700 text-sm py-4">
                  No reactions yet.
                </p>
              ) : (
                reactionsList.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center justify-between py-2.5 border-b border-amber-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={getImageUrl(r.user?.avatar)}
                          className="w-9 h-9 rounded-full object-cover border-2 border-amber-200"
                          alt=""
                        />
                        <span
                          className="absolute -bottom-1 -right-1 text-sm leading-none"
                          style={{ fontSize: 14 }}
                        >
                          {reactionEmojis[r.type] || "👍"}
                        </span>
                      </div>
                      <span
                        className="text-sm font-semibold text-amber-950 cursor-pointer hover:underline"
                        onClick={() => {
                          setShowReactionsModal(false);
                          navigate(`/profile/${r.user?._id}`);
                        }}
                      >
                        {r.user?.firstName} {r.user?.lastName}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
