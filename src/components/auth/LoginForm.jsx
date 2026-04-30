import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../../features/userSlice";
import { verifyLoginOtp, requestReactivation } from "../../features/userSlice";

const BoxInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  rightIcon,
  labelExtra,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {/* Label row */}
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#8C5A3C",
          fontFamily: "'DM Sans',sans-serif",
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
      {labelExtra}
    </div>

    {/* Input box */}
    <div style={{ position: "relative" }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: rightIcon ? "11px 42px 11px 14px" : "11px 14px",
          background: "#fff",
          border: "1.5px solid #c9a07a",
          borderRadius: 10,
          fontSize: 14,
          color: "#291d1c",
          outline: "none",
          fontFamily: "'DM Sans',sans-serif",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#8C5A3C")}
        onBlur={(e) => (e.target.style.borderColor = "#c9a07a")}
      />
      {rightIcon && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {rightIcon}
        </div>
      )}
    </div>
  </div>
);

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

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.user);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showReactivatePopup, setShowReactivatePopup] = useState(false);
  const [reactivateUserId, setReactivateUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    console.log("Reactivate Popup:", showReactivatePopup);
  }, [showReactivatePopup]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await dispatch(loginUser(form)).unwrap();

      setEmailForOtp(res.email);
      setShowOtpPopup(true);
    } catch (err) {
      console.log("FULL ERROR:", err);

      if (err?.canReactivate) {
        setReactivateUserId(err.userId);
        setShowReactivatePopup(true);
      } else {
        console.log("OTHER ERROR:", err);
      }
    }
  };


  const handleVerifyOtp = async () => {
    setOtpError(""); 
    try {
      const res = await dispatch(
        verifyLoginOtp({ email: emailForOtp, otp: otp }),
      ).unwrap();

      setShowOtpPopup(false);
      dispatch(fetchFriendRequests()); 
      navigate("/main");
    } catch (err) {
      setOtpError(err?.message || "Invalid OTP. Please Re-Enter the OTP.");
    }
  };

  const handleReactivate = async () => {
    try {
      const res = await dispatch(
        requestReactivation({ userId: reactivateUserId }),
      ).unwrap();

      setEmailForOtp(res.email);
      setShowReactivatePopup(false);
      setShowOtpPopup(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu0{animation:fadeUp .5s .05s both} .fu1{animation:fadeUp .5s .15s both}
        .fu2{animation:fadeUp .5s .25s both} .fu3{animation:fadeUp .5s .35s both}
        .fu4{animation:fadeUp .5s .45s both}
        .deco-ring{border-radius:50%;border:1px solid rgba(255,255,255,0.12);position:absolute;}
        .login-btn:hover{opacity:.88!important} .login-btn:active{transform:scale(.98)!important}
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
          <style>{`.lg-panel{display:none} @media(min-width:1024px){.lg-panel{display:flex!important}}`}</style>

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
              Welcome Back
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
              The social
              <br />
              <em style={{ color: "#eaaf7c" }}>world's</em>
              <br />
              await you.
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
              Discover, connect, and experience moments that matter — all in one
              place.
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
            © 2025 BeSocial
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
                Sign In
              </p>
              <h1
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(26px,2.8vw,36px)",
                  color: "#291d1c",
                  marginBottom: 6,
                  lineHeight: 1.2,
                }}
              >
                Good to see you again
              </h1>
              <p style={{ color: "#7a5c4f", fontSize: 13, marginBottom: 38 }}>
                Enter your credentials to continue.
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
                {/* {error} */}
                {typeof error === "string" ? error : error?.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="fu1">
                <BoxInput
                  label="Email Address"
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Enter Email/UserName"
                  required
                />
              </div>
              <div className="fu2" style={{ marginTop: 20 }}>
                <BoxInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  rightIcon={
                    <span onClick={() => setShowPassword((v) => !v)}>
                      <EyeIcon visible={showPassword} />
                    </span>
                  }
                />
              </div>

              <div
                className="fu2"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <Link
                  to="/reset-pass"
                  style={{
                    fontSize: 12,
                    color: "#8C5A3C",
                    fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                  }}
                >
                  Re-Set Password?
                </Link>
              </div>

              <div className="fu3" style={{ marginTop: 34 }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="login-btn cursor-pointer"
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
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>

            <div
              className="fu4"
              style={{
                marginTop: 26,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e1bc9c" }} />
              <span
                style={{
                  fontSize: 10,
                  color: "#c18551",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                or
              </span>
              <div style={{ flex: 1, height: 1, background: "#e1bc9c" }} />
            </div>

            <div className="fu4" style={{ marginTop: 22, textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#7a5c4f" }}>New here? </span>
              <Link
                to="/"
                style={{
                  fontSize: 13,
                  color: "#291d1c",
                  fontWeight: 700,
                  textDecoration: "none",
                  borderBottom: "2px solid #C08552",
                  paddingBottom: 1,
                }}
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
      {showReactivatePopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 12,
              width: 340,
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Account Deactivated</h3>

            <p style={{ fontSize: 14, marginBottom: 20 }}>
              Do you want to reactivate your account?
            </p>

            <button
              onClick={handleReactivate}
              className="cursor-pointer"
              style={{
                width: "100%",
                padding: 12,
                background: "#8C5A3C",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              Yes, Reactivate
            </button>

            <button
              onClick={() => setShowReactivatePopup(false)}
              className="cursor-pointer"
              style={{
                fontSize: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showOtpPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 12,
              width: 320,
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 15 }}>Verify OTP</h3>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6 digit OTP"
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 6,
                marginBottom: 20,
              }}
            />

            {otpError && (
              <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>
                {otpError}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              className="cursor-pointer"
              style={{
                width: "100%",
                padding: 12,
                background: "#8C5A3C",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Verify OTP
            </button>

            <button
              onClick={() => setShowOtpPopup(false)}
              className="cursor-pointer"
              style={{
                marginTop: 10,
                fontSize: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
