// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import Navbar from "../Navbar";
// import SideBar from "../SideBar";
// import RightPanel from "../RightPanel";
// import { getSingleHighlight, removeStoryFromHighlight } from "../../../features/highlightSlice";

// const HighlightDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { selectedHighlight, loading, error } = useSelector((state) => state.highlights);
//   const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

//   useEffect(() => {
//     if (id) {
//       dispatch(getSingleHighlight(id));
//     }
//   }, [id, dispatch]);

//   const handleNextStory = () => {
//     if (selectedHighlight?.stories) {
//       setCurrentStoryIndex((prev) => (prev + 1) % selectedHighlight.stories.length);
//     }
//   };

//   const handlePrevStory = () => {
//     if (selectedHighlight?.stories) {
//       setCurrentStoryIndex((prev) =>
//         prev === 0 ? selectedHighlight.stories.length - 1 : prev - 1
//       );
//     }
//   };

//   const handleRemoveStory = async (storyId) => {
//     if (!window.confirm("Remove this story from highlight?")) return;
//     dispatch(removeStoryFromHighlight({ highlightId: id, storyId }));
//   };

//   const currentStory = selectedHighlight?.stories?.[currentStoryIndex];

//   // Build full media URL
//   const getMediaUrl = (mediaUrl) => {
//     if (!mediaUrl) return "";
//     if (mediaUrl.startsWith("http")) return mediaUrl;
//     return `http://localhost:5000/${mediaUrl}`;
//   };

//   return (
//     <div className="bg-[#FFF8F0]">
//       <div className="fixed top-0 w-full z-50">
//         <Navbar />
//       </div>

//       <div className="flex mt-[3.7vw] mx-[8vw]">
//         <SideBar />

//         <div className="animate-[fadeIn_0.5s_ease] w-[80vw] md:max-w-[600px] mx-auto my-auto mt-[3.6vw] pb-20">
//           {loading ? (
//             <div className="text-center py-[60px] px-5 text-[#A7764A]">
//               <p>Loading highlight...</p>
//             </div>

//           ) : error ? (
//             <div className="text-center py-[60px] px-5 text-[#8C5A3C]">
//               <div className="text-5xl mb-4">⚠️</div>
//               <h3 className="text-lg font-semibold mb-2">Error Loading Highlight</h3>
//               <p className="text-sm opacity-70 mb-4">{error}</p>
//               <button
//                 onClick={() => navigate(-1)}
//                 className="px-6 py-2 bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] rounded-lg font-medium"
//               >
//                 Go Back
//               </button>
//             </div>

//           ) : selectedHighlight ? (
//             <>
//               {selectedHighlight.stories && selectedHighlight.stories.length > 0 ? (
//                 <div>
//                   {/* Story Viewer Container */}
//                   <div className="relative w-full max-w-[500px] mx-auto bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EB] rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(167,118,74,0.15)]"
//                   >

//                     {/* Close Button */}
//                     <button
//                       onClick={() => navigate(-1)}
//                       className="absolute top-4 right-4 w-10 h-10 bg-black/40 border-none rounded-full text-white text-2xl flex items-center justify-center z-20 transition-all duration-300 hover:bg-black/60 cursor-pointer"
//                     >
//                       ✕
//                     </button>

//                     {/* Story Media */}
//                     {currentStory?.mediaUrl ? (
//                       <img
//                         src={getMediaUrl(currentStory.mediaUrl)}
//                         alt="Story"
//                         className="w-full h-[500px] object-cover block bg-[#e8d5c0]"
//                         onError={(e) => {
//                           console.error("Failed to load story image:", getMediaUrl(currentStory.mediaUrl));
//                           e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23e8d5c0' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%238C5A3C' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-[500px] bg-[#e8d5c0] flex items-center justify-center text-[#8C5A3C] text-3xl">
//                         📸 No media
//                       </div>
//                     )}

