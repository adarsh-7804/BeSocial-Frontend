import { useState, useRef, useEffect } from "react";
import {
  deleteUser,
  updateUserProfile,
  // followUser,
  // unfollowUser,
  selectUser,
  sendRequest,
  acceptRequest,
  rejectRequest,
  unfriend,
} from "../../features/userSlice";
import SideBar from "./SideBar";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfile,
  sendVerifyOtp,
  verifyEmailOtp,
  getUserById,
} from "../../api/userApi";
import { toast } from "react-toastify";
import { MdOutlineLocationOn } from "react-icons/md";
import Navbar from "./Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import RightPanel from "./RightPanel";
import { useParams } from "react-router-dom";
import FriendButton from "./FriendButton";
import { FaUserEdit } from "react-icons/fa";
import UserDatalist from "./UserDatalist.jsx";
import ImageCropperModal from "./ImageCropperModal";

/* ── Google Fonts injected once ── */
if (
  typeof document !== "undefined" &&
  !document.getElementById("profile-fonts")
) {
  const link = document.createElement("link");
  link.id = "profile-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
}

/*  Tiny SVG icon  */
const Ic = ({
  d,
  size = 16,
  color = "currentColor",
  sw = 2,
  fill = "none",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/* ── Icon Paths ── */
const D = {
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M18 6L6 18M6 6l12 12",
  camera:
    "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  check: "M20 6L9 17l-5-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  pen: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  pin: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  cal: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  gender: "M12 2a5 5 0 100 10 5 5 0 000-10zM12 12v10M8 18h8",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone:
    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:
    "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/*  Sub-components  */
const FieldLabel = ({ icon, children }) => (
  <div className="flex items-center gap-1 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8C5A3C]">
    <Ic d={icon} size={11} color="#C08552" sw={2.5} />
    {children}
  </div>
);

const Card = ({ icon, title, children }) => (
  <div className="border border-[rgba(192,133,82,0.25)] rounded-2xl bg-white/65 backdrop-blur-sm p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[rgba(192,133,82,0.15)]">
      <Ic d={icon} size={14} color="#C08552" />
      <span
        className="text-[11px] font-bold text-[#8C5A3C] uppercase tracking-widest"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
    {children}
  </div>
);

/*  Input shared style  */
const inputCls =
  "w-full bg-[#FFF8F0] border border-[rgba(192,133,82,0.3)] rounded-xl px-3 py-2 text-sm text-[#2C1A0E] outline-none transition-colors focus:border-[#C08552] placeholder-[rgba(192,133,82,0.4)] truncate disabled:cursor-default read-only:cursor-default";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();
  const currentUser = useSelector((state) => state.user.user);

  const userId = id || currentUser?._id;

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [fullName, setFullName] = useState("");
  // const [followLoading, setFollowLoading] = useState(false);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [cropType, setCropType] = useState(null);

  const loggedInUser = useSelector(selectUser);

  const isOwnProfile = loggedInUser?._id === profile?._id;

  const coverSrc = profile?.coverImage
    ? profile.coverImage.startsWith("blob:")
      ? profile.coverImage
      : `${import.meta.env.VITE_SERVER_URL}/${profile.coverImage}`
    : "https://i.pinimg.com/1200x/30/66/b1/3066b18fbb5757089bcfe86525c335b7.jpg";

  const avatarSrc = profile?.avatar
    ? profile.avatar.startsWith("blob:")
      ? profile.avatar
      : `${import.meta.env.VITE_SERVER_URL}/${profile.avatar}`
    : "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";

  const tags = profile?.tags || [];

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        let res;

        if (!id) {
          res = await getProfile();
        }
        else {
          res = await getUserById(userId);
        }

        setProfile(res.data.user);
        setEmailVerified(res.data.user.isAccountVerified);
      } catch (err) {
        console.log("PROFILE ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (profile) {
      setFullName(
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
      );
    }
  }, [profile]);

  const commitTag = (raw) => {
    const t = raw.trim().replace(/,+$/, "").trim();
    if (
      t.length > 0 &&
      t.length <= 20 &&
      !tags.includes(t) &&
      tags.length < 15
    ) {
      setProfile({ ...profile, tags: [...(profile.tags || []), t] });
      setTagInput("");
    }
  };

  const handleTagInput = (e) => {
    const val = e.target.value;
    if (val.endsWith(" ")) {
      commitTag(val);
    } else {
      setTagInput(val);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag(tagInput);
      // setTagInput("");
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0)
      setProfile({ ...profile, tags: profile.tags.slice(0, -1) });
  };

  const removeTag = (t) =>
    setProfile({
      ...profile,
      tags: (profile.tags || []).filter((x) => x !== t),
    });

  const handleVerify = async () => {
    try {
      setVerifyLoading(true);
      await sendVerifyOtp(profile.email);
      setShowOtpModal(true);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      await verifyEmailOtp(profile.email, otp);
      setEmailVerified(true);
      setShowOtpModal(false);
      setOtp("");
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview
    const preview = URL.createObjectURL(file);
    setCropperImage(preview);
    setCropType("cover");
    setShowCropperModal(true);

    coverInputRef.current.value = "";
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview
    const preview = URL.createObjectURL(file);
    setCropperImage(preview);
    setCropType("avatar");
    setShowCropperModal(true);

    avatarInputRef.current.value = "";

   
  };

  const handleCropComplete = async (croppedBlob) => {
    if (!croppedBlob) return;

    try {
      const formData = new FormData();

      if (cropType === "avatar") {
        formData.append("avatar", croppedBlob, "avatar.jpg");
        const preview = URL.createObjectURL(croppedBlob);
        setProfile({ ...profile, avatar: preview });
      } else if (cropType === "cover") {
        formData.append("coverImage", croppedBlob, "cover.jpg");
        const preview = URL.createObjectURL(croppedBlob);
        setProfile({ ...profile, coverImage: preview });
      }

      await dispatch(updateUserProfile(formData));
      toast.success(
        `${cropType === "avatar" ? "Profilepicture" : "Cover"} updated successfully`,
      );

      setShowCropperModal(false);
      setCropperImage(null);
      setCropType(null);

      if(cropType === "avatar") {
        avatarInputRef.current.value = "";
      } else if (cropType === "cover") {
        coverInputRef.current.value =""
      }
    } catch (err) {
      console.log("Upload error:", err);
      toast.error("Upload failed");
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);

      const formData = new FormData();

      const parts = fullName.trim().split(/\s+/);

      formData.append("firstName", parts[0] || "");
      formData.append("lastName", parts.slice(1).join(" ") || "");
      formData.append("phoneNumber", profile.phoneNumber || "");
      formData.append("gender", profile.gender || "");

      formData.append("bio", profile.bio || "");
      formData.append("website", profile.website || "");
      formData.append("location", profile.location || "");
      formData.append("dob", profile.dob || "");
      tags?.forEach((tag) => formData.append("tags", tag));
      const result = await dispatch(updateUserProfile(formData));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Profile updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        setSaved(true);
        setIsEditing(false);
        setTimeout(() => setSaved(false), 2500);
        console.log("SENDING:", profile.firstName, profile.lastName);
      } else {
        setSaveError(result.payload);
      }
    } catch {
      setSaveError("Something went wrong");
    } finally {
      setSaveLoading(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return "";

    const str = String(phone);

    return str.length >= 5 ? `${str.slice(0, 3)}****${str.slice(-2)}` : str;
  };

  const parseLocation = (loc) => {
    if (!loc) return null;
    try {
      const match = loc.match(/maps\/place\/([^/@]+)/);
      if (match) return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch (_) {}
    return loc;
  };

  const profileId = profile?._id;

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-[#FFF8F0] text-[#8C5A3C] text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Loading profile…
      </div>
    );
  if (!profile) return null;

  return (
    <div
      className="flex min-h-screen bg-[#FFF8F0] flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>
        {`
              ::-webkit-scrollbar { width: 4px; }
              ::-webkit-scrollbar-thumb { background: #C08552; border-radius: 99px; }
              ::-webkit-scrollbar-track { background: #FFF8F0; }
              input[type="date"]::-webkit-calendar-picker-indicator { 
                opacity: 0; 
                cursor: pointer;
                position: absolute;
                right: 0;
                top: 0;
                width: 100%;
                height: 100%;
              }
              /* For Firefox date picker */
              input[type="date"] {
                position: relative;
              }
              @keyframes spin { to { transform: rotate(360deg); } }
              .spinner { display:inline-block;width:12px;height:12px;border:2px solid #D97706;border-top-color:transparent;border-radius:9999px;animation:spin .7s linear infinite; }
              
              /* Bio textarea scrollbar styling */
              textarea::-webkit-scrollbar {
                width: 6px;
              }
              textarea::-webkit-scrollbar-thumb {
                background: #C08552;
                border-radius: 99px;
              }
              textarea::-webkit-scrollbar-track {
                background: rgba(192, 133, 82, 0.1);
                border-radius: 99px;
              }
            `}
      </style>

      {/*  Hidden file inputs  */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <Navbar />

      <div className="flex flex-row">
        <div className="ml-[8vw]">
          <SideBar />
        </div>
        <div>
          <div className="flex-1 flex flex-col  items-start">
            {/*  Scrollable body  */}
            <div className="w-[46.4vw] flex-1 overflow-y-auto  ">
              <div className="w-full mx-auto w-full px-5">
                <div className="mb-9">
                  {/*  Banner  */}
                  <div className="relative w-full h-[186px] bg-[rgba(192,133,82,0.2)] mt-4 rounded-2xl overflow-visible">
                    <img
                      src={coverSrc}
                      alt="cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {isOwnProfile ? (
                      <button
                        className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <Ic d={D.camera} size={13} color="white" />
                        Edit Cover
                      </button>
                    ) : null}

                    {/*  Avatar  */}
                    <div className="absolute bottom-[-48px] left-5">
                      <div className="relative w-[88px] h-[88px]">
                        <div className="w-full h-full rounded-full border-[3px] border-[#FFF8F0] overflow-hidden shadow-lg bg-[#F5E6D3]">
                          <img
                            src={avatarSrc}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {emailVerified && (
                          <div className="relative w-fit">
                            <div
                              className="absolute bottom-0 bg-blue-400 left-0 w-6 h-6 rounded-full flex items-center justify-center shadow-md scale-110"
                              style={{
                                backgroundColor: "#50A2FF",
                                border: "2px solid white",
                              }}
                              title="Verified"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                className="bg-blue-400"
                              >
                                <path
                                  d="M5 13l4 4L19 7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )}

                        {isOwnProfile ? (
                          <button
                            className="absolute bottom-[-6px] right-[-6px] w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#FFF8F0] bg-[#C08552] shadow-md active:scale-90 transition-transform cursor-pointer"
                            onClick={() => avatarInputRef.current?.click()}
                          >
                            <Ic d={D.camera} size={13} color="white" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex justify-end mt-4 gap-1 rounded-4xl rounded-l-4xl overflow-hidden">
                    {/* <FriendButton /> */}
                    {!isOwnProfile && profile?._id && (
                      <FriendButton userId={profile._id} />
                    )}

                    {/* Edit */}
                    {isOwnProfile && !isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-[4vw] flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-br from-slate-500 to-slate-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        <span className="p-0.5 font-extrabold">
                          <FaUserEdit />{" "}
                        </span>
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Bio Card  */}
                <div className="flex flex-col gap-3 pt-1 pb-2 mt-4">
                  {/* General Info. */}
                  <Card icon={D.pen} title="General Info.">
                    {/*  Name + Email  */}

                    <div className="pb-2  ">
                      <div className="flex items-end gap-3 flex-wrap">
                        {/* Name */}

                        <div className="flex-1 min-w-[160px]">
                          <FieldLabel icon={D.user}>Name</FieldLabel>
                          <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={!isEditing}
                            className={`${inputCls} text-lg font-bold`}
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            placeholder="Full name"
                          />
                        </div>

                        {/* Email */}

                        <div className="flex-[2] min-w-[220px] ">
                          <FieldLabel icon={D.mail}>Email</FieldLabel>
                          <div className="flex items-center gap-2 w-full">
                            <input
                              value={
                                showEmail
                                  ? profile?.email || ""
                                  : maskEmail(profile?.email)
                              }
                              className={`${inputCls} flex-1 bg-white  `}
                              placeholder="you@email.com"
                              readOnly
                            />

                            {isOwnProfile ? (
                              <div className="flex flex-row gap-2.5">
                                <div className="">
                                  {emailVerified ? (
                                    <div className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                                      <Ic
                                        d={D.check}
                                        size={13}
                                        color="#16a34a"
                                        sw={2.5}
                                      />
                                      Verified
                                    </div>
                                  ) : (
                                    <button
                                      className="flex items-center gap-1 px-3 py-[10px] rounded-xl text-xs font-bold border border-yellow-200 bg-yellow-50 text-yellow-600 whitespace-nowrap disabled:opacity-60 active:scale-95 transition-transform cursor-pointer"
                                      onClick={handleVerify}
                                      disabled={verifyLoading}
                                    >
                                      {verifyLoading ? (
                                        <>
                                          <span className="spinner" />
                                          Sending…
                                        </>
                                      ) : (
                                        <>
                                          <Ic
                                            d={D.shield}
                                            size={13}
                                            color="#D97706"
                                          />
                                          Verify
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                                <button
                                  onClick={() => setShowEmail((p) => !p)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${showEmail ? "bg-[#C08552] border-[#C08552]" : "bg-[#FFF8F0] border-[rgba(192,133,82,0.4)]"} cursor-pointer`}
                                >
                                  <Ic
                                    d={showEmail ? D.eye : D.eyeOff}
                                    size={15}
                                    color={showEmail ? "#fff" : "#8C5A3C"}
                                  />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OTP Model */}

                    {showOtpModal && (
                      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">
                          <h3 className="text-lg font-semibold mb-2 text-[#2C1A0E]">
                            Verify Email
                          </h3>
                          <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className={`${inputCls} mb-4`}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleOtpSubmit}
                              className="flex-1 bg-[#C08552] text-white py-2 rounded-xl text-sm font-semibold cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => setShowOtpModal(false)}
                              className="flex-1 border border-[rgba(192,133,82,0.3)] py-2 rounded-xl text-sm text-[#8C5A3C] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BIO */}

                    <FieldLabel icon={D.user}>Bio.</FieldLabel>
                    <div className="relative">
                      <textarea
                        value={profile?.bio || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        rows={3}
                        maxLength={200}
                        placeholder="Tell the world about yourself…"
                        className={`${inputCls} resize-none overflow-y-auto scrollbar-thin`}
                        disabled={!isEditing}
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C08552 #FFF8F0",
                        }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-[rgba(192,133,82,0.6)] mt-">
                      {profile?.bio?.length ?? 0}/200
                    </div>

                    {/* D.O.B */}

                    <div className="flex flex-row gap-3 mb-3">
                      <div className="w-1/2">
                        <FieldLabel icon={D.cal}>Date of Birth</FieldLabel>
                        <div
                          className="relative cursor-pointer"
                          onClick={() => {
                            // Programmatically open the date picker when clicking the container
                            const dateInput =
                              document.getElementById("dob-input");
                            if (dateInput && isEditing) {
                              dateInput.showPicker?.() || dateInput.click();
                            }
                          }}
                        >
                          <input
                            id="dob-input"
                            type="date"
                            value={profile?.dob?.slice(0, 10) || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, dob: e.target.value })
                            }
                            max={todayStr()}
                            className={`${inputCls} cursor-pointer`}
                            disabled={!isEditing}
                            onClick={(e) => {
                              // Prevent double-triggering, let the container handle it
                              e.stopPropagation();
                            }}
                          />
                          {/* Custom calendar icon overlay to make it look clickable */}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Ic d={D.cal} size={16} color="#8C5A3C" />
                          </div>
                        </div>
                      </div>

                      {/* PHONE */}

                      <div className="w-1/2">
                        <FieldLabel icon={D.phone}>Phone</FieldLabel>

                        <div className="flex items-center gap-2 mb-2">
                          <input
                            value={
                              isEditing
                                ? profile?.phoneNumber || ""
                                : showPhone
                                  ? profile?.phoneNumber || ""
                                  : maskPhone(profile?.phoneNumber)
                            }
                            onChange={(e) => {
                              setProfile({
                                ...profile,
                                phoneNumber: e.target.value,
                              });
                            }}
                            className={`${inputCls} flex-1`}
                            placeholder="+91 00000 00000"
                            disabled={!isEditing}
                          />

                          {/* Hide Button */}
                          {isOwnProfile ? (
                            <button
                              onClick={() => setShowPhone((p) => !p)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${showPhone ? "bg-[#C08552] border-[#C08552]" : "bg-[#FFF8F0] border-[rgba(192,133,82,0.4)]"} cursor-pointer`}
                            >
                              <Ic
                                d={showPhone ? D.eye : D.eyeOff}
                                size={15}
                                color={showPhone ? "#fff" : "#8C5A3C"}
                              />
                            </button>
                          ) : null}
                        </div>
                        {saveError && (
                          <p className="text-[10px] text-red-500 text-right -mt-1">
                            {saveError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* GENDER */}

                    <div>
                      <FieldLabel icon={D.gender}>Gender</FieldLabel>

                      {isEditing ? (
                        <div className="flex gap-4 mt-1">
                          {["male", "female", "other"].map((g) => (
                            <label
                              key={g}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={profile?.gender === g}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    gender: e.target.value,
                                  })
                                }
                              />
                              <span>{g}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className={inputCls}>
                          {profile?.gender || "Not specified"}
                        </div>
                      )}
                    </div>

                    {/* TAGS, WEBSITE & LOCATION */}

                    <div className="flex flex-row">
                      {/* TAGS */}

                      <div className="mt-2 w-1/2">
                        <FieldLabel icon={D.tag}>Tags</FieldLabel>
                        <div
                          className="relative  flex flex-wrap gap-2 p-2.5 rounded-xl border border-[rgba(192,133,82,0.3)] bg-[#FFF8F0] cursor-text min-h-[46px] focus-within:border-[#C08552] transition-colors"
                          onClick={() =>
                            document.getElementById("tag-input")?.focus()
                          }
                        >
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="flex items-center gap-1 pl-2.5 pr-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5E6D3] text-[#8C5A3C] border border-[rgba(192,133,82,0.21)] select-none"
                            >
                              {t}
                              {isEditing && (
                                <button
                                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[rgba(192,133,82,0.25)] transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(t);
                                  }}
                                >
                                  <Ic
                                    d={D.close}
                                    size={8}
                                    color="#8C5A3C"
                                    sw={3}
                                  />
                                </button>
                              )}
                            </span>
                          ))}
                          {tags.length < 15 && (
                            <input
                              id="tag-input"
                              type="text"
                              value={tagInput}
                              onChange={handleTagInput}
                              onKeyDown={handleTagKeyDown}
                              placeholder={
                                tags.length === 0
                                  ? "Type a tag, press Enter or space…"
                                  : "Add more…"
                              }
                              maxLength={25}
                              className="outline-none bg-transparent text-xs text-[#2C1A0E] flex-1 min-w-[120px] placeholder-[rgba(192,133,82,0.4)]"
                              disabled={!isEditing}
                            />
                          )}

                          {tagInput.trim() &&
                            !tags.includes(tagInput.trim()) && (
                              <div className="absolute left-2 right-2 top-full mt-1 z-10">
                                <div
                                  className="px-3 py-2 bg-white border border-[rgba(192,133,82,0.3)] rounded-lg shadow-md cursor-pointer text-xs text-[#8C5A3C] hover:bg-[#f3e8df] transition-colors"
                                  onClick={() => {
                                    commitTag(tagInput);
                                    setTagInput("");
                                  }}
                                >
                                  Add "{tagInput}"
                                </div>
                              </div>
                            )}
                        </div>
                        <p className="text-[10px] text-[rgba(140,90,60,0.6)] mt-1.5 ml-1.5">
                          Press{" "}
                          <kbd className="px-1 py-0.5 rounded bg-[rgba(192,133,82,0.1)] text-[#8C5A3C] font-mono text-[9px]">
                            Enter
                          </kbd>{" "}
                          or{" "}
                          <kbd className="px-1 py-0.5 rounded bg-[rgba(192,133,82,0.1)] text-[#8C5A3C] font-mono text-[9px]">
                            Space
                          </kbd>{" "}
                          to add ·{" "}
                          <kbd className="px-1 py-0.5 rounded bg-[rgba(192,133,82,0.1)] text-[#8C5A3C] font-mono text-[9px]">
                            ⌫
                          </kbd>{" "}
                          to remove last · max 15 tags
                        </p>
                      </div>

                      {/* Website + Location */}

                      <div className="w-1/2  ml-3">
                        <div className="relative mb-3 mt-2  block">
                          <FieldLabel icon={D.link}>Website link</FieldLabel>
                          {isEditing ? (
                            <input
                              value={profile?.website || ""}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  website: e.target.value,
                                })
                              }
                              className={inputCls}
                              placeholder="http://www.yoursite.com"
                            />
                          ) : (
                            profile?.website && (
                              <a
                                href={`https://${profile.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${inputCls} block`}
                              >
                                {profile.website}
                              </a>
                            )
                          )}
                        </div>

                        {/* location */}
                        <div className="mt-2">
                          <FieldLabel icon={D.pin}>Location</FieldLabel>
                          {isEditing ? (
                            <input
                              value={profile?.location || ""}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  location: e.target.value,
                                })
                              }
                              className={inputCls}
                              placeholder="Location Link"
                            />
                          ) : (
                            profile?.location && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parseLocation(profile.location))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-[#C08552] underline underline-offset-2"
                              >
                                <MdOutlineLocationOn className="text-base flex-shrink-0" />
                                {parseLocation(profile.location)}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/*  Save buttons */}
                  <div className="flex justify-end gap-2 mt-1">
                    {!isEditing ? (
                      <div></div>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white active:scale-95 transition-all shadow-sm disabled:opacity-60 ${saved ? "bg-green-500" : "bg-gradient-to-br from-[#C08552] to-[#8C5A3C]"} cursor-pointer`}
                      >
                        <Ic
                          d={saved ? D.check : D.save}
                          size={12}
                          color="white"
                          sw={2.5}
                        />
                        {saveLoading
                          ? "Saving…"
                          : saved
                            ? "Saved!"
                            : "Save Changes"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <UserDatalist profile={profile} />
        </div>
        <div className="mr-50">
          <RightPanel />
        </div>
      </div>
      <ImageCropperModal
        isOpen={showCropperModal}
        imageSrc={cropperImage}
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setShowCropperModal(false);
          setCropperImage(null);
          setCropType(null);
        }}
        aspectRatio={cropType === "avatar" ? 1 : 21 / 9}
      />
    </div>
  );
}
