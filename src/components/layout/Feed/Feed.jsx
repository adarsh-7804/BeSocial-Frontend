// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useState, useRef } from "react";
// // import { createPost } from "../../../features/postsSlice";
// import { selectUser } from "../../../features/userSlice";
// import PostCard from "./PostCard";
// import { useNavigate } from "react-router-dom";
// import { selectHiddenPostIds } from "../../../features/notInterestedSlice";
// import { fetchFeed } from "../../../features/feedActions";
// import { setFeedType } from "../../../features/feedSlice";
// import StoryFeed from "./StoryFeed";
// import StoryViewerModal from "./StoryViewerModal";

// import Zoom from 'react-medium-image-zoom'
// import 'react-medium-image-zoom/dist/styles.css'

// const Feed = () => {
//   const dispatch = useDispatch();
//   const { posts, loading, error, page, hasMore, type } = useSelector(
//     (state) => state.feed,
//   );
//   const hiddenPostIds = useSelector(selectHiddenPostIds);
//   const currentUser = useSelector(selectUser);


//   const [open, setOpen] = useState(false);

//   const navigate = useNavigate();

//   const visiblePosts = posts.filter((p) => !hiddenPostIds.includes(p._id));

//   useEffect(() => {
//     if (type !== "story") {
//       dispatch(fetchFeed(type, 1));
//     }
//   }, [dispatch, type]);

//   useEffect(() => {
//     if (type === "story") return; 
//     const handleScroll = () => {
//       if (
//         window.innerHeight + window.scrollY >=
//           document.body.offsetHeight - 200 &&
//         !loading &&
//         hasMore
//       ) {
//         dispatch(fetchFeed(type, page));
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
   
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [loading, hasMore, page, type, dispatch]);



//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
//         .feed-wrap { font-family: 'DM Sans', sans-serif; }
//         @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
//         .fade-up { animation: fadeUp 0.35s ease both; }
//         .create-box { transition: all 0.3s ease; }
//         .file-label:hover { background: rgba(192,133,82,0.15) !important; }
//       `}</style>
//       <div
//         className="feed-wrap w-full "
//         style={{
//           margin: "0 auto",
//           padding: "24px 12px 48px",
//         }}
//       >
//         {/*  FEED TYPE TABS  */}
//         <div
//           className="fade-up  flex  justify-between mb-6 border-b-2 border-[#e8d5c0] pb-5 "
//         >
//           {[
//             { key: "following", label: "Following", icon: "👥" },
//             { key: "forYou", label: "ForYou", icon: "✨" },
//             { key: "trending", label: "Trending", icon: "🔥" },
//             { key: "latest", label: "Latest", icon: "🕐" },

//           ].map(({ key, label, icon }) => (
//             <button
//               key={key}
//               onClick={() => {
//                 if (type !== key) {
//                   dispatch(setFeedType(key));
//                 }
//               }}
//               className={`flex  justify-between bg-[#8C5A3C] px-5 py-3 rounded-full cursor-pointer
//                 ${
//                   type === key
//                     ? "bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0]"
//                     : "bg-transparent text-[#8C5A3C]"
//                 }
//                 `}
//             >
//               <span>{icon}</span>
//               {label}
//             </button>
//           ))}
//         </div>

//         {/*  STORY FEED  */}
//         <div className="fade-up ml-[5vw] md:max-w-[80vw]">
//           <StoryFeed />
//         </div>

//         <StoryViewerModal />

//         {/*  STORY TAB: Show expanded story view  */}
//         {type === "story" ? (
//           <div className="fade-up ml-[5vw] md:max-w-[470px]">
//             <div
//               style={{
//                 background: "#fff",
//                 border: "1.5px solid #e8d5c0",
//                 borderRadius: 20,
//                 padding: "32px 24px",
//                 textAlign: "center",
//                 marginTop: 8,
//               }}
//             >
//               <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
//               <p style={{ fontWeight: 700, fontSize: 17, color: "#4B2E2B", marginBottom: 6 }}>
//                 Stories
//               </p>
//               <p style={{ fontSize: 13, color: "#a0714f", marginBottom: 16, lineHeight: 1.5 }}>
//                 View stories from people you follow above, or create your own story!
//               </p>
//               <button
//                 onClick={() => navigate("/create")}
//                 style={{
//                   padding: "10px 28px",
//                   borderRadius: 50,
//                   background: "linear-gradient(135deg, #C08552, #8C5A3C)",
//                   color: "#FFF8F0",
//                   border: "none",
//                   fontSize: 14,
//                   fontWeight: 600,
//                   cursor: "pointer",
//                   boxShadow: "0 4px 14px rgba(140,90,60,0.25)",
//                   transition: "all 0.2s",
//                 }}
//               >
//                 + Create Story
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/*  CREATE POST CARD  */}
//             <div
//               className="create-box fade-up ml-[5vw] md:max-w-[470px] bg-[#fff] border-[1px] border-[#e8d5c0] mb-5 shadow-sm rounded-3xl p-5"
//               onClick={() => navigate("/create")}
//             >
//               {/* Top row */}
//               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                 <img
//                   src={
//                     currentUser?.avatar
//                       ? `http://localhost:5000/${currentUser.avatar}`
//                       : "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
//                   }
//                   alt="avatar"
//                   style={{
//                     width: 42,
//                     height: 42,
//                     borderRadius: "50%",
//                     objectFit: "cover",
//                     border: "2px solid #C08552",
//                     flexShrink: 0,
//                   }}
//                 />
//                 <button
//                   onClick={() => setOpen(!open)}
//                   style={{
//                     flex: 1,
//                     textAlign: "left",
//                     background: "#FFF8F0",
//                     border: "1.5px solid #e1bc9c",
//                     borderRadius: 50,
//                     padding: "10px 18px",
//                     fontSize: 14,
//                     color: "#a0714f",
//                     cursor: "pointer",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   {open
//                     ? "Close Posting"
//                     : `What's on your mind, ${currentUser?.username || "friend"}?`}
//                 </button>
//                 <div className="flex text-xl">
//                   {[
//                     { icon: "🖼️" },
//                     { icon: "😊" },
//                     { icon: "📍" },
//                   ].map(({ icon, label }) => (
//                     <button
//                       key={label}
//                       onClick={() => setOpen(true)}
//                       className="bg-transparent p-1.5  cursor pointer rounded-2xl "
//                       style={{
//                         transition: "background 0.5s",
//                       }}
//                       onMouseEnter={(e) =>
//                         (e.currentTarget.style.background = "rgba(192,133,82,0.08)")
//                       }
//                       onMouseLeave={(e) =>
//                         (e.currentTarget.style.background = "transparent")
//                       }
//                     >
//                       <span>{icon}</span> {label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {!open && null}
//             </div>

//             {/*  POSTS FEED  */}
//             {loading && (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "40px 0",
//                   color: "#a0714f",
//                   fontSize: 14,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 36,
//                     height: 36,
//                     border: "3px solid #e1bc9c",
//                     borderTopColor: "#C08552",
//                     borderRadius: "50%",
//                     margin: "0 auto 12px",
//                     animation: "spin 0.8s linear infinite",
//                   }}
//                 />
//                 <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//                 Loading posts…
//               </div>
//             )}

//             {error && (
//               <div
//                 style={{
//                   background: "#fee2e2",
//                   border: "1px solid #fca5a5",
//                   borderRadius: 12,
//                   padding: "12px 16px",
//                   color: "#b91c1c",
//                   fontSize: 13,
//                   marginBottom: 16,
//                 }}
//               >
//                 {error}
//               </div>
//             )}

//             {!loading && posts.length === 0 && (
//               <div
//                 style={{ textAlign: "center", padding: "60px 0", color: "#a0714f" }}
//               >
//                 <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
//                 <p style={{ fontWeight: 600, fontSize: 15 }}>No posts yet</p>
//               </div>
//             )}

