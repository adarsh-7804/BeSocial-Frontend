import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar";
import SideBar from "../../SideBar";
import RightPanel from "../../RightPanel";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPosts } from "../../../../api/postsApi";
import {
  getHighlights,
  createHighlight,
  deleteHighlight,
} from "../../../../api/highlightApi";
import PostCard from "../PostCard";

const Gallary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("image");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightDescription, setHighlightDescription] = useState("");
  const [highlightCoverPreview, setHighlightCoverPreview] = useState(""); 
  const [loadingHighlight, setLoadingHighlight] = useState(false);
  const [highlightError, setHighlightError] = useState("");
  const coverImageInputRef = useRef(null);
  const scrollRef = useRef(null);
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    const getUserPosts = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const data = await fetchUserPosts(user._id);
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserPosts();
  }, [user?._id]);

  useEffect(() => {
    const fetchHighlightsData = async () => {
      try {
        if (user?._id) {
          const { data } = await getHighlights();
          setHighlights(data.highlights || []);
        }
      } catch (error) {
        console.error("Error fetching highlights:", error);
        setHighlightError("Failed to load highlights");
      }
    };
    fetchHighlightsData();
  }, [user?._id]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setHighlightError("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setHighlightCoverPreview(reader.result); 
    reader.readAsDataURL(file);
    setHighlightError("");
    e.target.value = ""; 
  };

  const handleCreateHighlight = async () => {
    if (!highlightTitle.trim()) {
      setHighlightError("Please enter a highlight title");
      return;
    }
    try {
      setLoadingHighlight(true);
      setHighlightError("");

      const { data } = await createHighlight(
        highlightTitle.trim(),
        highlightDescription.trim(),
        highlightCoverPreview  
      );
      setHighlights([data.highlight, ...highlights]);
      resetModal();
    } catch (error) {
      console.error("Error creating highlight:", error);
      setHighlightError(
        error.response?.data?.message || "Failed to create highlight"
      );
    } finally {
      setLoadingHighlight(false);
    }
  };

  const resetModal = () => {
    setHighlightTitle("");
    setHighlightDescription("");
    setHighlightCoverPreview("");
    setHighlightError("");
    setShowAddHighlight(false);
  };

  const handleDeleteHighlight = async (e, highlightId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this highlight?")) return;
    try {
      await deleteHighlight(highlightId);
      setHighlights(highlights.filter((h) => h._id !== highlightId));
    } catch (error) {
      console.error("Error deleting highlight:", error);
      alert("Failed to delete highlight");
    }
  };

  const categorizePost = (post) => {
    if (post.media && post.media.length > 0) {
      const mediaType = post.media[0].type;
      if (mediaType === "video") return "video";
      if (mediaType === "image" || mediaType === "gif") return "image";
    }
    if (post.content?.trim().length > 0 && (!post.media || post.media.length === 0)) {
      return "text";
    }
    return null;
  };

  const imagePosts = posts.filter((p) => categorizePost(p) === "image");
  const videoPosts = posts.filter((p) => categorizePost(p) === "video");
  const textPosts = posts.filter((p) => categorizePost(p) === "text");

  const tabs = [
    { id: "image", label: "Image", icon: "🖼️", count: imagePosts.length },
    { id: "video", label: "Video", icon: "🎬", count: videoPosts.length },
    { id: "text", label: "Text", icon: "📝", count: textPosts.length },
  ];

  const currentPosts =
    activeTab === "image" ? imagePosts : activeTab === "video" ? videoPosts : textPosts;

  return (
    <div className="bg-[#FFF8F0]">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>
      <div className="flex mx-[8vw]">
        <SideBar />

        <div className="animate-[fadeUp_0.35s_ease_both] w-[80vw] md:max-w-[600px] mx-auto pb-10 min-h-screen flex flex-col">
          {/* Tabs */}
          <div className="h-[5vw] animate-[fadeUp_0.35s_ease_both] flex justify-between gap-3 mb-8 border-b-2 border-[#e8d5c0] pb-5 sticky top-14 bg-[#FFF8F0] z-40 shrink-0">
            {tabs.map(({ id, label, icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all mt-5 duration-300 ${
                  activeTab === id
                    ? "bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] shadow-lg"
                    : "bg-transparent text-[#8C5A3C] hover:bg-[#f5ede3]"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="text-sm opacity-70">({count})</span>
              </button>
            ))}
          </div>

          {/* Highlights Section */}
          <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EB] rounded-[20px] p-5 mb-6 border-2 border-[#e8d5c0] animate-[fadeUp_0.35s_ease_both] mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#604A30]">Highlights</h3>
              <span className="text-xs font-semibold text-[#A7764A] bg-[#FFF8F0] px-3 py-1 rounded-full">
                {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Scrollable row */}
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#A7764A_#f1e0d0]"
              style={{ scrollbarWidth: "thin" }}
            >
              {/* Add new highlight */}
              <div className="flex flex-col items-center shrink-0 cursor-pointer group">
                <button
                  onClick={() => { setShowAddHighlight(true); setHighlightError(""); }}
                  className="w-[62px] h-[62px] rounded-full border-[2.5px] border-dashed border-[#A7764A] bg-[rgba(255,248,240,0.8)] flex items-center justify-center text-[#A7764A] transition-all duration-200 hover:bg-[#f5ede3] hover:scale-105"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div className="text-xs text-center mt-2 text-[#27261A] font-medium">New</div>
              </div>

              {/* Existing highlights */}
              {highlights.length > 0 ? (
                highlights.map((highlight) => (
                  <div
                    key={highlight._id}
                    className="flex flex-col items-center shrink-0 cursor-pointer group"
                  >
                    <div className="relative">
                      {/* Ring */}
                      <div
                        onClick={() => navigate(`/highlight/${highlight._id}`)}
                        className="w-[62px] h-[62px] rounded-full p-[2.5px] bg-gradient-to-br from-[#A7764A] to-[#e8c49a] transition-transform duration-200 hover:scale-105"
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#e8d5c0] flex items-center justify-center border-[2px] border-[#FFF8F0]">
                          {highlight.coverImage ? (
                            <img
                              src={
                                highlight.coverImage.startsWith("http") ||
                                highlight.coverImage.startsWith("data:")
                                  ? highlight.coverImage
                                  : `${import.meta.env.VITE_SERVER_URL}/${highlight.coverImage}`
                              }
                              alt={highlight.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A7764A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Delete dot menu */}
                      <button
                        onClick={(e) => handleDeleteHighlight(e, highlight._id)}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-[#e8d5c0] rounded-full text-[#8C5A3C] text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                        title="Delete highlight"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-xs text-center mt-2 text-[#27261A] max-w-[72px] truncate font-medium">
                      {highlight.title}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#A7764A] opacity-70 my-auto">
                  No highlights yet
                </p>
              )}
            </div>
          </div>

          {/* Create Highlight Modal */}
          {showAddHighlight && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#FFF8F0] rounded-3xl p-7 max-w-[420px] w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease]">
                <h2 className="text-2xl font-bold text-[#27261A] mb-5">
                  Create New Highlight
                </h2>

                {/* Cover Image Picker */}
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#8C5A3C] mb-2 uppercase tracking-[0.5px]">
                    Cover Image
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview circle */}
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="w-[72px] h-[72px] rounded-full border-[2.5px] border-dashed border-[#A7764A] overflow-hidden flex items-center justify-center cursor-pointer bg-[#f5ede3] transition-all duration-200 hover:bg-[#ecddc8] shrink-0"
                    >
                      {highlightCoverPreview ? (
                        <img
                          src={highlightCoverPreview}
                          alt="cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A7764A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => coverImageInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[#A7764A] text-[#A7764A] bg-transparent hover:bg-[#f5ede3] transition-all duration-200"
                      >
                        {highlightCoverPreview ? "Change Photo" : "Upload Photo"}
                      </button>
                      {highlightCoverPreview && (
                        <button
                          type="button"
                          onClick={() => setHighlightCoverPreview("")}
                          className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      <p className="text-[11px] text-[#A7764A] opacity-60">Optional · JPG, PNG, GIF</p>
                    </div>
                  </div>
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />
                </div>

                {/* Title */}
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#8C5A3C] mb-2 uppercase tracking-[0.5px]">
                    Highlight Name *
                  </label>
                  <input
                    type="text"
                    value={highlightTitle}
                    onChange={(e) => { setHighlightTitle(e.target.value); setHighlightError(""); }}
                    placeholder="e.g., Family, Friends, Travel"
                    className="w-full px-4 py-3 border-2 border-[#e8d5c0] rounded-xl text-sm text-[#27261A] placeholder-[#A7764A]/60 transition-all duration-300 focus:outline-none focus:border-[#A7764A] focus:shadow-[0_0_0_3px_rgba(167,118,74,0.1)]"
                    autoFocus
                  />
                </div>

               

                {highlightError && (
                  <div className="flex items-center gap-1.5 text-red-600 text-[13px] mt-1.5">
                    <span>⚠️</span> {highlightError}
                  </div>
                )}

                <div className="flex gap-3 mt-7">
                  <button
                    onClick={resetModal}
                    className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold border-2 border-[#e8d5c0] text-[#8C5A3C] bg-transparent transition-all duration-300 hover:bg-[#f5ede3] hover:border-[#A7764A]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateHighlight}
                    disabled={loadingHighlight}
                    className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] shadow-[0_4px_12px_rgba(167,118,74,0.2)] transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_8px_20px_rgba(167,118,74,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingHighlight ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Content */}
          <div className="animate-[fadeUp_0.35s_ease_both] flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-[#8C5A3C]">Loading your gallery...</p>
              </div>
            ) : currentPosts.length > 0 ? (
              <div className="w-full flex flex-col gap-4 px-4 pb-4">
                {currentPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-5 text-[#8C5A3C]">
                <div className="text-5xl mb-4">
                  {activeTab === "image" && "🖼️"}
                  {activeTab === "video" && "🎬"}
                  {activeTab === "text" && "📝"}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No {activeTab === "image" ? "images" : activeTab === "video" ? "videos" : "text posts"}
                </h3>
                <p className="text-sm opacity-70">
                  {activeTab === "image" && "Create an image post to see it here"}
                  {activeTab === "video" && "Upload a video to see it here"}
                  {activeTab === "text" && "Write a post to see it here"}
                </p>
              </div>
            )}
          </div>
        </div>

        <RightPanel />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Gallary;