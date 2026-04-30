import { useState } from "react";
import { CiImageOn, CiVideoOn, CiTrash } from "react-icons/ci";
import { AiOutlineSend, AiOutlineEdit } from "react-icons/ai";
import { BsFileEarmarkText } from "react-icons/bs";

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
          src={`http://localhost:5000/${first.url}`}
          className="w-full h-full object-cover"
          muted
        />
      ) : (
        <img
          src={`http://localhost:5000/${first.url}`}
          alt="draft preview"
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

const AUDIENCE_BADGE = {
  public: { label: "Public", className: "bg-[#EAF3DE] text-[#3B6D11]" },
  friends: { label: "Friends", className: "bg-[#FFF0E4] text-[#8C5A3C]" },
  private: { label: "Private", className: "bg-gray-100 text-gray-500" },
};

const DraftCard = ({ draft, onDelete, onPublish, onEdit, publishing, deleting }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(draft._id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const hasContent = draft.content || draft.caption;
  const preview = draft.content || draft.caption || "";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0e0d0] overflow-hidden hover:shadow-md transition-shadow duration-200">
      {draft.media?.length > 0 && <MediaPreview media={draft.media} />}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#8C5A3C] font-medium">
            <MediaIcon media={draft.media} />
            <span>
              {draft.media?.length > 0
                ? `${draft.media.length} file${draft.media.length > 1 ? "s" : ""}`
                : "Text only"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {draft.audience && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  AUDIENCE_BADGE[draft.audience]?.className ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {AUDIENCE_BADGE[draft.audience]?.label ?? draft.audience}
              </span>
            )}
            <span className="text-xs text-gray-400">{timeAgo(draft.updatedAt)}</span>
          </div>
        </div>

        {hasContent ? (
          <p className="h-full text-sm text-[#291d1c] leading-relaxed line-clamp-3 mb-3">
            {preview}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-3">No text content</p>
        )}

        {draft.caption && draft.content && (
          <p className="text-xs text-[#8C5A3C] mb-2 truncate">📌 {draft.caption}</p>
        )}

        {draft.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {draft.hashtags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-[#FFF0E4] text-[#C08552] px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {draft.hashtags.length > 4 && (
              <span className="text-xs text-gray-400">+{draft.hashtags.length - 4}</span>
            )}
          </div>
        )}

        {draft.locationName && (
          <p className="text-xs text-gray-400 mb-3">📍 {draft.locationName}</p>
        )}

        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onEdit(draft)}
            className="flex items-center gap-1 text-xs font-semibold text-[#8C5A3C] 
                       border border-[#E1BC9C] px-3 py-1.5 rounded-full 
                       hover:bg-[#FFF0E4] transition-colors"
          >
            <AiOutlineEdit size={14} />
            Edit
          </button>

          <button
            onClick={() => onPublish(draft._id)}
            disabled={publishing === draft._id}
            className="flex items-center gap-1 text-xs font-semibold text-white 
                       bg-gradient-to-br from-[#C08552] to-[#8C5A3C]
                       px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity
                       disabled:opacity-60 disabled:cursor-not-allowed flex-1 justify-center"
          >
            <AiOutlineSend size={14} />
            {publishing === draft._id ? "Publishing…" : "Publish"}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting === draft._id}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              confirmDelete
                ? "bg-red-500 text-white"
                : "text-red-400 border border-red-200 hover:bg-red-50"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <CiTrash size={15} />
            {deleting === draft._id ? "…" : confirmDelete ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftCard;