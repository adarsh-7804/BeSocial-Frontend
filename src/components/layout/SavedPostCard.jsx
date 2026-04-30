import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiImageOn, CiVideoOn, CiTrash } from "react-icons/ci";
import { BsFileEarmarkText } from "react-icons/bs";
import { FaBookmark } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MediaPreview({ media }) {
  if (!media || media.length === 0) return null;

  const first = media[0];
  const extra = media.length - 1;

  return (
    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#f5ede3] flex items-center justify-center">
      {first.type === "video" ? (
        <video
          src={`${import.meta.env.VITE_SERVER_URL}/${first.url}`}
          poster={first.thumbnailUrl ? `${import.meta.env.VITE_SERVER_URL}/${first.thumbnailUrl}` : undefined}
          className="w-full h-full object-cover"
          muted
        />
      ) : (
        <img
          src={`${import.meta.env.VITE_SERVER_URL}/${first.url}`}
          alt="saved post preview"
          className="w-full h-full object-cover"
        />
      )}
      {extra > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          +{extra} more
        </div>
      )}
    </div>
  );
}

function MediaIcon({ media }) {
  if (!media || media.length === 0)
    return <BsFileEarmarkText className="text-[#C08552]" size={16} />;
  const types = media.map((m) => m.type);
  if (types.includes("video"))
    return <CiVideoOn className="text-[#C08552]" size={18} />;
  if (types.includes("gif"))
    return <CiImageOn className="text-green-500" size={18} />;
  return <CiImageOn className="text-[#C08552]" size={18} />;
}

const SavedPostCard = ({ savedPost, onRemove, removing }) => {
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState(false);
  
  const { post, createdAt } = savedPost;
  const postId = post._id;

  const handleRemove = () => {
    if (confirmRemove) {
      onRemove(postId);
    } else {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
    }
  };

  const handleViewPost = () => {
    navigate(`/post/${postId}`);
  };

  const hasContent = post.content || post.caption;
  const preview = post.content || post.caption || "";
  const displayName = post.user 
    ? `${post.user.firstName} ${post.user.lastName}`
    : "Unknown User";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0e0d0] overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Saved badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="flex items-center gap-1 bg-[#C08552] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
          <FaBookmark size={10} />
          Saved
        </span>
      </div>

      {/* Media preview */}
      {post.media?.length > 0 && (
        <div className="relative">
          <MediaPreview media={post.media} />
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#8C5A3C] font-medium">
            <MediaIcon media={post.media} />
            <span>
              {post.media?.length > 0
                ? `${post.media.length} file${post.media.length > 1 ? "s" : ""}`
                : "Text only"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Audience badge if available */}
            {post.audience && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  post.audience === "public"
                    ? "bg-[#EAF3DE] text-[#3B6D11]"
                    : post.audience === "friends"
                    ? "bg-[#FFF0E4] text-[#8C5A3C]"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {post.audience.charAt(0).toUpperCase() + post.audience.slice(1)}
              </span>
            )}
            <span className="text-xs text-gray-400">
              Saved {timeAgo(createdAt)}
            </span>
          </div>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={
              post.user?.avatar
                ? `${import.meta.env.VITE_SERVER_URL}/${post.user.avatar.replace(/\\/g, "/")}`
                : "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
            }
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover border border-[#E1BC9C]"
          />
          <span className="text-xs text-[#8C5A3C] font-medium">@{displayName}</span>
        </div>

        {/* Content preview */}
        {hasContent ? (
          <p className="text-sm text-[#291d1c] leading-relaxed line-clamp-3 mb-3">
            {preview}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-3">No text content</p>
        )}

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-[#FFF0E4] text-[#C08552] px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {post.hashtags.length > 4 && (
              <span className="text-xs text-gray-400">
                +{post.hashtags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Location */}
        {post.location?.name && (
          <p className="text-xs text-gray-400 mb-3">📍 {post.location.name}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          {/* View Post */}
          <button
            onClick={handleViewPost}
            className="flex items-center gap-1 text-xs font-semibold text-[#8C5A3C] 
                       border border-[#E1BC9C] px-3 py-1.5 rounded-full 
                       hover:bg-[#FFF0E4] transition-colors flex-1 justify-center"
          >
            <FiExternalLink size={14} />
            View Post
          </button>

          {/* Remove */}
          <button
            onClick={handleRemove}
            disabled={removing === postId}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
              ${
                confirmRemove
                  ? "bg-red-500 text-white"
                  : "text-red-400 border border-red-200 hover:bg-red-50"
              }
              disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <CiTrash size={15} />
            {removing === postId
              ? "…"
              : confirmRemove
              ? "Confirm?"
              : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedPostCard;