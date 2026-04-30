import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPostById, incrementViewCount } from "../../../api/postsApi";
import PostCard from "./PostCard";
import Navbar from "../Navbar";
import SideBar from "../SideBar";
import RightPanel from "../RightPanel";

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPost = async () => {
      try {
        setLoading(true);
        console.log("Fetching post with ID:", id);
        
        const data = await fetchPostById(id);
        console.log("Post fetched successfully:", data);
        setPost(data);
        setError(null);
        
        try {
          const viewResponse = await incrementViewCount(id);
          console.log("View tracked:", viewResponse);
          if (viewResponse && viewResponse.views) {
            setPost(prevPost => ({
              ...prevPost,
              views: {
                ...prevPost.views,
                count: viewResponse.views
              }
            }));
          }
        } catch (err) {
          console.error("Error tracking view:", err);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(`Failed to load post: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-amber-900 font-semibold">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <p className="text-amber-700 text-sm mb-6">The post you're looking for doesn't exist, has been deleted, or you don't have permission to view it.</p>
          <button
            onClick={() => navigate("/main")}
            className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition"
          >
            ← Back to Feed
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-amber-900 font-semibold">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0]  ">
      <div className="sticky top-0 w-full z-50">
        <Navbar />
      </div>
      <div className="flex flex-row">
        <div className="w-[20vw] hidden lg:block">
          <SideBar />
        </div>
        <div className="flex-1 flex justify-center px-4 py-8">
          <PostCard post={post} />
        </div>
        <div className="w-[20vw] hidden lg:block">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