//                   {/* Progress Bars + Header Overlay */}
//                   <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/30 to-transparent p-5 text-white z-10">
//                     <div className="flex gap-1 mb-4">
//                       {selectedHighlight.stories.map((_, idx) => (
//                         <div
//                           key={idx}
//                           className={`flex-1 h-0.5 rounded-[1px] overflow-hidden ${
//                             idx === currentStoryIndex ? "bg-white" : "bg-white/30"
//                           }`}
//                         />
//                       ))}
//                     </div>
//                     <div className="flex items-center justify-between font-semibold text-sm">
//                       <span>{currentStoryIndex + 1} of {selectedHighlight.stories.length}</span>
//                     </div>
//                   </div>

//                   {/* Prev Navigation */}
//                   <div
//                     onClick={handlePrevStory}
//                     className="absolute top-0 bottom-0 left-0 w-[20%] flex items-center justify-center cursor-pointer text-white text-[28px] z-[5] transition-all duration-300 hover:bg-black/10"
//                   >
//                     ‹
//                   </div>

//                   {/* Next Navigation */}
//                   <div
//                     onClick={handleNextStory}
//                     className="absolute top-0 bottom-0 right-0 w-[20%] flex items-center justify-center cursor-pointer text-white text-[28px] z-[5] transition-all duration-300 hover:bg-black/10"
//                   >
//                     ›
//                   </div>

//                   {/* Story Info Bottom Overlay */}
//                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent text-white p-5 z-10">
//                     <p className="text-sm opacity-90">
//                       {currentStory?.description || ""}
//                     </p>
//                   </div>

//                   {/* Remove Story Button */}
//                   <button
//                     onClick={() => handleRemoveStory(currentStory._id)}
//                     className="absolute bottom-5 right-5 bg-red-500/70 border-none text-white px-4 py-2 rounded-lg cursor-pointer text-xs font-semibold z-[15] transition-all duration-300 hover:bg-red-500/90"
//                   >
//                     Remove
//                   </button>
//                 </div>

//                 {/* Highlight Info */}
//                 <div className="text-center p-5 mt-8">
//                   <h2 className="text-3xl font-bold text-[#27261A] mb-2">
//                     ✨ {selectedHighlight.title}
//                   </h2>
//                   {selectedHighlight.description && (
//                     <p className="text-sm text-[#8C5A3C] opacity-80 mb-4">
//                       {selectedHighlight.description}
//                     </p>
//                   )}
//                   <div className="flex justify-center gap-4 text-xs font-semibold text-[#A7764A]">
//                     <div className="flex items-center gap-1">
//                       <span>📸</span>
//                       <span>{selectedHighlight.stories?.length || 0} Stories</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span>👁️</span>
//                       <span>{selectedHighlight.isPublic ? "Public" : "Private"}</span>
//                     </div>
//                   </div>
//                 </div>
//                 </div>

//               ) : (
//                 <div className="text-center py-[60px] px-5 text-[#8C5A3C]">
//                   <div className="text-5xl mb-4">📭</div>
//                   <h3 className="text-lg font-semibold mb-2">No Stories</h3>
//                   <p className="text-sm opacity-70 mb-4">
//                     This highlight doesn't have any stories yet
//                   </p>
//                   <button
//                     onClick={() => navigate(-1)}
//                     className="px-6 py-2 bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] rounded-lg font-medium"
//                   >
//                     Go Back
//                   </button>
//                 </div>
//               )}

//             </>

//           ) : (
//             <div className="text-center py-[60px] px-5 text-[#8C5A3C]">
//               <div className="text-5xl mb-4">🔍</div>
//               <h3 className="text-lg font-semibold mb-2">Highlight Not Found</h3>
//               <p className="text-sm opacity-70 mb-4">
//                 The highlight you're looking for doesn't exist
//               </p>
//               <button
//                 onClick={() => navigate("/media")}
//                 className="px-6 py-2 bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] rounded-lg font-medium"
//               >
//                 Back to Highlights
//               </button>
//             </div>
//           )}
//         </div>

