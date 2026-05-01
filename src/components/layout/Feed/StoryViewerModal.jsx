import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeStoryViewer,
  nextStory,
  prevStory,
  viewStory,
  reactToStory,
  unreactToStory,
  replyToStory,
  fetchStoryViewers,
  deleteStoryThunk,
  fetchStories,
  muteUser,
} from "../../../features/storySlice";
import { selectUser } from "../../../features/userSlice";
import { FaHeart } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { CiHeart } from "react-icons/ci";
import "./style/stories.css";
import { fetchHighlights } from "../../../features/highlightSlice";
import HighlightSelectorModal from "../Highlights/HighlightSelectorModal";

function avatarUrl(user) {
  if (!user?.avatar)
    return "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";
  return user.avatar.startsWith("http")
    ? user.avatar
    : `${import.meta.env.VITE_SERVER_URL}/${user.avatar}`;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

const STORY_DURATION = 10000; 
const REACTIONS = [
  {
    type: "like",
    emoji: <FcLike size={20} />,
    label: "Like",
    color: "#3b82f6",
  },
];

const StoryViewerModal = () => {
  const dispatch = useDispatch();
  const {
    groupedStories,
    activeStoryGroup,
    activeStoryIndex,
    viewerModalOpen,
    viewerData,
  } = useSelector((s) => s.stories);
  const currentUser = useSelector(selectUser);

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const group =
    activeStoryGroup !== null ? groupedStories[activeStoryGroup] : null;
  const story = group?.stories?.[activeStoryIndex] || null;
  const isOwner = currentUser?._id === group?.user?._id;
  const storyViewerInfo = story ? viewerData[story._id] : null;

  // Mark viewed
  useEffect(() => {
    if (story && !story.isViewed && !isOwner) {
      dispatch(viewStory(story._id));
    }
  }, [story?._id, dispatch]);

  // Fetch viewers for owner
  useEffect(() => {
    if (story && isOwner && !viewerData[story._id]) {
      dispatch(fetchStoryViewers(story._id));
    }
  }, [story?._id, isOwner, dispatch]);

  useEffect(() => {
  dispatch(fetchHighlights());
}, [dispatch]);

  // Auto-progress timer
  const startTimer = useCallback(() => {
    if (story?.type === "video") return; 
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current);
        elapsedRef.current = 0;
        dispatch(nextStory());
      }
    }, 50);
  }, [story, dispatch]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      elapsedRef.current += Date.now() - (startTimeRef.current || Date.now());
    }
  }, []);

  useEffect(() => {
    if (!viewerModalOpen || !story) return;
    setProgress(0);
    elapsedRef.current = 0;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [story?._id, viewerModalOpen, startTimer]);

  useEffect(() => {
    if (paused) pauseTimer();
    else if (viewerModalOpen && story) startTimer();
  }, [paused, viewerModalOpen, story, pauseTimer, startTimer]);

  // Keyboard navigation
  useEffect(() => {
    if (!viewerModalOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") dispatch(nextStory());
      if (e.key === "ArrowLeft") dispatch(prevStory());
      if (e.key === "Escape") dispatch(closeStoryViewer());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewerModalOpen, dispatch]);

  if (!viewerModalOpen || !group || !story) return null;

  const hasLiked = story.reactions?.some(
    (r) => r.userId?._id === currentUser?._id && r.type === "like",
  );

  const handleReaction = () => {
    if (hasLiked) {
      dispatch(unreactToStory(story._id));
    } else {
      dispatch(reactToStory({ storyId: story._id, reactionType: "like" }));
    }
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    dispatch(replyToStory({ storyId: story._id, text: replyText }));
    setReplyText("");
  };

  const handleDelete = () => {
    dispatch(deleteStoryThunk(story._id));
    dispatch(nextStory());
    setShowMenu(false);
  };

  const handleMute = () => {
    dispatch(muteUser(group.user._id));
    dispatch(closeStoryViewer());
    dispatch(fetchStories());
    setShowMenu(false);
  };

  const openHighlightModal = (storyId) => {
    setSelectedStoryId(storyId);
    setShowHighlightModal(true);
  };

  return (
    <div
      className="story-modal-overlay"
      onClick={() => dispatch(closeStoryViewer())}
    >
      <div
        className="story-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav */}
        <button
          className="story-nav-btn story-nav-prev"
          onClick={() => dispatch(prevStory())}
        >
          ‹
        </button>

        {/* Story content */}
        <div
          className="story-modal-content"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {/* Progress bars */}
          <div className="story-progress-container">
            {group.stories.map((s, i) => (
              <div key={s._id} className="story-progress-bar-bg">
                <div
                  className="story-progress-bar-fill"
                  style={{
                    width:
                      i < activeStoryIndex
                        ? "100%"
                        : i === activeStoryIndex
                          ? `${progress}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="story-modal-header">
            <div className="story-header-user">
              <img
                src={avatarUrl(group.user)}
                alt=""
                className="story-header-avatar"
              />
              <div>
                <p className="story-header-name">
                  {group.user.firstName} {group.user.lastName}
                </p>
                <p className="story-header-time">{timeAgo(story.createdAt)}</p>
              </div>
            </div>
            <div className="story-header-actions">
              <button
                className="story-header-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋯
              </button>
              <button
                className="story-header-btn"
                onClick={() => dispatch(closeStoryViewer())}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Menu dropdown */}
          {showMenu && (
            <div className="story-menu-dropdown">
              {isOwner && (
                <button onClick={handleDelete}>🗑️ Delete Story</button>
              )}
              {!isOwner && (
                <button onClick={handleMute}>
                  🔇 Mute {group.user.firstName}
                </button>
              )}
            </div>
          )}

          {/* Story body */}
          <div className="story-modal-body">
            {story.type === "text" ? (
              <div
                className="story-text-display"
                style={{
                  backgroundColor:
                    story.textStyle?.backgroundColor || "#8C5A3C",
                  color: story.textStyle?.fontColor || "#fff",
                  fontSize: story.textStyle?.fontSize || 24,
                }}
              >
                {story.textContent}
              </div>
            ) : story.type === "video" ? (
              <video
                key={story._id}
                src={story.mediaUrl.startsWith("http") ? story.mediaUrl : `${import.meta.env.VITE_SERVER_URL}/${story.mediaUrl}`}
                className="story-media"
                autoPlay
                onEnded={() => dispatch(nextStory())}
                playsInline
              />
            ) : (
              <img
                src={story.mediaUrl.startsWith("http") ? story.mediaUrl : `${import.meta.env.VITE_SERVER_URL}/${story.mediaUrl}`}
                alt="story"
                className="story-media"
              />
            )}
          </div>

          {/* Footer */}
          <div className="story-modal-footer">
            {/* Owner: view analytics */}
            {isOwner && (
              <div className="">
                <button
                  className="story-viewers-btn"
                  onClick={() => {
                    setShowViewers(!showViewers);
                    setPaused(true);
                  }}
                >
                  👁️{" "}
                  {storyViewerInfo?.showAnalytics
                    ? storyViewerInfo.viewCount
                    : 0}{" "}
                  views
                </button>
                <button
                  className="story-viewers-btn"
                  onClick={() => openHighlightModal(story._id)}
                >
                  ⭐ Add to Highlight
                </button>
              </div>
            )}

            {!isOwner && (
              <div className="story-interact-row">
                <div className="story-reply-box">
                  <input
                    type="text"
                    placeholder="Reply to story..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    className="story-reply-input"
                  />
                  {replyText.trim() && (
                    <button className="story-reply-send" onClick={handleReply}>
                      ➤
                    </button>
                  )}
                </div>
                <div className="story-reaction-row">
                  <button
                    className="story-react-toggle px-2"
                    onClick={handleReaction}
                  >
                    {hasLiked ? (
                      <FcLike size={25} />
                    ) : (
                      <CiHeart size={25} className="text-white font-bold" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Viewers panel  */}
          {showViewers && isOwner && storyViewerInfo?.showAnalytics && (
            <div
              className="story-viewers-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="viewers-panel-header">
                <h4>Viewers ({storyViewerInfo.viewCount})</h4>
                <button
                  onClick={() => {
                    setShowViewers(false);
                    setPaused(false);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="viewers-panel-list">
                {storyViewerInfo.viewers.map((v) => {
                  return (
                    <div key={v.userId._id} className="viewer-item">
                      <img
                        src={avatarUrl(v.userId)}
                        alt=""
                        className="viewer-avatar"
                      />
                      <span className="viewer-name">
                        {v.userId.firstName} {v.userId.lastName}
                      </span>
                      {v.reaction === "like" && (
                        <span
                          className="viewer-reaction"
                          style={{ marginLeft: "auto", marginRight: "10px" }}
                        >
                          <FcLike size={20} />
                        </span>
                      )}
                      <span
                        className="viewer-time"
                        style={!v.reaction ? { marginLeft: "auto" } : {}}
                      >
                        {timeAgo(v.viewedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="story-click-zones">
            <div
              className="story-click-prev"
              onClick={() => dispatch(prevStory())}
            />
            <div
              className="story-click-next"
              onClick={() => dispatch(nextStory())}
            />
          </div>
        </div>

        {/* Right nav */}
        <button
          className="story-nav-btn story-nav-next"
          onClick={() => dispatch(nextStory())}
        >
          ›
        </button>
      </div>
      {showHighlightModal && (
        <HighlightSelectorModal
          storyId={selectedStoryId}
          onClose={() => setShowHighlightModal(false)}
        />
      )}
    </div>
  );
};

export default StoryViewerModal;
