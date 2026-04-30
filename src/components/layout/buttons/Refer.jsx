import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // ADD THIS
import { sendInvite } from "../../../api/userApi";
// import toast from "react-hot-toast";
import Navbar from "../Navbar";
import SideBar from "../SideBar";
import RightPanel from "../RightPanel";
import { toast } from "react-toastify";

const Refer = () => {
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate(); 

  const [emails, setEmails] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sendStatus, setSendStatus] = useState(null);
  const [invalidEmails, setInvalidEmails] = useState([]);
  const inputRef = useRef(null);

  const referralCode = currentUser?.referralCode || "YOURCODE";
  const inviteLink = `${window.location.origin}/?ref=${referralCode}`;

  const mailSubject = "Join me on BeSocial 🎉";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Navigate to user profile
  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const addEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    if (emails.includes(trimmed)) {
      toast.error(`${trimmed} already added`);
      setInputValue("");
      return;
    }

    if (!emailRegex.test(trimmed)) {
      setInvalidEmails((prev) => [...prev, trimmed]);
      toast.error(`${trimmed} is not a valid email`);
    }

    setEmails((prev) => [...prev, trimmed]);
    setInputValue("");
    setInvalidEmails([]);
  };

  const removeEmail = (emailToRemove) => {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
    setInvalidEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmail(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      const lastEmail = emails[emails.length - 1];
      removeEmail(lastEmail);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const splitEmails = pasted.split(/[,;\s\n]+/).filter((e) => e.trim());
    
    splitEmails.forEach((email) => {
      if (emailRegex.test(email.trim())) {
        if (!emails.includes(email.trim().toLowerCase())) {
          setEmails((prev) => [...prev, email.trim().toLowerCase()]);
        }
      } else {
        setInvalidEmails((prev) => [...prev, email.trim()]);
      }
    });
  };

  const handleSendMail = async () => {
    if (inputValue.trim()) {
      addEmail(inputValue);
      return;
    }

    if (emails.length === 0) {
      setSendStatus("error");
      toast.error("Please add at least one email");
      return;
    }

    const validEmails = emails.filter((e) => emailRegex.test(e));

    if (validEmails.length === 0) {
      toast.error("No valid emails to send");
      return;
    }

    setSendStatus("sending");

    try {
      const results = await Promise.allSettled(
        validEmails.map((email) => sendInvite(email))
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        setSendStatus("sent");
        toast.success(`Invites sent to ${successful} friend${successful > 1 ? 's' : ''}!`);
        
        setTimeout(() => {
          setEmails([]);
          setInvalidEmails([]);
          setSendStatus(null);
          setInputValue("");
        }, 2000);
      } else {
        toast.error(`${failed} failed, ${successful} sent`);
        setSendStatus(null);
      }
    } catch (err) {
      setSendStatus("error");
      toast.error("Failed to send invites");
      console.error("Invite failed:", err);
    }
  };

  const handleClose = () => {
    setEmails([]);
    setInvalidEmails([]);
    setSendStatus(null);
    setInputValue("");
  };

  const mailHTML = `
  <div style="font-family: Arial, sans-serif;  padding:;">
    <div style="">
      <div style="">
        <h4 style = "color:#8C5A3C;">Hey there 👋</h4>
        <p>
          <b style = "color:#8C5A3C;" >${currentUser?.firstName || "User"} ${currentUser?.lastName || ""}</b> this side. </br>
          Haven't meet in long time, Lest's meet on  
          <b style = "color:#8C5A3C;">BeSocial</b> 🤎 a great social media platform.
        </p>
        <div style=" margin:30px 0;">
          <a 
            style="background:#8C5A3C; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; cursor:pointer">
            Join Now →
          </a>
        </div>
        <H5>OR</H5>
        <p style="font-size:14px;">${inviteLink}</p>
      </div>
    </div>
  </div>
`;

  return (
    <div>
      <Navbar />

      <div className="flex  bg-[#FFF8F0]">
        <div className="w-[250px] ml-[8vw]">
          <SideBar />
        </div>

        <div className="flex w-[44vw] flex-col justify-center mt-4 ml-10">
          <div className="ml-[22.1vw]   w-full space-y-6">
          {/* Invite Panel */}
          <div className="w-full rounded-2xl border border-[#EFDED0] shadow-md bg-[#FFFDFA] p-5 mb-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#8B653F]/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[#8B653F]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75"
                    />
                  </svg>
                </div>
                <p className="text-[10px] font-bold text-[#433725] uppercase tracking-widest">
                  Invite Friends
                </p>
              </div>
              {emails.length > 0 && (
                <span className="text-xs text-[#8B653F] bg-[#FDF6EE] px-2 py-1 rounded-full">
                  {emails.length} recipient{emails.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* To Field - Gmail Style */}
            <div className="mb-3 ">
              <label className="block text-[10px] font-semibold text-[#8B653F] uppercase tracking-widest mb-1">
                To
              </label>
              <div
                className={`w-full bg-white border rounded-xl px-3 py-2.5 min-h-[46px] flex flex-wrap gap-2 items-center transition-all cursor-text ${
                  sendStatus === "error" && emails.length === 0
                    ? "border-red-400"
                    : "border-[#EFDED0] focus-within:border-[#8B653F] focus-within:ring-2 focus-within:ring-[#8B653F]/30"
                }`}
                onClick={() => inputRef.current?.focus()}
              >
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${
                      invalidEmails.includes(email)
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-[#8B653F]/10 text-[#433725] border border-[#8B653F]/20"
                    }`}
                  >
                    <span className="font-medium truncate max-w-[150px]">
                      {email}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEmail(email);
                      }}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <input
                  ref={inputRef}
                  type="email"
                  placeholder={emails.length === 0 ? "Type email and press Enter" : ""}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className="flex-1 min-w-[120px] bg-transparent text-[#3C3322] text-sm outline-none placeholder:text-[#C4A882]"
                />
              </div>
              
              <p className="text-[10px] text-[#C4A882] mt-1 ml-1">
                Press Enter, comma, or space to add multiple emails
              </p>
              
              {sendStatus === "error" && emails.length === 0 && (
                <p className="text-[11px] text-red-500 mt-1 ml-1">
                  Please add at least one email address.
                </p>
              )}
            </div>

            {/* Subject Field */}
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-[#8B653F] uppercase tracking-widest mb-1">
                Subject
              </label>
              <div className="w-full bg-[#FDF6EE] text-[#3C3322] text-sm border border-[#EFDED0] rounded-xl px-3.5 py-2.5 text-[#7a6048]">
                {mailSubject}
              </div>
            </div>

            {/* Email Preview */}
            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-[#8B653F] uppercase tracking-widest mb-1">
                Email Preview
              </label>
              <div className="border border-[#EFDED0] rounded-xl overflow-hidden bg-white">
                <iframe
                  title="Email Preview"
                  className="w-full h-[300px]"
                  srcDoc={mailHTML}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                className="text-sm text-[#a27457] hover:text-[#433725] font-medium transition-colors px-4 py-2 rounded-lg hover:bg-[#EFDED0]"
              >
                Clear
              </button>

              <button
                onClick={handleSendMail}
                disabled={sendStatus === "sending" || sendStatus === "sent" || (emails.length === 0 && !inputValue.trim())}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 ${
                  sendStatus === "sent"
                    ? "bg-green-500 text-white"
                    : "bg-[#8B653F] text-white hover:bg-[#7a5635] disabled:opacity-60 disabled:cursor-not-allowed"
                }`}
              >
                {sendStatus === "sending" && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {sendStatus === "sent" && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {!sendStatus && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
                {sendStatus === "sending"
                  ? "Sending..."
                  : sendStatus === "sent"
                    ? "Sent!"
                    : `Send Invite${emails.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {/* Referred Friends List  */}
          <div className="w-full rounded-2xl border border-[#EFDED0] shadow-md bg-[#FFFDFA] p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#8B653F]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#8B653F]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#433725] uppercase tracking-widest">
                  Referred Friends
                </p>
                <p className="text-[11px] text-[#8B653F]">
                  {currentUser?.referredUsers?.length || 0} joined
                </p>
              </div>
            </div>

            {(!currentUser?.referredUsers || currentUser.referredUsers.length === 0) ? (
              <div className="text-center py-6">
                <p className="text-[#8B653F] text-sm font-medium">No friends referred yet</p>
                <p className="text-[#C4A882] text-xs mt-1">Send invites above to grow your network!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {currentUser.referredUsers.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => goToProfile(friend._id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FDF6EE] hover:bg-[#F5EBE0] transition-all cursor-pointer group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#8B653F] flex items-center justify-center text-white font-semibold text-sm overflow-hidden group-hover:ring-2 group-hover:ring-[#8B653F]/30 transition-all">
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt={`${friend.firstName} ${friend.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${friend.firstName?.[0] || ""}${friend.lastName?.[0] || ""}`
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#433725] group-hover:text-[#8B653F] transition-colors truncate">
                        {friend.firstName} {friend.lastName}
                      </p>
                      <p className="text-[11px] text-[#8B653F]">
                        Joined {friend.createdAt ? new Date(friend.createdAt).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                    
                    {/* Arrow Icon on Hover */}
                    <svg 
                      className="w-4 h-4 text-[#C4A882] group-hover:text-[#8B653F] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={2} 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="w-[300px] ml-3">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default Refer;