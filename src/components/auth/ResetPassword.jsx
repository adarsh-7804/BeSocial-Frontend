import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  resetPassword,
  forgotPassword,
  selectAuthLoading,
  clearError,
} from "../../features/userSlice";

/* Floating Email Input */
const EmailInput = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value;

  return (
    <div style={{ position: "relative", paddingTop: 20, paddingBottom: 4 }}>
      <label
        style={{
          position: "absolute",
          left: 0,
          top:   -5,
          fontSize:11,
          fontWeight:  700,      
          color: focused ? "#8C5A3C" : "#a0714f",
          // transition: "all 0.2s ease",
          pointerEvents: "none",
          letterSpacing: lifted ? "0.12em" : "0",
          textTransform:  "uppercase",
          fontFamily: "'DM Sans', sans-serif",
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
        type="text"
        name="email"
        value={value}
        onChange={onChange}
        placeholder={focused ? "you@example.com" : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "#FFFFFF",
          border: `2px solid ${focused ? "#8C5A3C" : "#c9a07a"}`,
          borderRadius: 10,
          padding: "14px 12px", // 🔥 important: makes it a proper box
          fontSize: 15,
          color: "#291d1c",
          outline: "none",
          transition: "all 0.2s ease",
          fontFamily: "'DM Sans',sans-serif",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

/* Generic Floating Input */
const FloatingInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value;

  return (
    <div style={{ position: "relative", paddingTop: 20, paddingBottom: 4 }}>
      <label
        style={{
          position: "absolute",
          left: 0,
          top: lifted ? 0 : 22,
          fontSize: lifted ? 10 : 14,
          fontWeight: lifted ? 700 : 400,
          color: focused ? "#8C5A3C" : "#a0714f",
          transition: "all 0.2s ease",
          pointerEvents: "none",
          letterSpacing: lifted ? "0.12em" : "0",
          textTransform: lifted ? "uppercase" : "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
        {required && (
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
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={focused ? placeholder : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: focused ? "2px solid #8C5A3C" : "2px solid #c9a07a",
          padding: "7px 0",
          fontSize: 15,
          color: "#291d1c",
          outline: "none",
          transition: "border-color 0.2s",
          fontFamily: "'DM Sans', sans-serif",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

/* Step indicator dots */
const StepDots = ({ current, total }) => (
  <div
    style={{
      display: "flex",
      gap: 6,
      justifyContent: "center",
      marginBottom: 28,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === current ? 22 : 8,
          height: 8,
          borderRadius: 4,
          background:
            i < current
              ? "#C08552"
              : i === current
                ? "linear-gradient(90deg,#C08552,#8C5A3C)"
                : "#e1bc9c",
          transition: "all 0.3s ease",
        }}
      />
    ))}
  </div>
);

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  React.useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return "Please enter a valid email address";
    }
    if (step === 1) {
      if (!form.otp || form.otp.trim().length < 4)
        return "Please enter the OTP sent to your email";
    }
    if (step === 2) {
      if (form.password.length < 8)
        return "Password must be at least 8 characters";
      if (!/[A-Z]/.test(form.password))
        return "Password needs at least one uppercase letter";
      if (!/[0-9]/.test(form.password))
        return "Password needs at least one number";
      if (!/[!@#$%^&*]/.test(form.password))
        return "Password needs at least one special character";
      if (form.password !== form.confirmPassword)
        return "Passwords do not match";
    }
    return null;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) {
      setValidationError(err);
      return;
    }

    if (step === 0) {
      const result = await dispatch(forgotPassword({ email: form.email }));
      if (result.error) {
        setValidationError(
          result.payload?.message ||
            result.payload ||
            result.error?.message ||
            "Failed to send OTP. Try again.",
        );
        dispatch(clearError());
        return;
      }
      setStep(1);
    } else if (step < 2) {
      setStep(step + 1);
    } else {
      dispatch(
        resetPassword({
          email: form.email,
          resetPasswordOtp: form.otp,
          newPassword: form.password,
        }),
      );
      setSuccess(true);
    }
  };

  const stepLabels = ["Enter your email", "Verify OTP", "Set new password"];
  const stepDescriptions = [
    "We'll verify your account using your registered email address.",
    "Enter the one-time password sent to your inbox.",
    "Choose a strong password to secure your account.",
  ];
  const buttonLabels = ["Continue →", "Verify OTP →", "Reset Password →"];

  const passwordRules = [
    { rule: "At least 8 characters", met: form.password.length >= 8 },
    { rule: "One uppercase letter", met: /[A-Z]/.test(form.password) },
    { rule: "One number", met: /[0-9]/.test(form.password) },
    {
      rule: "One special character (!@#$%^&*)",
      met: /[!@#$%^&*]/.test(form.password),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .fu0 { animation: fadeUp .5s .05s both; }
        .fu1 { animation: fadeUp .5s .15s both; }
        .fu2 { animation: fadeUp .5s .25s both; }
        .fu3 { animation: fadeUp .5s .35s both; }
        .fu4 { animation: fadeUp .5s .45s both; }
        .slide-in { animation: slideIn .35s ease both; }

        .deco-ring { border-radius: 50%; border: 1px solid rgba(255,255,255,0.12); position: absolute; }
        .lg-panel { display: none; }
        @media(min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }

        .rp-btn:hover   { opacity: .88 !important; }
        .rp-btn:active  { transform: scale(.98) !important; }

        .otp-input {
          text-align:     center;
          font-size:      22px !important;
          letter-spacing: 0.4em !important;
          font-weight:    600 !important;
        }
      `}</style>

      {/* Main container */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          background: "#FFF8F0",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ─── LEFT DECORATIVE PANEL ─── */}
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

          {/* decorative rings */}
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

          {/* Logo */}
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

          {/* Main message */}
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
                fontFamily: "'Playfair Display', serif",
                color: "#FFF8F0",
                fontSize: "clamp(34px,3.2vw,50px)",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Change your
              <br />
              <em style={{ color: "#eaaf7c" }}>password</em>
              <br />
              with ease.
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
              Regain access to your account securely. Follow the steps to reset
              your password and get back to connecting.
            </p>
          </div>

          {/* Copyright */}
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

        {/* ─── RIGHT FORM PANEL ─── */}
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
            {success ? (
              /* ── SUCCESS STATE ── */
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div
                  className="fu0"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#C08552,#8C5A3C)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 6px 20px rgba(140,90,60,0.3)",
                  }}
                >
                  <span style={{ color: "#FFF8F0", fontSize: 26 }}>✓</span>
                </div>

                <div className="fu1">
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 26,
                      color: "#291d1c",
                      marginBottom: 10,
                    }}
                  >
                    Password updated!
                  </h2>
                  <p
                    style={{
                      color: "#7a5c4f",
                      fontSize: 14,
                      lineHeight: 1.7,
                      marginBottom: 28,
                    }}
                  >
                    Your password has been reset successfully.
                    <br />
                    You can now log in with your new credentials.
                  </p>
                </div>

                <div className="fu2">
                  <button
                    onClick={() => {
                      dispatch(clearError());
                      navigate("/login");
                    }}
                    className="rp-btn"
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
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Go to Login →
                  </button>
                </div>
              </div>
            ) : (
              /* ── FORM STATE ── */
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
                    Forgot Password · Step {step + 1} of 3
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(26px,2.8vw,36px)",
                      color: "#291d1c",
                      marginBottom: 6,
                      lineHeight: 1.2,
                    }}
                  >
                    {stepLabels[step]}
                  </h1>
                  <p
                    style={{ color: "#7a5c4f", fontSize: 13, marginBottom: 28 }}
                  >
                    {stepDescriptions[step]}
                  </p>
                </div>

                {validationError && (
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
                    {validationError}
                  </div>
                )}

                <form onSubmit={handleNext}>
                  {/* STEP 0: Email */}
                  {step === 0 && (
                    <div className="fu1 slide-in">
                      <EmailInput value={form.email} onChange={handleChange} />
                    </div>
                  )}

                  {/* STEP 1: OTP */}
                  {step === 1 && (
                    <div className="fu1 slide-in">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 14px",
                          background: "rgba(192,133,82,0.08)",
                          borderRadius: 10,
                          border: "1px solid #e1bc9c",
                          marginBottom: 24,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>📧</span>
                        <span style={{ fontSize: 12, color: "#7a5c4f" }}>
                          Code sent to{" "}
                          <strong style={{ color: "#8C5A3C" }}>
                            {form.email}
                          </strong>
                        </span>
                      </div>

                      <div
                        style={{
                          position: "relative",
                          paddingTop: 20,
                          paddingBottom: 4,
                        }}
                      >
                        <label
                          style={{
                            position: "absolute",
                            left: 0,
                            top: -5,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#a0714f",
                            // transition: "all 0.2s ease",
                            pointerEvents: "none",
                            letterSpacing: form.otp ? "0.12em" : "0",
                            textTransform: form.otp ? "uppercase" : "none",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          One-Time Password{" "}
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
                          name="otp"
                          value={form.otp}
                          onChange={handleChange}
                          maxLength={8}
                          className="otp-input"
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: `2px solid ${otpFocused ? "#8C5A3C" : "#c9a07a"}`,
                            // borderBottom: otpFocused
                            //   ? "2px solid #8C5A3C"
                            //   : "2px solid #c9a07a",
                            borderRadius: 10,
                            padding: "7px 0",
                            fontSize: 22,
                            color: "#291d1c",
                            outline: "none",
                            transition: "border-color 0.2s",
                            fontFamily: "'DM Sans', sans-serif",
                            boxSizing: "border-box",
                            textAlign: "center",
                            letterSpacing: "0.4em",
                            // fontWeight: 600,
                          }}
                          onFocus={() => setOtpFocused(true)}
                          onBlur={() => setOtpFocused(false)}
                        />
                      </div>

                      {/* <p
                        style={{
                          fontSize: 12,
                          color: "#a0714f",
                          marginTop: 12,
                          textAlign: "center",
                        }}
                      >
                        Didn't receive it?{" "}
                        <span
                          style={{
                            color: "#C08552",
                            fontWeight: 600,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Resend OTP
                        </span>
                      </p> */}
                    </div>
                  )}

                  {/* STEP 2: Password */}
                  {step === 2 && (
                    <div className="fu1 slide-in">
                      <FloatingInput
                        label="New Password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 8 chars, uppercase, number, symbol"
                        required
                      />
                      <div style={{ marginTop: 20 }}>
                        <FloatingInput
                          label="Confirm New Password"
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter your new password"
                          required
                        />
                      </div>

                      <div
                        style={{
                          marginTop: 18,
                          padding: "14px 16px",
                          background: "rgba(192,133,82,0.07)",
                          borderRadius: 10,
                          border: "1px solid #e1bc9c",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: "#8C5A3C",
                            fontWeight: 700,
                            marginBottom: 8,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          Password must have:
                        </p>
                        {passwordRules.map(({ rule, met }) => (
                          <div
                            key={rule}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                color: met ? "#8C5A3C" : "#c9a07a",
                                fontWeight: 700,
                              }}
                            >
                              {met ? "✓" : "·"}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: met ? "#291d1c" : "#a0714f",
                              }}
                            >
                              {rule}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="fu3" style={{ marginTop: 34 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rp-btn"
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: loading
                          ? "#c9a07a"
                          : "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
                        color: "#FFF8F0",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 6px 24px rgba(140,90,60,0.32)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {step === 0 && loading
                        ? "Sending OTP..."
                        : buttonLabels[step]}
                    </button>

                    {step > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setStep(step - 1);
                          setValidationError("");
                        }}
                        className="rp-btn"
                        style={{
                          width: "100%",
                          marginTop: 12,
                          padding: "13px",
                          background: "transparent",
                          color: "#7a5c4f",
                          border: "2px solid #c9a07a",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ← Back
                      </button>
                    )}

                    {step === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(clearError());
                          navigate("/login");
                        }}
                        className="rp-btn"
                        style={{
                          width: "100%",
                          marginTop: 12,
                          padding: "13px",
                          background: "transparent",
                          color: "#7a5c4f",
                          border: "2px solid #c9a07a",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ← Back to Login
                      </button>
                    )}
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

export default ResetPassword;
