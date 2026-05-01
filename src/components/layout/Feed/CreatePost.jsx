import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createPost } from "../../../features/postsSlice";
import { saveDraftThunk, selectDraftsSave } from "../../../features/draftSlice";
import {
  schedulePostThunk,
  selectScheduledPostsSave,
} from "../../../features/scheduledPostSlice";
import { selectUser } from "../../../features/userSlice";
import { getImageUrl } from "../../../utils/getImageUrl";
import Navbar from "../Navbar";
import SideBar from "../SideBar";
import RightPanel from "../RightPanel";
import { FaPoll, FaUserFriends, FaClock } from "react-icons/fa";
import CreateStory from "./CreateStory";

function detectCurrentHashtag(text, cursorPos) {
  const before = text.slice(0, cursorPos);
  const match = before.match(/#(\w+)$/);
  return match ? match[1] : null;
}

function detectCurrentMention(text, cursorPos) {
  const before = text.slice(0, cursorPos);
  const match = before.match(/(?:^|[\s,])@(\w*)$/);
  return match ? match[1] : null; 
}

function avatarSrc(user) {
  return getImageUrl(user?.avatar);
}

//  Sub-component

function HashtagSuggestion({ query, onAdd }) {
  if (!query) return null;
  return (
    <div className="absolute left-0 -0 top-full mt-1 z-20">
      <div
        className="px-3 py-2 bg-white border border-[rgba(192,133,82,0.35)] rounded-xl shadow-md cursor-pointer text-xs text-[#8C5A3C] hover:bg-[#FFF0E4] transition-colors flex items-center gap-2"
        onMouseDown={(e) => {
          e.preventDefault();
          onAdd(query);
        }}
      >
        <span className="w-5 h-5 rounded-full bg-[#F5E6D3] flex items-center justify-center font-bold text-[#C08552] text-[11px] flex-shrink-0">
          #
        </span>
        <span>
          Add <span className="font-semibold text-[#C08552]">#{query}</span>
        </span>
      </div>
    </div>
  );
}

function MentionDropdown({ query, friends, onSelect }) {
  if (query === null) return null;

  const q = query.toLowerCase();
  const filtered = friends
    .filter((f) => {
      const name = `${f.firstName} ${f.lastName}`.toLowerCase();
      return name.includes(q);
    })
    .slice(0, 6);

  if (filtered.length === 0) {
    return (
      <div className="absolute left-0 -0 top-full mt-1 z-20">
        <div className="px-3 py-2 bg-white border border-[rgba(192,133,82,0.35)] rounded-xl shadow-md text-xs text-gray-400">
          No friends match "@{query}"
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 -0 top-full mt-1 z-20 bg-white border border-[rgba(192,133,82,0.35)] rounded-xl shadow-lg overflow-hidden">
      <p className="text-[10px] font-bold text-[#8C5A3C] uppercase tracking-widest px-3 pt-2 pb-1">
        Tag a friend
      </p>
      {filtered.map((user) => (
        <div
          key={user._id}
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FFF0E4] cursor-pointer transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(user);
          }}
        >
          <img
            src={avatarSrc(user)}
            alt=""
            className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[rgba(192,133,82,0.2)]"
          />
          <span className="text-xs font-semibold text-[#2C1A0E]">
            {user.firstName} {user.lastName}
          </span>
          <span className="ml-auto text-[10px] text-[#C08552] bg-[#FFF0E4] px-1.5 py-0.5 rounded-full">
            friend
          </span>
        </div>
      ))}
    </div>
  );
}