//         <RightPanel />
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default HighlightDetail;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../Navbar";
import SideBar from "../SideBar";
import RightPanel from "../RightPanel";
import { getSingleHighlight, removeStoryFromHighlight } from "../../../features/highlightSlice";

const HighlightDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedHighlight, loading, error } = useSelector((state) => state.highlights);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(getSingleHighlight(id));
    }
  }, [id, dispatch]);

  const handleNextStory = () => {
    if (selectedHighlight?.stories) {
      setCurrentStoryIndex((prev) => (prev + 1) % selectedHighlight.stories.length);
    }
  };

  const handlePrevStory = () => {
    if (selectedHighlight?.stories) {
      setCurrentStoryIndex((prev) =>
        prev === 0 ? selectedHighlight.stories.length - 1 : prev - 1
      );
    }
  };

  const handleRemoveStory = async (storyId) => {
    if (!window.confirm("Remove this story from highlight?")) return;
    dispatch(removeStoryFromHighlight({ highlightId: id, storyId }));
  };

  const currentStory = selectedHighlight?.stories?.[currentStoryIndex];

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return "";
    if (mediaUrl.startsWith("http")) return mediaUrl;
    return `http://localhost:5000/${mediaUrl}`;
  };

  const renderStoryMedia = () => {
    if (!currentStory) return null;

    // Text story
    if (currentStory.type === "text") {
      return (
        <div
          className="w-full h-[500px] flex items-center justify-center p-8 text-center overflow-hidden"
          style={{
            backgroundColor: currentStory.textStyle?.backgroundColor || "#8C5A3C",
            color: currentStory.textStyle?.fontColor || "#fff",
            fontSize: `${currentStory.textStyle?.fontSize || 24}px`,
            fontFamily: currentStory.textStyle?.fontFamily || "DM Sans",
          }}
        >
          <p className="whitespace-pre-wrap break-words text-center leading-relaxed overflow-hidden">{currentStory.textContent}</p>
        </div>
      );
    }

    // Video story
    if (currentStory.type === "video") {
      return (
        <video
          key={currentStory._id}
          src={getMediaUrl(currentStory.mediaUrl)}
          className="w-full h-[500px] object-cover block bg-[#e8d5c0]"
          autoPlay
          playsInline
          onEnded={handleNextStory}
        />
      );
    }

    // Image story (default)
    if (currentStory.mediaUrl) {
      return (
        <img
          src={getMediaUrl(currentStory.mediaUrl)}
          alt="Story"
          className="w-full h-[500px] object-cover block bg-[#e8d5c0]"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23e8d5c0' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%238C5A3C' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
          }}
        />
      );
    }

    return (
      <div className="w-full h-[500px] bg-[#e8d5c0] flex items-center justify-center text-[#8C5A3C] text-3xl">
        📸 No media
      </div>
    );
  };

  return (
    <div className="bg-[#FFF8F0]">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      <div className="flex mt-[3.7vw] mx-[8vw]">
        <SideBar />

        <div className="animate-[fadeIn_0.5s_ease] w-[80vw] md:max-w-[600px] mx-auto my-auto mt-[3.6vw] pb-20">
          {loading ? (
            <div className="text-center py-[60px] px-5 text-[#A7764A]">
              <p>Loading highlight...</p>
            </div>

          ) : error ? (
            <div className="text-center py-[60px] px-5 text-[#8C5A3C]">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Highlight</h3>
              <p className="text-sm opacity-70 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] rounded-lg font-medium"
              >
                Go Back
              </button>
            </div>

          ) : selectedHighlight ? (
            <>
              {selectedHighlight.stories && selectedHighlight.stories.length > 0 ? (
                <div>
                  {/* Story Viewer Container */}
                  <div className="relative w-full max-w-[500px] mx-auto bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EB] rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(167,118,74,0.15)]">

                    {/* Close Button */}
                    <button
                      onClick={() => navigate(-1)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/40 border-none rounded-full text-white text-2xl flex items-center justify-center z-20 transition-all duration-300 hover:bg-black/60 cursor-pointer"
                    >
                      ✕
                    </button>

                    {/* Story Media — supports image, video, and text */}
                    {renderStoryMedia()}

                    {/* Progress Bars + Header Overlay */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/30 to-transparent p-5 text-white z-10">
                      <div className="flex gap-1 mb-4">
                        {selectedHighlight.stories.map((_, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 h-0.5 rounded-[1px] overflow-hidden ${
                              idx === currentStoryIndex ? "bg-white" : "bg-white/30"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between font-semibold text-sm">
                        <span>{currentStoryIndex + 1} of {selectedHighlight.stories.length}</span>
                        {/* Show story type badge */}
                        {currentStory?.type && (
                          <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full capitalize">
                            {currentStory.type === "video" ? "🎥" : currentStory.type === "text" ? "📝" : "🖼️"} {currentStory.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prev Navigation */}
                    <div
                      onClick={handlePrevStory}
                      className="w-5 h-5 absolute top-60 bottom-0 left-0 flex items-center justify-center cursor-pointer text-white text-[28px] z-[5] transition-all duration-300 hover:bg-black/10"
                    >
                      ‹
                    </div>

                    {/* Next Navigation */}
                    <div
                      onClick={handleNextStory}
                      className="w-5 h-5 absolute top-60  right-0  flex items-center justify-center cursor-pointer text-white text-[28px] z-[5] transition-all duration-300 hover:bg-black/10"
                    >
                      ›
                    </div>

                    {/* Story Info Bottom Overlay — hidden for text stories since content is the story */}
                    {currentStory?.type !== "text" && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent text-white p-5 z-10">
                        <p className="text-sm opacity-90">
                          {currentStory?.description || ""}
                        </p>
                      </div>
                    )}

                    {/* Remove Story Button */}
                    <button
                      onClick={() => handleRemoveStory(currentStory._id)}
                      className="absolute bottom-5 right-5 bg-red-500/70 border-none text-white px-4 py-2 rounded-lg cursor-pointer text-xs font-semibold z-[15] transition-all duration-300 hover:bg-red-500/90"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Highlight Info */}
                  <div className="text-center p-5 mt-8">
                    <h2 className="text-3xl font-bold text-[#27261A] mb-2">
                      ✨ {selectedHighlight.title}
                    </h2>
                    {selectedHighlight.description && (
                      <p className="text-sm text-[#8C5A3C] opacity-80 mb-4">
                        {selectedHighlight.description}
                      </p>
                    )}
                    <div className="flex justify-center gap-4 text-xs font-semibold text-[#A7764A]">
                      <div className="flex items-center gap-1">
                        <span>📸</span>
                        <span>{selectedHighlight.stories?.length || 0} Stories</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👁️</span>
                        <span>{selectedHighlight.isPublic ? "Public" : "Private"}</span>
                      </div>
                    </div>
                  </div>
                </div>

              ) : (
                <div className="text-center py-[60px] px-5 text-[#8C5A3C]">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold mb-2">No Stories</h3>
                  <p className="text-sm opacity-70 mb-4">
                    This highlight doesn't have any stories yet
                  </p>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] rounded-lg font-medium"
                  >
                    Go Back
                  </button>
                </div>
              )}
            </>

          ) : (
            <div className="text-center py-[60px] px-5 text-[#8C5A3C]">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Highlight Not Found</h3>
              <p className="text-sm opacity-70 mb-4">
                The highlight you're looking for doesn't exist
              </p>
              <button
                onClick={() => navigate("/media")}
                className="px-6 py-2 bg-gradient-to-br from-[#A7764A] to-[#27261A] text-[#FFF8F0] rounded-lg font-medium"
              >
                Back to Highlights
              </button>
            </div>
          )}
        </div>

        <RightPanel />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HighlightDetail;