//             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//               {visiblePosts.map((post, i) => (
//                 <div
//                   key={post._id}
//                   className="fade-up"
//                   style={{ animationDelay: `${i * 0.05}s` }}
//                 >
//                   <PostCard post={post} />
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default Feed;



















 {/* {open && (
            <div style={{ marginTop: 16 }} className="fade-up">
              {/* ✅ PREVIEWS (images only, videos show placeholder) */}
          {/* {previews.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      {src ? (
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 12,
                          }}
                        />
                      ) : (
                        // Video placeholder
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            background: "#f0e0d0",
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                          }}
                        >
                          🎬
                        </div>
                      )}
                      <span
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          fontSize: 10,
                          background: files[i]?.type?.startsWith("video/")
                            ? "#ff4444"
                            : "#44ff44",
                          color: "white",
                          padding: "2px 4px",
                          borderRadius: 4,
                        }}
                      >
                        {files[i]?.type?.startsWith("video/")
                          ? "VIDEO"
                          : files[i]?.type === "image/gif"
                            ? "GIF"
                            : "IMG"}
                      </span>
                      <button
                        onClick={() => removeFile(i)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "rgba(41,29,28,0.7)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          cursor: "pointer",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )} */}

          {/* long-form text */}
          {/* <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts, story, or details here..."
                rows={3}
                style={{
                  width: "100%",
                  background: "#FFF8F0",
                  border: "1.5px solid #e1bc9c",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "#291d1c",
                  resize: "none",
                  outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  boxSizing: "border-box",
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}
              /> */}

          {/* Caption input */}
          {/* <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption or hashtags #example"
                style={{
                  width: "100%",
                  background: "#FFF8F0",
                  border: "1.5px solid #e1bc9c",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "#291d1c",
                  outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 10,
                }}
              /> */}

          {/* <div
                className="flex flex-col w-full"
                style={{ gap: 8, marginBottom: 10, width: "full" }}
              >
                <div className="w-full">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="📍 Location name"
                    className="w-full"
                    style={{
                      flex: 2,
                      background: "#FFF8F0",
                      border: "1.5px solid #e1bc9c",
                      borderRadius: 12,
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <div className="w-full flex flex-row">
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Lat"
                    style={{
                      flex: 1,
                      background: "#FFF8F0",
                      border: "1.5px solid #e1bc9c",
                      borderRadius: 12,
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      marginBottom: 4,
                      marginRight: 4,
                    }}
                  />
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Lng"
                    style={{
                      flex: 1,
                      height: "38px",
                      background: "#FFF8F0",
                      border: "1.5px solid #e1bc9c",
                      borderRadius: 12,
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div> */}

          {/* Action row */}
          {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 12,
                }}
              >
                <label
                  className="file-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    padding: "7px 14px",
                    borderRadius: 50,
                    background: "rgba(192,133,82,0.08)",
                    border: "1.5px solid #e1bc9c",
                    fontSize: 13,
                    color: "#8C5A3C",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  {files.length > 0
                    ? `Add more (${files.length})`
                    : "Add photo/video"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime,.gif"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 50,
                      border: "1.5px solid #c9a07a",
                      background: "transparent",
                      color: "#7a5c4f",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={
                      posting ||
                      (!caption.trim() && !content.trim() && files.length === 0)
                    }
                    style={{
                      padding: "8px 22px",
                      borderRadius: 50,
                      background: posting
                        ? "#c9a07a"
                        : "linear-gradient(135deg,#C08552,#8C5A3C)",
                      color: "#FFF8F0",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: posting ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      boxShadow: "0 4px 14px rgba(140,90,60,0.25)",
                      transition: "all 0.2s",
                    }}
                  >
                    {posting ? "Posting…" : "Share Post"}
                  </button>
                </div>
              </div>
            </div> */}
          {/* )}  */}





          import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { selectUser } from "../../../features/userSlice";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { selectHiddenPostIds } from "../../../features/notInterestedSlice";
import { fetchFeed } from "../../../features/feedActions";
import { setFeedType } from "../../../features/feedSlice";
import StoryFeed from "./StoryFeed";
import StoryViewerModal from "./StoryViewerModal";

