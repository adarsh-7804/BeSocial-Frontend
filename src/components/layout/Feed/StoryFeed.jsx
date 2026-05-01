import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories, setActiveStoryGroup } from "../../../features/storySlice";
import { selectUser } from "../../../features/userSlice";
import { getImageUrl } from "../../../utils/getImageUrl";
import "./style/stories.css";

function avatarUrl(user) {
  return getImageUrl(user?.avatar);
}

const StoryFeed = () => {
  const dispatch = useDispatch();
  const { groupedStories, loading } = useSelector((s) => s.stories);
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  if (loading && groupedStories.length === 0) {
    return (
      <div className="story-feed-loading">
        <div className="story-feed-spinner" />
      </div>
    );
  }

  if (groupedStories.length === 0) return null;

  return (
    <div className="story-feed-wrapper">
      <div className="story-feed-scroll">
        {groupedStories.map((group, idx) => {
          const isOwner = currentUser?._id === group.user._id;
          const latestStory = group.stories[0];
          const hasMedia = latestStory?.mediaUrl;

          return (
            <div
              key={group.user._id}
              className="story-card"
              onClick={() => dispatch(setActiveStoryGroup(idx))}
            >
              {/* Ring indicator */}
              <div className={`story-avatar-ring ${group.hasUnviewed ? "unviewed" : "viewed"}`}>
                <img
                  src={avatarUrl(group.user)}
                  alt={group.user.username || group.user.firstName}
                  className="story-avatar-img"
                />
              </div>

              {/* Background preview */}
              <div className="story-card-bg">
                {hasMedia ? (
                  latestStory.type === "video" ? (
                    <div className="story-card-bg-overlay story-video-bg">
                      <span className="story-video-icon">▶</span>
                    </div>
                  ) : (
                    <img
                      src={latestStory.mediaUrl.startsWith("http") ? latestStory.mediaUrl : `${import.meta.env.VITE_SERVER_URL}/${latestStory.mediaUrl}`}
                      alt=""
                      className="story-card-bg-img"
                    />
                  )
                ) : (
                  <div
                    className="story-card-bg-text"
                    style={{
                      backgroundColor: latestStory?.textStyle?.backgroundColor || "#8C5A3C",
                      color: latestStory?.textStyle?.fontColor || "#fff",
                    }}
                  >
                    <span>{latestStory?.textContent?.slice(0, 40) || ""}</span>
                  </div>
                )}
              </div>

              {/* Username */}
              <p className="story-card-name">
                {isOwner ? "Your Story" : (group.user.firstName || group.user.username)}
              </p>

              {/* Story count badge */}
              {group.stories.length > 1 && (
                <span className="story-count-badge">{group.stories.length}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryFeed;
