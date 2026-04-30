import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPosts } from "../../api/postsApi";
import { useParams, useNavigate } from "react-router-dom";
import { getMutualConnections, selectUser } from "../../features/userSlice";
import { getProfile } from "../../features/userSlice";
import FriendButton from "./FriendButton";
import  PostCard  from "../layout/Feed/PostCard"

const Ic = ({ d, size = 14, color = "currentColor", sw = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const HEART =
  "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z";
const COMMENT = "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z";
const GRID = "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z";
const USER =
  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z";
const SEND = "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z";

export default function UserDatalist({ profile }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  const [cancelledRequestIds, setCancelledRequestIds] = useState(new Set());
  const [removedFriendIds, setRemovedFriendIds] = useState(new Set());
  const [friendsList, setFriendsList] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("all");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const currentUser = useSelector(selectUser);
  const { mutualConnections, mutualCount } = useSelector((state) => state.user);

  const isOwnProfile = currentUser?._id === profile?._id;

  useEffect(() => {
    setCancelledRequestIds(new Set());
    setRemovedFriendIds(new Set());
  }, [profile?._id, currentUser?._id]);

  const mutualIds = new Set(
    mutualConnections.map((u) => u._id?.toString() || u.toString()),
  );

  const getMutualCount = (user) => {
    if (!currentUser?.friends || !user?.friends) return 0;

    const currentIds = currentUser.friends.map((f) => f._id.toString());

    return user.friends.filter((f) => currentIds.includes(f._id.toString()))
      .length;
  };

  useEffect(() => {
    if (id) dispatch(getMutualConnections(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (isOwnProfile && currentUser?._id) {
      dispatch(getProfile());
    }
  }, [currentUser?.friends?.length, isOwnProfile, dispatch]);

  // Posts
 
  useEffect(() => {
    if (!profile?._id) return;

    const loadPosts = async () => {
      try {
        const res = await fetchUserPosts(profile._id);

        // console.log("USER POSTS:", res);

        setPosts(res.posts || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadPosts();
  }, [profile?._id]);

  const rawSentRequests = isOwnProfile
    ? currentUser?.friendRequestsSent || []
    : profile?.friendRequestsSent || [];

  const displayedSentRequests = rawSentRequests.filter((user) => {
    const uid = user?._id?.toString() ?? user?.toString();
    return !cancelledRequestIds.has(uid);
  });

  // Filtered  Friends  list
  const friendsSource = isOwnProfile ? currentUser?.friends : profile?.friends;
  const displayedFriends = (friendsSource || []).filter((user) => {
    const uid = user?._id?.toString() ?? user?.toString();
    return !removedFriendIds.has(uid);
  });

  const handleRequestCancelled = (userId) => {
    setCancelledRequestIds((prev) => new Set([...prev, userId.toString()]));
  };


  const handleFriendRemoved = (userId) => {
    setRemovedFriendIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId?.toString());
      return newSet;
    });
  };

  const handleStatClick = (key) => {
    setActiveTab((prev) => (prev === key && key !== "posts" ? "posts" : key));
    setFriendsFilter("all");
  };

  const isMutual = (userId) =>
    mutualIds.has(userId?._id?.toString() || userId?.toString());

  const avatar = (user) =>
    user?.avatar
      ? `http://localhost:5000/${user.avatar}`
      : "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";

  const stats = [
    { label: "No. of Posts", val: posts.length, key: "posts", icon: GRID },
    {
      label: "Friends",
      val: displayedFriends.length,
      key: "friends",
      icon: USER,
    },
    {
      label: "Requested",
      val: displayedSentRequests.length,
      key: "sent",
      icon: SEND,
    },
  ];

  return (
    <div
      className="w-[46.4vw] bg-[#FFF8F0] flex flex-col overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .import PostCard from './../../../../new';
tab-slide-enter { animation: slideDown 0.22s cubic-bezier(.4,0,.2,1) both; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .user-row:hover .user-row-arrow { opacity: 1; transform: translateX(0); }
        .user-row-arrow { opacity: 0; transform: translateX(-4px); transition: all 0.15s ease; }
      `}</style>

      <div className="mx-4 mb-4 flex-1 border-2 border-[#C08552]/40 rounded-2xl overflow-hidden shadow-sm bg-white/50 flex flex-col">
        {/*  STATS / TAB BAR  */}
        <div className="grid grid-cols-3 border-b-2 border-[#C08552]/40 shrink-0">
          {stats.map(({ label, val, key }, idx) => {
            const isActive = activeTab === key;
            return (
              <div
                key={key}
                onClick={() => handleStatClick(key)}
                className={`relative flex flex-col items-center justify-center py-3 cursor-pointer
                  transition-colors duration-150
                  ${idx < 2 ? "border-r-2 border-[#C08552]/40" : ""}
                  ${isActive ? "bg-[#C08552]/10" : "hover:bg-[#C08552]/5"}`}
              >
                {isActive && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[2.5px] bg-[#C08552] rounded-full" />
                )}
                <span
                  className={`text-xl font-bold transition-colors duration-150
                    ${isActive ? "text-[#C08552]" : "text-[#2C1A0E]"}`}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {val}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5
                  ${isActive ? "text-[#C08552]" : "text-[#8C5A3C]"}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/*  CONTENT AREA  */}
        <div className= "  flex-1 flex flex-col overflow-hidden">
          {/*  POSTS TAB  */}
          {activeTab === "posts" && (
            <div className="flex flex-col flex-1 tab-slide-enter">
              <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
                <Ic d={GRID} size={14} color="#C08552" />
                <span
                  className="text-[11px] font-bold uppercase tracking-widest text-[#8C5A3C]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Posts
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#C08552]/40 py-12">
                  <Ic d={GRID} size={32} color="#C08552" sw={1} />
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    No posts yet
                  </span>
                </div>
              ) : (
                <div className= "w-full flex flex-col gap-4 px-4 pb-4 overflow-hidden">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/*  FRIENDS TAB */}

          {activeTab === "friends" && (
            <div className="flex flex-col flex-1 overflow-y-auto tab-slide-enter">
              <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
                <Ic d={USER} size={14} color="#C08552" />

                <button
                  onClick={() => setFriendsFilter("all")}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-colors
          ${
            friendsFilter === "all"
              ? "text-[#C08552] underline underline-offset-2"
              : "text-[#8C5A3C] hover:text-[#C08552]"
          }`}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    cursor: "pointer",
                  }}
                >
                  Friends
                </button>

                {mutualCount > 0 && (
                  <>
                    <span className="text-[#C08552]/40 text-[11px]">·</span>
                    <button
                      onClick={() =>
                        setFriendsFilter((prev) =>
                          prev === "mutual" ? "all" : "mutual",
                        )
                      }
                      className={`text-[11px] font-bold uppercase tracking-widest transition-colors
              ${
                friendsFilter === "mutual"
                  ? "text-[#C08552] underline underline-offset-2"
                  : "text-[#8C5A3C] hover:text-[#C08552]"
              }`}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        cursor: "pointer",
                      }}
                    >
                      <span className="text-[15px] mr-1">{mutualCount}</span>
                      Mutual
                    </button>
                  </>
                )}
              </div>

              {(() => {
                const filtered =
                  friendsFilter === "mutual"
                    ? displayedFriends.filter((u) => isMutual(u))
                    : displayedFriends;

                return !filtered.length ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#C08552]/40 py-12">
                    <Ic d={USER} size={32} color="#C08552" sw={1} />
                    <span className="text-xs uppercase tracking-widest font-semibold">
                      {friendsFilter === "mutual"
                        ? "No mutual friends"
                        : "No friends yet"}
                    </span>
                  </div>
                ) : (
                  <div className="px-3 pb-3 flex flex-col gap-1">
                    {filtered.map((user) => {
                      const mutual = isMutual(user);
                      return (
                        <div
                          key={user._id || user}
                          onClick={() => navigate(`/profile/${user._id}`)}
                          className="user-row flex items-center gap-3 px-3 py-2.5
                  rounded-xl cursor-pointer hover:bg-[#C08552]/8
                  border border-transparent hover:border-[#C08552]/20
                  transition-all duration-150 group"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={avatar(user)}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C08552]/20"
                            />
                            {mutual && (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5
                      bg-[#C08552] rounded-full border-2 border-white
                      flex items-center justify-center"
                                title="Mutual friend"
                              >
                                <svg
                                  width="7"
                                  height="7"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                >
                                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#2C1A0E] truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            {mutual && (
                              <p className="text-[10px] text-[#C08552] font-semibold uppercase tracking-wide">
                                Mutual Friend
                              </p>
                            )}
                          </div>

                          {isOwnProfile && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <FriendButton
                                userId={user._id}
                                onRemove={handleFriendRemoved}
                                onCancel={handleRequestCancelled}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="flex flex-col flex-1 overflow-y-auto tab-slide-enter">
              <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
                <Ic d={SEND} size={14} color="#C08552" />
                <span
                  className="text-[11px] font-bold uppercase tracking-widest text-[#8C5A3C]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Requests Sent
                </span>
              </div>

              {!displayedSentRequests.length ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#C08552]/40 py-12">
                  <Ic d={SEND} size={32} color="#C08552" sw={1} />
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    No pending requests
                  </span>
                </div>
              ) : (
                <div className="px-3 pb-3 flex flex-col gap-1">
                  {displayedSentRequests.map((user) => (
                    <div
                      key={user._id || user}
                      className="user-row flex items-center gap-3 px-3 py-2.5
                        rounded-xl hover:bg-[#C08552]/8
                        border border-transparent hover:border-[#C08552]/20
                        transition-all duration-150"
                    >
                      <div
                        className="shrink-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${user._id}`)}
                      >
                        <img
                          src={avatar(user)}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C08552]/20"
                        />
                      </div>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${user._id}`)}
                      >
                        <p className="text-sm font-semibold text-[#2C1A0E] truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-[#8C5A3C] font-medium">
                          Request pending
                        </p>
                      </div>

                      {isOwnProfile && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <FriendButton
                            userId={user._id || user}
                            onCancel={handleRequestCancelled}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