import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading, error, page, hasMore, type } = useSelector(
    (state) => state.feed,
  );
  const hiddenPostIds = useSelector(selectHiddenPostIds);
  const currentUser = useSelector(selectUser);

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const visiblePosts = posts.filter((p) => !hiddenPostIds.includes(p._id));

  useEffect(() => {
    if (type !== "story") {
      dispatch(fetchFeed(type, 1));
    }
  }, [dispatch, type]);

  useEffect(() => {
    if (type === "story") return; 
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        dispatch(fetchFeed(type, page));
      }
    };

    window.addEventListener("scroll", handleScroll);
   
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page, type, dispatch]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .feed-wrap { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.35s ease both; }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      
      <div className="feed-wrap w-full max-w-full mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 pb-12 sm:pb-16">
        {/*  FEED TYPE TABS  */}
        <div className="fade-up flex flex-wrap sm:flex-nowrap justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 border-b-2 border-[#e8d5c0] pb-3 sm:pb-5">
          {[
            { key: "following", label: "Following", icon: "👥" },
            { key: "forYou", label: "ForYou", icon: "✨" },
            { key: "trending", label: "Trending", icon: "🔥" },
            { key: "latest", label: "Latest", icon: "🕐" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                if (type !== key) {
                  dispatch(setFeedType(key));
                }
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full cursor-pointer text-xs sm:text-sm md:text-base font-medium transition-all duration-300 flex-1 sm:flex-initial min-w-0
                ${
                  type === key
                    ? "bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] shadow-md"
                    : "bg-transparent text-[#8C5A3C] hover:bg-[#8C5A3C]/10"
                }
              `}
            >
              <span className="text-sm sm:text-base">{icon}</span>
              <span className="hidden xs:inline sm:inline truncate">{label}</span>
            </button>
          ))}
        </div>

        {/*  STORY FEED  */}
        <div className="fade-up w-full max-w-full md:max-w-[80vw] mx-auto md:ml-[5vw] mb-4 sm:mb-6">
          <StoryFeed />
        </div>

        <StoryViewerModal />

        {/*  STORY TAB: Show expanded story view  */}
        {type === "story" ? (
          <div className="fade-up w-full max-w-full sm:max-w-md md:max-w-[470px] mx-auto md:ml-[5vw] px-2 sm:px-0">
            <div className="bg-white border-[1.5px] border-[#e8d5c0] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center mt-2">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🖼️</div>
              <p className="font-bold text-base sm:text-lg md:text-xl text-[#4B2E2B] mb-2 sm:mb-3">
                Stories
              </p>
              <p className="text-xs sm:text-sm md:text-base text-[#a0714f] mb-4 sm:mb-6 leading-relaxed px-2">
                View stories from people you follow above, or create your own story!
              </p>
              <button
                onClick={() => navigate("/create")}
                className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#C08552] to-[#8C5A3C] text-[#FFF8F0] border-none text-xs sm:text-sm md:text-base font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                + Create Story
              </button>
            </div>
          </div>
        ) : (
          <>
            {/*  CREATE POST CARD  */}
            <div
              className="create-box fade-up w-full max-w-full sm:max-w-md md:max-w-[470px] mx-auto md:ml-[5vw] bg-white border border-[#e8d5c0] mb-4 sm:mb-5 md:mb-6 shadow-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 transition-all duration-300 hover:shadow-md"
              onClick={() => navigate("/create")}
            >
              {/* Top row */}
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={
                    currentUser?.avatar
                      ? `http://localhost:5000/${currentUser.avatar}`
                      : "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
                  }
                  alt="avatar"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#C08552] flex-shrink-0"
                />
                <button
                  onClick={() => setOpen(!open)}
                  className="flex-1 text-left bg-[#FFF8F0] border-[1.5px] border-[#e1bc9c] rounded-full px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-[#a0714f] cursor-pointer transition-all duration-200 hover:border-[#C08552] hover:bg-[#FFF8F0]/80"
                >
                  <span className="hidden sm:inline">
                    {open
                      ? "Close Posting"
                      : `What's on your mind, ${currentUser?.username || "friend"}?`}
                  </span>
                  <span className="sm:hidden">
                    {open ? "Close" : "What's on your mind?"}
                  </span>
                </button>
                
                <div className="hidden sm:flex text-lg sm:text-xl gap-0.5 sm:gap-1">
                  {[
                    { icon: "🖼️" },
                    { icon: "😊" },
                    { icon: "📍" },
                  ].map(({ icon }, idx) => (
                    <button
                      key={idx}
                      onClick={() => setOpen(true)}
                      className="bg-transparent p-1 sm:p-1.5 md:p-2 cursor-pointer rounded-xl hover:bg-[#C08552]/10 transition-all duration-300"
                    >
                      <span>{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/*  POSTS FEED  */}
            {loading && (
              <div className="text-center py-8 sm:py-10 md:py-12 text-[#a0714f] text-xs sm:text-sm md:text-base">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-3 border-[#e1bc9c] border-t-[#C08552] rounded-full mx-auto mb-3 sm:mb-4 animate-spin" />
                Loading posts…
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-red-700 text-xs sm:text-sm mb-4 sm:mb-5 max-w-full sm:max-w-md md:max-w-[470px] mx-auto md:ml-[5vw]">
                {error}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-12 sm:py-16 md:py-20 text-[#a0714f]">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">✦</div>
                <p className="font-semibold text-sm sm:text-base md:text-lg">No posts yet</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 w-full max-w-full sm:max-w-md md:max-w-[470px] mx-auto md:ml-[5vw]">
              {visiblePosts.map((post, i) => (
                <div
                  key={post._id}
                  className="fade-up w-full"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Feed;