function TaggedUserChips({ users, onRemove }) {
  if (users.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mx-1.5 mt-1">
      {users.map((u) => (
        <span
          key={u._id}
          className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0E4] text-[#8C5A3C] border border-[rgba(192,133,82,0.3)]"
        >
          <img
            src={avatarSrc(u)}
            alt=""
            className="w-4 h-4 rounded-full object-cover"
          />
          @{u.firstName}
          <button
            type="button"
            className="ml-0.5 text-[#C08552] hover:text-red-400 leading-none cursor-pointer"
            onMouseDown={(e) => {
              e.preventDefault();
              onRemove(u._id);
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function AudienceSelector({ value, onChange }) {
  const OPTIONS = [
    {
      value: "public",
      label: "🌍 Public",
      desc: "Anyone on platform",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      value: "friends",
      label: "👥 Friends",
      desc: "Only accepted connections",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      value: "private",
      label: "🔒 Private",
      desc: "Only the user",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];
  return (
    <div className="mx-1.5">
      <p className="text-xs font-semibold text-[#4B2E2B] mb-2">
        Who can see this?
      </p>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all text-xs ${active ? "border-[#C08552] bg-[#FFF0E4] text-[#8C5A3C]" : "border-[#E1BC9C] bg-white text-[#4B2E2B] hover:bg-[#FFF8F0]"}`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full ${active ? "bg-[#C08552] text-white" : "bg-[#F5EDE3] text-[#8C5A3C]"}`}
              >
                {opt.icon}
              </span>
              <span className="font-semibold">{opt.label}</span>
              <span className="text-[10px] text-gray-400 leading-tight">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SchedulePicker({ value, onChange, isOpen, onToggle }) {
  const inputRef = useRef();
  const now = new Date();
  const minDate = new Date(now.getTime() + 5 * 60 * 1000);
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fmt = (d) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

  const openPicker = () => {
    inputRef.current?.showPicker();
  };
  return (
    <div className="mx-1.5">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${isOpen ? "bg-[#C08552] text-white" : "bg-[#FFF0E4] text-[#8C5A3C] hover:bg-[#E1BC9C]"}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {isOpen
          ? "Scheduling..."
          : value
            ? `Scheduled: ${new Date(value).toLocaleString()}`
            : "Schedule Post"}
      </button>
      {isOpen && (
        <div className="mt-3 p-4 bg-[#FFF8F0] border border-[#E1BC9C] rounded-xl">
          <p className="text-xs font-semibold text-[#4B2E2B] mb-2">
            Select date and time:
          </p>
          <div onClick={openPicker} className="cursor-pointer">
            <input
              ref={inputRef}
              type="datetime-local"
              min={fmt(minDate)}
              max={fmt(maxDate)}
              value={value ? fmt(new Date(value)) : ""}
              onChange={(e) => onChange(new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 border border-[#E1BC9C] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#CA7D52] cursor-pointer"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 text-xs text-gray-500"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="px-3 py-1.5 text-xs bg-[#C08552] text-white rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);
  const captionRef = useRef(null);

  const existingDraft = location.state?.draft || null;
  const isSavingDraft = useSelector(selectDraftsSave);
  const isScheduling = useSelector(selectScheduledPostsSave);

  const currentUser = useSelector(selectUser);
  const friends = currentUser?.friends || [];

  const [audience, setAudience] = useState("public");
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [files, setFiles] = useState([]);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showAudience, setShowAudience] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [isAdvertisement, setIsAdvertisement] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [createMode, setCreateMode] = useState("post");


  const [poll, setPoll] = useState({
    question: "",
    options: ["", ""],
  });

  const [showPoll, setShowPoll] = useState(false);

  const [hashtagQuery, setHashtagQuery] = useState(null);
  const [activeHashtagField, setActiveHashtagField] = useState(null);

  const [mentionQuery, setMentionQuery] = useState(null); 
  const [activeMentionField, setActiveMentionField] = useState(null);

  const [taggedUsers, setTaggedUsers] = useState([]);

  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (existingDraft) {
      setCaption(existingDraft.caption || "");
      setContent(existingDraft.content || "");
      setLocationName(existingDraft.locationName || "");
      setAudience(existingDraft.audience || "public");
    }
  }, [existingDraft]);

  //  Shared text change handler 
  const processTextChange = (val, cursorPos, field, setter) => {
    setter(val);

    // hashtag detection
    const htag = detectCurrentHashtag(val, cursorPos);
    setHashtagQuery(htag);
    setActiveHashtagField(htag !== null ? field : null);

    if (htag === null) {
      const mention = detectCurrentMention(val, cursorPos);
      setMentionQuery(mention !== null ? mention : null);
      setActiveMentionField(mention !== null ? field : null);
    } else {
      setMentionQuery(null);
      setActiveMentionField(null);
    }
  };

  const handleContentChange = (e) =>
    processTextChange(
      e.target.value,
      e.target.selectionStart,
      "content",
      setContent,
    );

  const handleCaptionChange = (e) =>
    processTextChange(
      e.target.value,
      e.target.selectionStart,
      "caption",
      setCaption,
    );

  const handleBlur = () => {
    setTimeout(() => {
      setHashtagQuery(null);
      setActiveHashtagField(null);
      setMentionQuery(null);
      setActiveMentionField(null);
    }, 150);
  };

  //  Hashtag confirm
  const handleHashtagAdd = (query) => {
    if (activeHashtagField === "content") {
      setContent((c) => c.replace(/#(\w+)$/, `#$1 `));
      setTimeout(() => contentRef.current?.focus(), 0);
    } else {
      setCaption((c) => c.replace(/#(\w+)$/, `#$1 `));
      setTimeout(() => captionRef.current?.focus(), 0);
    }
    setHashtagQuery(null);
    setActiveHashtagField(null);
  };

  //  @mention select
  const handleMentionSelect = (user) => {
    const mentionText = `${user.firstName} ${user.lastName} `; 

    if (activeMentionField === "content") {
      setContent((prev) => {
        const lastAt = prev.lastIndexOf("@");
        return prev.slice(0, lastAt) + "@" + mentionText; 
      });
      setTimeout(() => contentRef.current?.focus(), 0);
    } else {
      setCaption((prev) => {
        const lastAt = prev.lastIndexOf("@");
        return prev.slice(0, lastAt) + "@" + mentionText; 
      });
      setTimeout(() => captionRef.current?.focus(), 0);
    }

    const newMention = {
      name: `${user.firstName} ${user.lastName}`, 
      user: user._id,
    };

    setMentions((prev) => {
      if (prev.some((m) => m.user === user._id)) return prev;
      return [...prev, newMention];
    });

    setTaggedUsers((prev) =>
      prev.some((u) => u._id === user._id) ? prev : [...prev, user],
    );

    setMentionQuery(null);
    setActiveMentionField(null);
  };
  //  File helpers 
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const oversized = selected.filter((f) => f.size > 150 * 1024 * 1024);
    if (oversized.length) {
      alert(
        `File too large! Max 150MB.\n${oversized.map((f) => f.name).join(", ")}`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFiles(selected);
  };

  const handleAddMoreFiles = (e) => {
    const valid = Array.from(e.target.files).filter(
      (f) => f.size <= 150 * 1024 * 1024,
    );
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const buildFormData = (draftId = null) => {
    const fd = new FormData();
    fd.append("caption", caption);
    fd.append("content", content);
    fd.append("audience", audience);
    fd.append("isAdvertisement", isAdvertisement);
    fd.append("allowDownload", allowDownload);
    
    if (locationName) {
      fd.append("locationName", locationName);
      fd.append("lat", lat || "");
      fd.append("lng", lng || "");
    }
    files.forEach((file) => fd.append("media", file));

    if (draftId) fd.append("draftId", draftId);
    if (mentions.length > 0) {
      fd.append("mentions", JSON.stringify(mentions));
    }

    if (scheduledAt) fd.append("scheduledAt", scheduledAt);
    if (poll.question) {
      fd.append("poll", JSON.stringify(poll));
    }
    return fd;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0 && !content.trim()) {
      alert("Please add content or select files");
      return;
    }
    
    if (scheduledAt) {
      handleSchedule(e);
      return;
    }
    dispatch(createPost(buildFormData()));
    resetForm();
    navigate("/main");
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      alert("Please select a schedule time");
      return;
    }
    if (files.length === 0 && !content.trim()) {
      alert("Please add content or select files");
      return;
    }
    const result = await dispatch(schedulePostThunk(buildFormData()));
    if (schedulePostThunk.fulfilled.match(result)) {
      showToast(
        "success",
        `Post scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      );
      resetForm();
      navigate("/scheduled-posts");
    } else {
      showToast("error", result.payload || "Failed to schedule post");
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && !caption.trim() && files.length === 0) {
      alert("Nothing to save.");
      return;
    }
    const draftId = existingDraft?._id || null;
    const result = await dispatch(saveDraftThunk(buildFormData(draftId)));
    if (saveDraftThunk.fulfilled.match(result)) {
      showToast("success", draftId ? "Draft updated!" : "Draft saved!");
      resetForm();
      navigate("/draft");
    } else {
      showToast("error", result.payload || "Failed to save draft");
    }
  };

  const resetForm = () => {
    setCaption("");
    setContent("");
    setLocationName("");
    setLat("");
    setLng("");
    setFiles([]);
    setAudience("public");
    setScheduledAt(null);
    setShowSchedulePicker(false);
    setTaggedUsers([]);
    setMentions([]);
    setIsAdvertisement(false);
    setAllowDownload(true);
    setHashtagQuery(null);
    setActiveHashtagField(null);
    setMentionQuery(null);
    setActiveMentionField(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasInput = content.trim() || caption.trim() || files.length > 0;

  return (
    <div className="bg-[#FFF8F0]">
      <Navbar />
      <div className="flex flex-row">
        <div className="w-[19.5vw] ml-[8vw]">
          <SideBar />
        </div>

        <div className="relative w-[42.2vw] mt-[1vw]  bg-[#FFFFFF] rounded-2xl mb-[1.5vw] shadow-xl/10">
          {/* Post / Story Toggle */}
          <div className="flex border-b border-[#e8d5c0]">
            <button
              type="button"
              onClick={() => setCreateMode("post")}
              className={`flex-1 py-3 text-sm font-bold transition-all rounded-tl-2xl ${
                createMode === "post"
                  ? "bg-[#815F3C] text-white"
                  : "bg-[#FFF8F0] text-[#8C5A3C] hover:bg-[#FFF0E4]"
              }`}
            >
              📝 Create Post
            </button>
            <button
              type="button"
              onClick={() => setCreateMode("story")}
              className={`flex-1 py-3 text-sm font-bold transition-all rounded-tr-2xl ${
                createMode === "story"
                  ? "bg-gradient-to-r from-[#C08552] to-[#e94560] text-white"
                  : "bg-[#FFF8F0] text-[#8C5A3C] hover:bg-[#FFF0E4]"
              }`}
            >
              🖼️ Create Story
            </button>
          </div>

          {/* Conditional rendering based on mode */}
          {createMode === "story" ? (
            <CreateStory onClose={() => { setCreateMode("post"); navigate("/main"); }} />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4  ">
            {/* Header */}
            <h3 className="mt-0 flex w-full justify-between items-center text-xl font-bold text-white border-b-2 border-[#735637] bg-[#815F3C] overflow-hidden rounded-t-2xl px-5">
              <span className="my-3">
                {existingDraft
                  ? "Edit Draft"
                  : scheduledAt
                    ? "Schedule Post"
                    : "Create Post"}
              </span>
              {scheduledAt && (
                <span className="text-xs font-normal bg-white/20 px-3 py-1 rounded-full">
                  ⏰ {new Date(scheduledAt).toLocaleDateString()}
                </span>
              )}
            </h3>



            {/* Pre-existing media notice */}
            {existingDraft?.media?.length > 0 && (
              <div className="mx-4 bg-[#FFF0E4] border border-[#E1BC9C] rounded-xl p-3 text-sm text-[#8C5A3C]">
                <p className="font-semibold mb-1">📎 Previously saved media</p>
                <p className="text-xs text-gray-500">
                  {existingDraft.media.length} file(s) already attached.
                </p>
              </div>
            )}

            {/*  Content textarea  */}
            <div className="relative w-[98.3%] mx-1.5">
              <textarea
                ref={contentRef}
                placeholder="What's on your mind? Use # for hashtags, @ to tag a friend…"
                value={content}
                onChange={handleContentChange}
                onBlur={handleBlur}
                rows={3}
                className="w-full border border-[#E1BC9C] rounded-full px-5 py-3 text-sm text-[#2C1A0E] focus:outline-none focus:ring-1 focus:ring-[#CA7D52]"
              />
              {activeHashtagField === "content" && hashtagQuery && (
                <HashtagSuggestion
                  query={hashtagQuery}
                  onAdd={handleHashtagAdd}
                />
              )}
              {activeMentionField === "content" && mentionQuery !== null && (
                <MentionDropdown
                  query={mentionQuery}
                  friends={friends}
                  onSelect={handleMentionSelect}
                />
              )}
            </div>

            {/*  Caption input  */}
            <div className="relative w-[98.3%] mx-1.5">
              <input
                ref={captionRef}
                type="text"
                placeholder="Caption -- use # for hashtags, @ to tag…"
                value={caption}
                onChange={handleCaptionChange}
                onBlur={handleBlur}
                className="w-full border border-[#E1BC9C] rounded-full px-5 py-2 text-sm text-[#2C1A0E] focus:outline-none focus:ring-1 focus:ring-[#CA7D52]"
              />
              {activeHashtagField === "caption" && hashtagQuery && (
                <HashtagSuggestion
                  query={hashtagQuery}
                  onAdd={handleHashtagAdd}
                />
              )}
              {activeMentionField === "caption" && mentionQuery !== null && (
                <MentionDropdown
                  query={mentionQuery}
                  friends={friends}
                  onSelect={handleMentionSelect}
                />
              )}
            </div>

            <div className="w-full flex justify-between  mt-2 mr-2">
              <div className="w-[18.8vw] py-1">
                <input
                  type="text"
                  placeholder="Location Link or Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full mx-1.5 border border-[#E1BC9C] rounded-full px-5 py-2 text-sm text-[#2C1A0E] focus:outline-none focus:ring-1 focus:ring-[#CA7D52]"
                />
              </div>

              <div className="w-1/3 mx-1 flex justify-end gap-2 ">
                {/* Post Type Toggle */}
                <div className="flex items-center gap-1 px-3 rounded-full bg-[#FFF0E4]" style={{ borderColor: isAdvertisement ? '#C08552' : '#E1BC9C' }}>
                  <button
                    type="button"
                    onClick={() => setIsAdvertisement(false)}
                    className={`px-4 py-1 text-xs font-semibold rounded-full transition ${!isAdvertisement ? 'bg-white text-[#8C5A3C]' : 'text-[#8C5A3C]'} rounded-full`}
                    title="Create Regular Post"
                  >
                    📝 Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdvertisement(true)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full transition ${isAdvertisement ? 'bg-white text-[#C08552]' : 'text-[#8C5A3C]'} rounded-full`}
                    title="Create Advertisement"
                  >
                    📢 Adv.
                  </button>
                </div>

                {/* Download Permission */}
                <button
                  type="button"
                  onClick={() => setAllowDownload((prev) => !prev)}
                  className={`py-2 px-2 rounded-full font-semibold text-xs transition ${
                    allowDownload
                      ? "bg-[#C08552] text-white"
                      : "bg-red-300 text-white hover:bg-red-400"
                  }`}
                  title={allowDownload ? "Downloads allowed" : "Downloads blocked"}
                >
                  {allowDownload ? "📥 Allow" : "🚫 Block"}
                </button>

                {/* Poll */}
                <button
                  type="button"
                  onClick={() => setShowPoll((prev) => !prev)}
                  className="py-2 px-4 rounded-full bg-[#FFF0E4] hover:bg-[#E1BC9C] text-[#8C5A3C]"
                  title="Create Poll"
                >
                  <FaPoll size={16} />
                </button>

                {/* Audience */}
                <button
                  type="button"
                  onClick={() => setShowAudience((prev) => !prev)}
                  className="py-2 px-4 rounded-full bg-[#FFF0E4] hover:bg-[#E1BC9C] text-[#8C5A3C]"
                  title="Select Audience"
                >
                  <FaUserFriends size={16} />
                </button>

                {/* Schedule */}
                <button
                  type="button"
                  onClick={() => setShowSchedulePicker((prev) => !prev)}
                  className="py-2 px-4 rounded-full bg-[#FFF0E4] hover:bg-[#E1BC9C] text-[#8C5A3C]"
                  title="Schedule Post"
                >
                  <FaClock size={16} />
                </button>
              </div>
            </div>

            {/* VOTING POLL */}


            {showPoll && (
              <div className="w-[97.8%] mx-2 border border-[#E1BC9C] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CA7D52]">
                <p className="text-md ml-1 mb-2 text-[#4B2E2B] font-semibold">
                  Create Poll
                </p>

                <input
                  type="text"
                  placeholder="Poll question"
                  value={poll.question}
                  onChange={(e) =>
                    setPoll({ ...poll, question: e.target.value })
                  }
                  className="w-full border border-[#E1BC9C] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] focus:outline-none focus:ring-1 focus:ring-[#CA7D52]"
                />

                {poll.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...poll.options];
                      newOptions[i] = e.target.value;
                      setPoll({ ...poll, options: newOptions });
                    }}
                    className="w-full mt-2 border border-[#E1BC9C] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] focus:outline-none focus:ring-1 focus:ring-[#CA7D52]"
                  />
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPoll({ ...poll, options: [...poll.options, ""] })
                  }
                  className="ml-1 mt-2 text-sm text-[#C08552] font-semibold "
                >
                  + Add Option
                </button>
              </div>
            )}

            {showAudience && (
              <AudienceSelector value={audience} onChange={setAudience} />
            )}

            {showSchedulePicker && (
              <SchedulePicker
                value={scheduledAt}
                onChange={setScheduledAt}
                isOpen={showSchedulePicker}
                onToggle={() => setShowSchedulePicker(!showSchedulePicker)}
              />
            )}

            {/* File upload */}
            <div className="my-3 text-[#4B2E2B] mx-2">
              <label className="block  mb-1 font-semibold text-sm">
                Select Media:
              </label>
              <div className="flex items-center w-[13vw] pl-4 pt-2 pb-1 bg-gradient-to-br from-[#C08552] to-[#131912] rounded-full text-white shadow cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,video/quicktime,.gif"
                  // onChange={handleFileChange}
                  onChange={handleAddMoreFiles}
                  className="block mb-2 text-sm cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#4B2E2B] pt-1">
                Hold Ctrl to select multiple. Max 10 files, 150MB each.
              </p>
            </div>

            {/* Selected files */}
            {files.length > 0 && (
              <div className="my-3 p-3 bg-gray-100 rounded-lg mx-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 my-1 bg-white rounded text-xs"
                  >
                    <span>
                      {index + 1}. {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
             
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between px-3 pb-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || !hasInput}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition ${!hasInput ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-[#C08552] text-[#8C5A3C] hover:bg-[#FFF0E4] cursor-pointer"}`}
              >
                {isSavingDraft ? (
                  <>
                    <span className="w-3.5 h-3.5 border border-[#C08552] border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>📄 {existingDraft ? "Update Draft" : "Save as Draft"}</>
                )}
              </button>

              <button
                type="submit"
                disabled={
                  (files.length === 0 && !content.trim()) || isScheduling
                }
                className={`px-5 py-2 rounded-full text-white text-sm font-semibold transition flex items-center gap-2 ${files.length === 0 && !content.trim() ? "bg-gray-400 cursor-not-allowed" : scheduledAt ? "bg-[#8C5A3C] hover:bg-[#6B4423] cursor-pointer" : "bg-gradient-to-br from-[#C08552] to-[#131912] hover:opacity-90 cursor-pointer"}`}
              >
                {isScheduling ? (
                  <>
                    <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                    Scheduling…
                  </>
                ) : scheduledAt ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Schedule
                  </>
                ) : (
                  "Post Now"
                )}
              </button>
            </div>
          </form>
          )}
        </div>

        <div className="ml-[1.5vw]">
          <RightPanel />
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg z-50 ${toast.type === "success" ? "bg-[#8C5A3C]" : "bg-red-500"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default CreatePost;
