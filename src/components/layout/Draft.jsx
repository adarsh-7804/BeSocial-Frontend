import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDraftsThunk,
  deleteDraftThunk,
  publishDraftThunk,
  selectDrafts,
  selectDraftsLoading,
  selectDraftsError,
} from "../../features/draftSlice";
import {
  fetchSavedPostsThunk,
  unsavePostThunk,
  selectSavedPosts,
  selectSavedPostsLoading,
  selectSavedPostsError,
} from "../../features/savedPostsSlice";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import RightPanel from "./RightPanel";
import DraftCard from "./DraftCard";
import SavedPostCard from "./SavedPostCard";
import { CiFileOn } from "react-icons/ci";
import { FaBookmark, FaPencilAlt } from "react-icons/fa";

const Draft = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Drafts state
  const drafts = useSelector(selectDrafts);
  const draftsLoading = useSelector(selectDraftsLoading);
  const draftsError = useSelector(selectDraftsError);

  // Saved posts state
  const savedPosts = useSelector(selectSavedPosts);
  const savedLoading = useSelector(selectSavedPostsLoading);
  const savedError = useSelector(selectSavedPostsError);

  // Local loading states
  const [publishing, setPublishing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    dispatch(fetchDraftsThunk());
    dispatch(fetchSavedPostsThunk());
  }, [dispatch]);

  // Draft handlers
  const handleDeleteDraft = async (draftId) => {
    setDeleting(draftId);
    await dispatch(deleteDraftThunk(draftId));
    setDeleting(null);
  };

  const handlePublishDraft = async (draftId) => {
    setPublishing(draftId);
    const result = await dispatch(publishDraftThunk(draftId));
    if (publishDraftThunk.fulfilled.match(result)) {
      dispatch(fetchPosts());
    }
    setPublishing(null);
  };

  const handleEditDraft = (draft) => {
    navigate("/create", { state: { draft } });
  };

  const handleRemoveSaved = async (postId) => {
    setRemoving(postId);
    await dispatch(unsavePostThunk(postId));
    setRemoving(null);
  };

  const handleCreateNew = () => navigate("/create");

  return (
    <div className="bg-[#FFF8F0] min-h-screen ">
      <div className="">
      <Navbar />
      </div>
      <div className="flex flex-row">
        <div className="w-[19.5vw] ml-[8vw]">
          <SideBar />
        </div>

        {/* Main content */}
        <div className="w-[42.2vw] ml-5 mr-3 mt-[1vw] mb-[1.5vw]">
          
          {/*  DRAFTS SECTION  */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0e0d0] overflow-hidden mb-6">
            <div className="bg-[#815F3C] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaPencilAlt className="text-white/80" size={18} />
                <div>
                  <h2 className="text-white font-bold text-lg">My Drafts</h2>
                  <p className="text-[#f5dfc5] text-xs mt-0.5">
                    {drafts.length} saved draft{drafts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 
                           text-white text-sm font-semibold px-4 py-2 rounded-full 
                           transition-colors"
              >
                + New Post
              </button>
            </div>
          </div>

          {/* Drafts Loading */}
          {draftsLoading && !drafts.length && (
            <div className="flex justify-center items-center py-12 text-[#8C5A3C]">
              <div className="w-8 h-8 border-2 border-[#C08552] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Drafts Error */}
          {draftsError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-4">
              {draftsError}
            </div>
          )}

          {/* Empty Drafts */}
          {!draftsLoading && !drafts.length && (
            <div className="bg-white rounded-2xl border border-[#f0e0d0] p-8 text-center mb-8">
              <CiFileOn size={40} className="text-[#E1BC9C] mx-auto mb-3" />
              <p className="text-[#8C5A3C] font-semibold mb-1">No drafts yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Start writing a post and save it as a draft.
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-gradient-to-br from-[#C08552] to-[#8C5A3C] text-white 
                           text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Create a Post
              </button>
            </div>
          )}

          {/* Drafts Grid */}
          {drafts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mb-10">
              {drafts.map((draft) => (
                <DraftCard
                  key={draft._id}
                  draft={draft}
                  onDelete={handleDeleteDraft}
                  onPublish={handlePublishDraft}
                  onEdit={handleEditDraft}
                  publishing={publishing}
                  deleting={deleting}
                />
              ))}
            </div>
          )}

          {/*  SAVED POSTS SECTION  */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0e0d0] overflow-hidden mb-6 mt-8">
            <div className="bg-gradient-to-r from-[#C08552] to-[#8C5A3C] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaBookmark className="text-white/80" size={18} />
                <div>
                  <h2 className="text-white font-bold text-lg">Saved Posts</h2>
                  <p className="text-[#f5dfc5] text-xs mt-0.5">
                    {savedPosts.length} bookmarked post{savedPosts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Posts Loading */}
          {savedLoading && !savedPosts.length && (
            <div className="flex justify-center items-center py-12 text-[#8C5A3C]">
              <div className="w-8 h-8 border-2 border-[#C08552] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Saved Posts Error */}
          {savedError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-4">
              {savedError}
            </div>
          )}

          {/* Empty Saved Posts */}
          {!savedLoading && !savedPosts.length && (
            <div className="bg-white rounded-2xl border border-[#f0e0d0] p-8 text-center">
              <FaBookmark size={40} className="text-[#E1BC9C] mx-auto mb-3" />
              <p className="text-[#8C5A3C] font-semibold mb-1">No saved posts</p>
              <p className="text-sm text-gray-400 mb-4">
                Bookmark posts you want to revisit later.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-br from-[#C08552] to-[#8C5A3C] text-white 
                           text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Browse Feed
              </button>
            </div>
          )}

          {/* Saved Posts Grid */}
          {savedPosts.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {savedPosts.map((savedPost) => (
                <SavedPostCard
                  key={savedPost._id}
                  savedPost={savedPost}
                  onRemove={handleRemoveSaved}
                  removing={removing}
                />
              ))}
            </div>
          )}
        </div>

        <div className="">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default Draft;