import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuggestions } from "../../features/userSlice";
import FriendButton from "./FriendButton";
import { useNavigate } from "react-router-dom";

const TRENDING = [
  "#BeSocial",
  "#Photography",
  "#TechLife",
  "#TravelDiaries",
  "#FoodPhotography",
];

const RightPanel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const suggestions = useSelector((state) => state.user.suggestions);
  const currentUser = useSelector((state) => state.user.user);

  const [excludedIds, setExcludedIds] = useState(new Set());

  const displayedSuggestions = (suggestions || []).filter(
    (user) => !excludedIds.has(user._id?.toString()),
  );

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [currentUser?.friends?.length, currentUser?.friendRequestsSent?.length]);

  const handleSuggestionSent = (userId) => {
    setExcludedIds((prev) => new Set([...prev, userId.toString()]));
  };

  const handleSuggestionCancelled = (userId) => {
    setExcludedIds((prev) => new Set([...prev, userId.toString()]));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .rpanel { font-family: 'DM Sans', sans-serif; }
        .tag-pill { display: inline-block; padding: 5px 12px; border-radius: 50px; background: rgba(192,133,82,0.1); border: 1px solid #e8d5c0; color: #8C5A3C; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.18s; }
        .tag-pill:hover { background: rgba(192,133,82,0.2); }
      `}</style>

      <aside
        className="rpanel"
        style={{
          width: "27.5vw",
          minWidth: 220,
          maxWidth: 280,
          height: "calc(100vh - 56px)",
          position: "sticky",
          top: 56,
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          borderLeft: "1px solid #f0e0d0",
          background: "#fff",
          overflowY: "auto",
        }}
      >
        {/* Suggestions */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: "#291d1c",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Suggested for you
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {displayedSuggestions.map((user) => (
              <div
                key={user._id}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <img
                  src={
                    user?.avatar
                      ? (user.avatar.startsWith("http") || user.avatar.startsWith("blob:")
                        ? user.avatar
                        : `${import.meta.env.VITE_SERVER_URL}/${user.avatar}`)
                      : "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
                  }
                  alt={user.firstName}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #e1bc9c",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p
                    onClick={() => navigate(`/profile/${user._id}`)}
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#291d1c",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </p>
                </div>

                <FriendButton
                  userId={user._id}
                  onSend={handleSuggestionSent}
                  onCancel={handleSuggestionCancelled}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "#f0e0d0" }} />

        {/* Trending */}
        <div>
          <h3
            style={{
              margin: "0 0 14px",
              fontSize: 13,
              fontWeight: 700,
              color: "#291d1c",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Trending topics
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TRENDING.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "#f0e0d0" }} />

        {/* Footer */}
        <div style={{ marginTop: "auto" }}>
          <p style={{ fontSize: 11, color: "#c9a07a", lineHeight: 1.8 }}>
            About · Privacy · Terms · Advertising
            <br />
            BeSocial © 2025
          </p>
        </div>
      </aside>
    </>
  );
};

export default RightPanel;
