import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { selectUser } from "../../features/userSlice";
import { getImageUrl } from "../../utils/getImageUrl";
import {
  CiHome,
  CiImageOn ,
  CiUser,
  CiBellOn,
  CiSettings,
  CiBookmark,
} from "react-icons/ci";
import { AiOutlinePlusCircle } from "react-icons/ai";

const NAV = [
  { icon: CiHome, label: "Home", path: "/main" },
  { icon: CiImageOn , label: "Gallary", path: "/media" },
  { icon: CiBellOn, label: "Scheduled Posts", path: "/scheduled-posts" },
  { icon: CiBookmark, label: "Save & Draft", path: "/draft" },
  { icon: CiUser, label: "Profile", path: "/profile" },
  { icon: CiUser, label: "Refer", path: "/refer" },
  { icon: CiSettings, label: "Settings", path: "/settings" },
];

const SideBar = () => {
  const currentUser = useSelector(selectUser);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const requests = currentUser?.friendRequestsReceived || [];

  const fullName =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : "User";

      // console.log("CURRENT USER:", currentUser);

    const numRequest = requests.length; 


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .sidebar { font-family: 'DM Sans', sans-serif; }
        .nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; cursor:pointer; transition:all 0.18s; border:none; background:none; width:100%; text-align:left; font-family:'DM Sans',sans-serif; }
        .nav-item:hover { background: rgba(192,133,82,0.12); }
        .nav-item.active { background: rgba(192,133,82,0.18); }
      `}</style>

      <aside
        className="sidebar"
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
          gap: 6,
          borderRight: "1px solid #f0e0d0",
          background: "#fff",
          overflowY: "auto",
        }}
      >
        {/* Profile card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 14px 16px",
            marginBottom: 8,
            background:
              "linear-gradient(135deg,rgba(192,133,82,0.12),rgba(140,90,60,0.06))",
            borderRadius: 16,
            border: "1px solid #e8d5c0",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={getImageUrl(currentUser?.avatar)}
              alt="profile"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2.5px solid #C08552",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 1,
                right: 1,
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #fff",
              }}
            />
          </div>
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 14,
                color: "#291d1c",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentUser?.firstName ? fullName : "User"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#8C5A3C" }}>
              {currentUser?.email || ""}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = pathname === path;
            return (
              <button
                key={label}
                className={`nav-item${active ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon
                  style={{
                    fontSize: 22,
                    color: active ? "#8C5A3C" : "#4B2E2B",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#291d1c" : "#4B2E2B",
                  }}
                >
                  {label}
                </span>
                {label === "Notifications" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#C08552",
                      color: "#fff",
                      borderRadius: 50,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                    }}
                  >
                    {numRequest}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Create post CTA */}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button
            onClick={() => navigate("/create")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px",
              borderRadius: 14,
              background: "linear-gradient(135deg,#C08552,#8C5A3C)",
              color: "#FFF8F0",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              boxShadow: "0 4px 16px rgba(140,90,60,0.28)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <AiOutlinePlusCircle style={{ fontSize: 20 }} />
            Create Post
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
