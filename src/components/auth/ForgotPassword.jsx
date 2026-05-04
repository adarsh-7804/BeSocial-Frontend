import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../features/userSlice";
import * as api from "../../api/userApi";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password validation requirements
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordRequirements).every((req) => req);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    dispatch(forgotPassword({ email }));
    setSubmitted(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    setOtpError("");
    
    try {
      // Validate OTP with backend (doesn't clear it)
      await api.validateResetOtp({ email, resetPasswordOtp: otp });
      setOtpVerified(true);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await dispatch(resetPassword({ 
        email, 
        resetPasswordOtp: otp, 
        newPassword 
      })).unwrap();

      // Show success message and redirect
      navigate("/login");
    } catch (err) {
      setError(err || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const lifted = focused || email;

  const EyeIcon = ({ visible }) =>
    visible ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8C5A3C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8C5A3C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fu0{animation:fadeUp .5s .05s both} .fu1{animation:fadeUp .5s .15s both}
        .fu2{animation:fadeUp .5s .25s both} .fu3{animation:fadeUp .5s .35s both}
        .fu4{animation:fadeUp .5s .45s both}
        .fp-btn:hover{opacity:.88!important} .fp-btn:active{transform:scale(.98)!important}
        .deco-ring{border-radius:50%;border:1px solid rgba(255,255,255,0.12);position:absolute;}
        @media(min-width:1024px){.lg-panel{display:flex!important}}
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          background: "#FFF8F0",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* LEFT DECORATIVE PANEL */}
        <div
          style={{
            width: "42%",
            display: "none",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(155deg, #8C5A3C 0%, #5e3519 55%, #3b1f0a 100%)",
            padding: "52px 48px",
          }}
          className="lg-panel"
        >
          {/* accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg,#C08552,#eaaf7c,#C08552)",
            }}
          />

          {/* rings */}
          <div
            className="deco-ring"
            style={{ width: 340, height: 340, top: -100, right: -100 }}
          />
          <div
            className="deco-ring"
            style={{ width: 200, height: 200, top: 80, right: 60 }}
          />
          <div
            className="deco-ring"
            style={{ width: 500, height: 500, bottom: -200, left: -150 }}
          />
          <div
            className="deco-ring"
            style={{ width: 140, height: 140, bottom: 100, right: 30 }}
          />

          {/* dot grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(234,175,124,0.08) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#eaaf7c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ✦
              </div>
              <span
                style={{
                  color: "#eaaf7c",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                BeSocial
              </span>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                color: "rgba(234,175,124,0.5)",
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Secure Your Account
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                color: "#FFF8F0",
                fontSize: "clamp(34px,3.2vw,50px)",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Reset your
              <br />
              <em style={{ color: "#eaaf7c" }}>password</em>
              <br />
              safely.
            </h2>
            <div
              style={{
                width: 44,
                height: 2,
                background: "#C08552",
                marginBottom: 22,
              }}
            />
            <p
              style={{
                color: "rgba(255,248,240,0.5)",
                fontSize: 13,
                lineHeight: 1.75,
                maxWidth: 260,
              }}
            >
              Verify your identity and create a new secure password for your account.
            </p>
          </div>

          <p
            style={{
              position: "relative",
              zIndex: 1,
              color: "rgba(234,175,124,0.4)",
              fontSize: 11,
              letterSpacing: "0.1em",
            }}
          >
            © 2026 BeSocial
          </p>
        </div>

        {/* RIGHT FORM PANEL */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
          }}
        >
          <div style={{ width: "100%", maxWidth: 400 }}>
            {/* STEP 1: EMAIL SUBMISSION */}
            {!submitted ? (
              <>
                <div className="fu0">
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#C08552",
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Account Recovery
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "clamp(24px,3vw,32px)",
                      color: "#291d1c",
                      marginBottom: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    Forgot your password?
                  </h1>
                  <p
                    style={{
                      color: "#7a5c4f",
                      fontSize: 13,
                      lineHeight: 1.7,
                      marginBottom: 36,
                    }}
                  >
                    No worries — enter your email and we'll send you a reset
                    link right away.
                  </p>
                </div>

                {error && (
                  <div
                    className="fu0"
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: 10,
                      padding: "11px 15px",
                      marginBottom: 22,
                      color: "#b91c1c",
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div
                    className="fu1"
                    style={{
                      position: "relative",
                      paddingTop: 20,
                      paddingBottom: 4,
                      marginBottom: 32,
                    }}
                  >
                    <label
                      style={{
                        position: "absolute",
                        left: 0,
                        top:-7,
                        fontSize: lifted ? 10 : 14,
                        fontWeight: lifted ? 700 : 400,
                        color: focused ? "#8C5A3C" : "#a0714f",
                        transition: "all 0.2s ease",
                        pointerEvents: "none",
                        letterSpacing: lifted ? "0.12em" : "0",
                        textTransform: lifted ? "uppercase" : "none",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Email Address
                      <span
                        style={{
                          color: "#ef4444",
                          fontSize: 9,
                          marginLeft: 2,
                          verticalAlign: "super",
                        }}
                      >
                        *
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      required
                      placeholder={focused ? "name@mail.com" : ""}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: `2px solid ${focused ? "#8C5A3C" : "#c9a07a"}`,
                        borderRadius: 10,
                        padding: "14px 12px",
                        fontSize: 15,
                        color: "#291d1c",
                        outline: "none",
                        transition: "all 0.2s ease",
                        fontFamily: "'DM Sans',sans-serif",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div className="fu2">
                    <button
                      type="submit"
                      className="fp-btn cursor-pointer"
                      style={{
                        width: "100%",
                        padding: "14px",
                        background:
                          "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
                        color: "#FFF8F0",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        boxShadow: "0 6px 24px rgba(140,90,60,0.3)",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Send OTP →
                    </button>
                  </div>

                  <div className="fu3" style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="fp-btn cursor-pointer"
                      style={{
                        width: "100%",
                        padding: "13px",
                        background: "transparent",
                        color: "#7a5c4f",
                        border: "2px solid #c9a07a",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              </>
            ) : !otpVerified ? (
              // STEP 2: OTP VERIFICATION
              <>
                <div className="fu0">
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#C08552",
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Step 1 of 2
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "clamp(24px,3vw,32px)",
                      color: "#291d1c",
                      marginBottom: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    Verify your email
                  </h1>
                  <p
                    style={{
                      color: "#7a5c4f",
                      fontSize: 13,
                      lineHeight: 1.7,
                      marginBottom: 36,
                    }}
                  >
                    We've sent a 6-digit OTP to <strong>{email}</strong>. Please
                    enter it below to verify your identity.
                  </p>
                </div>

                {otpError && (
                  <div
                    className="fu0"
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: 10,
                      padding: "11px 15px",
                      marginBottom: 22,
                      color: "#b91c1c",
                      fontSize: 13,
                    }}
                  >
                    {otpError}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div
                    className="fu1"
                    style={{
                      position: "relative",
                      paddingTop: 20,
                      paddingBottom: 4,
                      marginBottom: 32,
                    }}
                  >
                    <label
                      style={{
                        position: "absolute",
                        left: 0,
                        top: -7,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#a0714f",
                        transition: "all 0.2s ease",
                        pointerEvents: "none",
                        letterSpacing: otp ? "0.12em" : "0",
                        textTransform: otp ? "uppercase" : "none",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      OTP Code
                      <span
                        style={{
                          color: "#ef4444",
                          fontSize: 9,
                          marginLeft: 2,
                          verticalAlign: "super",
                        }}
                      >
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setOtpError("");
                      }}
                      maxLength="6"
                      placeholder="000000"
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "2px solid #c9a07a",
                        borderRadius: 10,
                        padding: "14px 12px",
                        fontSize: 15,
                        color: "#291d1c",
                        outline: "none",
                        transition: "all 0.2s ease",
                        fontFamily: "'DM Sans',sans-serif",
                        boxSizing: "border-box",
                        letterSpacing: "0.5em",
                        textAlign: "center",
                      }}
                    />
                  </div>

                  <div className="fu2">
                    <button
                      type="submit"
                      disabled={otp.length !== 6 || loading}
                      className="fp-btn cursor-pointer"
                      style={{
                        width: "100%",
                        padding: "14px",
                        background:
                          otp.length === 6 && !loading
                            ? "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)"
                            : "#c9a07a",
                        color: "#FFF8F0",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor:
                          otp.length === 6 && !loading ? "pointer" : "not-allowed",
                        boxShadow: "0 6px 24px rgba(140,90,60,0.3)",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? "Verifying..." : "Continue →"}
                    </button>
                  </div>

                  <div className="fu3" style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setOtp("");
                        setOtpError("");
                      }}
                      className="fp-btn cursor-pointer"
                      style={{
                        width: "100%",
                        padding: "13px",
                        background: "transparent",
                        color: "#7a5c4f",
                        border: "2px solid #c9a07a",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      ← Change Email
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // STEP 3: PASSWORD RESET
              <>
                <div className="fu0">
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#C08552",
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Step 2 of 2
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "clamp(24px,3vw,32px)",
                      color: "#291d1c",
                      marginBottom: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    Create new password
                  </h1>
                  <p
                    style={{
                      color: "#7a5c4f",
                      fontSize: 13,
                      lineHeight: 1.7,
                      marginBottom: 36,
                    }}
                  >
                    Enter your new password. Make it strong and unique.
                  </p>
                </div>

                {error && (
                  <div
                    className="fu0"
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: 10,
                      padding: "11px 15px",
                      marginBottom: 22,
                      color: "#b91c1c",
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div
                    className="fu1"
                    style={{
                      position: "relative",
                      paddingTop: 20,
                      paddingBottom: 4,
                      marginBottom: 28,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <label
                        style={{
                          fontSize:12,
                          fontWeight: 700,
                          color: "#a0714f",
                          letterSpacing:"0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        New Password
                        <span
                          style={{
                            color: "#ef4444",
                            fontSize: 9,
                            marginLeft: 2,
                            verticalAlign: "super",
                          }}
                        >
                          *
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#C08552",
                          color: "#FFF8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: "bold",
                          cursor: "pointer",
                          flexShrink: 0,
                          boxShadow: "0 2px 6px rgba(192,133,82,0.35)",
                          border: "none",
                          padding: 0,
                        }}
                      >
                        ℹ
                      </button>
                    </div>
                    {showPasswordRequirements && (
                      <div
                        style={{
                          background: "#2c1810",
                          color: "#FFF8F0",
                          padding: "12px 14px",
                          borderRadius: 8,
                          marginBottom: 12,
                          fontSize: 12,
                          lineHeight: "1.6",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Password Requirements:</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: passwordRequirements.minLength ? "#4ade80" : "#c9a07a", fontSize: 16 }}>
                            {passwordRequirements.minLength ? "✓" : "○"}
                          </span>
                          <span style={{ color: passwordRequirements.minLength ? "#4ade80" : "#d1d5db" }}>
                            Minimum 8 characters
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: passwordRequirements.hasUpperCase ? "#4ade80" : "#c9a07a", fontSize: 16 }}>
                            {passwordRequirements.hasUpperCase ? "✓" : "○"}
                          </span>
                          <span style={{ color: passwordRequirements.hasUpperCase ? "#4ade80" : "#d1d5db" }}>
                            At least 1 uppercase letter (A–Z)
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: passwordRequirements.hasNumber ? "#4ade80" : "#c9a07a", fontSize: 16 }}>
                            {passwordRequirements.hasNumber ? "✓" : "○"}
                          </span>
                          <span style={{ color: passwordRequirements.hasNumber ? "#4ade80" : "#d1d5db" }}>
                            At least 1 number (0–9)
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: passwordRequirements.hasSpecialChar ? "#4ade80" : "#c9a07a", fontSize: 16 }}>
                            {passwordRequirements.hasSpecialChar ? "✓" : "○"}
                          </span>
                          <span style={{ color: passwordRequirements.hasSpecialChar ? "#4ade80" : "#d1d5db" }}>
                            At least 1 special character (!@#$%^&*)
                          </span>
                        </div>
                      </div>
                    )}
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                        // onFocus={() => setShowPasswordRequirements(true)}
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "2px solid #c9a07a",
                          borderRadius: 10,
                          padding: "14px 42px 14px 12px",
                          fontSize: 15,
                          color: "#291d1c",
                          outline: "none",
                          transition: "all 0.2s ease",
                          fontFamily: "'DM Sans',sans-serif",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="fu2"
                    style={{
                      position: "relative",
                      paddingTop: 20,
                      paddingBottom: 4,
                      marginBottom: 32,
                    }}
                  >
                    <label
                      style={{
                        position: "absolute",
                        left: 0,
                        top:-7,
                        fontSize:12,
                        fontWeight: 700,
                        color: "#a0714f",
                        transition: "all 0.2s ease",
                        pointerEvents: "none",
                        letterSpacing:"0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Confirm Password
                      <span
                        style={{
                          color: "#ef4444",
                          fontSize: 9,
                          marginLeft: 2,
                          verticalAlign: "super",
                        }}
                      >
                        *
                      </span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "2px solid #c9a07a",
                          borderRadius: 10,
                          padding: "14px 42px 14px 12px",
                          fontSize: 15,
                          color: "#291d1c",
                          outline: "none",
                          transition: "all 0.2s ease",
                          fontFamily: "'DM Sans',sans-serif",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <EyeIcon visible={showConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  <div className="fu3">
                    <button
                      type="submit"
                      disabled={loading || !isPasswordValid || !newPassword.trim() || !confirmPassword.trim()}
                      className="fp-btn cursor-pointer"
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: (loading || !isPasswordValid || !newPassword.trim() || !confirmPassword.trim())
                          ? "#c9a07a"
                          : "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
                        color: "#FFF8F0",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: (loading || !isPasswordValid || !newPassword.trim() || !confirmPassword.trim()) ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 24px rgba(140,90,60,0.3)",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {loading ? "Resetting..." : "Reset Password →"}
                    </button>
                  </div>

                  <div className="fu4" style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="fp-btn cursor-pointer"
                      style={{
                        width: "100%",
                        padding: "13px",
                        background: "transparent",
                        color: "#7a5c4f",
                        border: "2px solid #c9a07a",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
