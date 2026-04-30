import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScheduledPostThunk,
  cancelScheduledPostThunk,
  selectScheduledPosts,
  selectScheduledPostsLoading,
} from "../../../features/scheduledPostSlice";
import Navbar from "../Navbar";
import SideBar from "../SideBar";
import RightPanel from "../RightPanel";
                                                                                                                              
const ScheduledPostsList = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectScheduledPosts);
  const isLoading = useSelector(selectScheduledPostsLoading);

  useEffect(() => {
    dispatch(fetchScheduledPostThunk());
    const interval = setInterval(() => {
      dispatch(fetchScheduledPostThunk());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleCancel = (id) => {
    if (confirm("Cancel this scheduled post?")) {
      dispatch(cancelScheduledPostThunk(id));
    }
  };

  const getTimeRemaining = (scheduledAt) => {
    const diff = new Date(scheduledAt) - new Date();
    if (diff <= 0) return "Publishing soon...";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) return `${Math.floor(hours / 24)} days left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes} minutes left`;
  };

  return (
    <div className="bg-[#FFF8F0] min-h-screen">
      <Navbar />
      <div className="flex flex-row">
        <div className="w-[19.5vw] ml-[8vw]">
          <SideBar />
        </div>

        <div className="w-[42.2vw] mt-[1vw] mr-[1.3vw] space-y-4">
          <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-xl/10">
            <h2 className="text-xl font-bold text-[#4B2E2B] mb-4">
              ⏰ Scheduled Posts
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scheduled posts. Create a post and schedule it for later!
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="border border-[#E1BC9C] rounded-xl p-4 bg-[#FFF8F0]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-1 bg-[#C08552] text-white rounded-full">
                            {post.audience}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTimeRemaining(post.scheduledAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-[#4B2E2B] line-clamp-2 mb-2">
                          {post.content || post.caption || "(No text)"}
                        </p>
                        
                        {post.media.length > 0 && (
                          <p className="text-xs text-gray-500">
                            📎 {post.media.length} media file(s)
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(post.scheduledAt).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancel(post._id)}
                        className="ml-4 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default ScheduledPostsList;