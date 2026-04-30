
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../features/userSlice";
import { checkEmail } from "../../api/userApi";
import { toast } from "react-toastify";

/*  Instagram-style Box Input  */
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



/*  Eye Icon  */
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

/*  Info Icon  */
const InfoButton = ({ onClick, onMouseEnter, onMouseLeave }) => (
  <div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
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
    }}
  >
    ℹ
  </div>
);

/*  Main Component  */
const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.user);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    gender: "",
    agreeToTerms: false,
    accountType: "",
  });
  const [validationError, setValidationError] = useState("");
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (status === "success") navigate("/");
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) localStorage.setItem("referralCode", ref);
  }, [status, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setValidationError("");
  };

  const validateStep1 = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Email is required";
    if (!form.phoneNumber.trim()) return "Phone number is required";
    if (!/^(\+91)?[6-9]\d{9}$/.test(form.phoneNumber.trim()))
      return "Enter a valid phone number";
    return null;
  };

  const validateStep2 = () => {
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password))
      return "Password needs at least one uppercase letter";
    if (!/[0-9]/.test(form.password))
      return "Password needs at least one number";
    if (!/[!@#$%^&*]/.test(form.password))
      return "Password needs at least one special character";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.gender) return "Please select your gender";
    if (!form.agreeToTerms) return "You must agree to the terms and conditions";
    return null;
  };

  const handleNext = async () => {
    const err = validateStep1();
    if (err) {
      setValidationError(err);
      return;
    }
    try {
      const res = await checkEmail(form.email);
      if (res.data.exists) {
        setValidationError("Email already exists");
        return;
      }
      setStep(2);
    } catch (err) {
      setValidationError(err.response?.data?.message || "Error checking email");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setValidationError(err);
      return;
    }
    const { confirmPassword, ...payload } = form;
    const referralCode = localStorage.getItem("referralCode");
    const res = await dispatch(registerUser({ ...payload, referralCode }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("You Registered Successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/login"));
    } else {
      setValidationError(res.payload || "Registration failed");
    }
  };

  const genders = ["Male", "Female", "Other"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .deco-ring{border-radius:50%;border:1px solid rgba(255,255,255,0.12);position:absolute;}
        .reg-btn:hover{opacity:.88!important} .reg-btn:active{transform:scale(.98)!important}
        .gender-pill:hover{border-color:#8C5A3C!important;background:rgba(140,90,60,0.08)!important}
        .box-input:focus{border-color:#8C5A3C!important}
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          background: "#FFF8F0",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          style={{
            width: "42%",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(155deg,#8C5A3C 0%,#5e3519 55%,#3b1f0a 100%)",
            padding: "52px 48px",
          }}
          className="lg-panel"
        >
          <style>{`.lg-panel{display:none} @media(min-width:1024px){.lg-panel{display:flex!important}}`}</style>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg,#eaaf7c,#3b1f0a)",
            }}
          />
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle,rgba(234,175,124,0.08) 1px,transparent 1px)",
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
              Join Today
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
              Your next
              <br />
              <em style={{ color: "#eaaf7c" }}>Social Life</em>
              <br />
              starts here.
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
              Create your account and step into a world of curated experiences.
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

        {/* ── RIGHT FORM PANEL ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: 400 }}>
            {/* Header */}
            <div>
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
                New Account
              </p>
              <h1
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(24px,2.8vw,34px)",
                  color: "#291d1c",
                  marginBottom: 6,
                  lineHeight: 1.2,
                }}
              >
                {step === 1 ? "Let's get you started" : "Almost there!"}
              </h1>
              <p style={{ color: "#7a5c4f", fontSize: 13, marginBottom: 28 }}>
                {step === 1
                  ? "Tell us a bit about yourself."
                  : "Set up your password & preferences."}
              </p>
            </div>

            {/* Error */}
            {validationError && (
              <div
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

            {/* ── STEP 1 ── */}
            {step === 1 ? (
              <div key="step1">
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <BoxInput
                      label="First Name"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <BoxInput
                      label="Last Name"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <BoxInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@mail.com"
                    required
                  />
                </div>

                <div style={{ marginTop: 18 }}>
                  <BoxInput
                    label="Phone Number"
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div style={{ marginTop: 34 }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="reg-btn cursor-pointer"
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
                      transition: "all 0.2s",
                      boxShadow: "0 6px 24px rgba(140,90,60,0.32)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            ) : (
              /* ── STEP 2 ── */
              <form key="step2" onSubmit={handleSubmit}>
                {/* Password field */}
                <div style={{ position: "relative" }}>
                  <BoxInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 chars, uppercase, number, symbol"
                    required
                    labelExtra={
                      <div
                        style={{ position: "relative" }}
                        onMouseEnter={() => setShowPasswordInfo(true)}
                        onMouseLeave={() => setShowPasswordInfo(false)}
                      >
                        <InfoButton />
                        {showPasswordInfo && (
                          <div
                            style={{
                              position: "absolute",
                              top: -6,
                              left: 24,
                              width: 230,
                              background: "#291d1c",
                              border: "1px solid #8C5A3C",
                              borderRadius: 8,
                              padding: 12,
                              zIndex: 20,
                              color: "#FFF8F0",
                              fontSize: 12,
                              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: 600,
                                marginBottom: 8,
                                color: "#C08552",
                              }}
                            >
                              Password Requirements:
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              <li style={{ marginBottom: 4 }}>
                                Minimum 8 characters
                              </li>
                              <li style={{ marginBottom: 4 }}>
                                At least 1 uppercase letter (A–Z)
                              </li>
                              <li style={{ marginBottom: 4 }}>
                                At least 1 number (0–9)
                              </li>
                              <li>At least 1 special character (!@#$%^&*)</li>
                            </ul>
                            <div
                              style={{
                                position: "absolute",
                                left: -8,
                                top: 10,
                                width: 14,
                                height: 14,
                                background: "#291d1c",
                                border: "1px solid #8C5A3C",
                                borderRight: "none",
                                borderBottom: "none",
                                transform: "rotate(45deg)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    }
                    rightIcon={
                      <span onClick={() => setShowPassword((v) => !v)}>
                        <EyeIcon visible={showPassword} />
                      </span>
                    }
                  />
                </div>

                {/* Confirm Password */}
                <div style={{ marginTop: 18 }}>
                  <BoxInput
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    rightIcon={
                      <span onClick={() => setShowConfirmPassword((v) => !v)}>
                        <EyeIcon visible={showConfirmPassword} />
                      </span>
                    }
                  />
                </div>

                {/* Gender */}
                <div style={{ marginTop: 24 }}>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#8C5A3C",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Gender{" "}
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: 9,
                        verticalAlign: "super",
                      }}
                    >
                      *
                    </span>
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {genders.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className="gender-pill cursor-pointer"
                        onClick={() => {
                          setForm({ ...form, gender: g.toLowerCase() });
                          setValidationError("");
                        }}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          borderRadius: 10,
                          border: "1.5px solid",
                          borderColor:
                            form.gender === g.toLowerCase()
                              ? "#8C5A3C"
                              : "#c9a07a",
                          background:
                            form.gender === g.toLowerCase()
                              ? "rgba(140,90,60,0.12)"
                              : "#fff",
                          color:
                            form.gender === g.toLowerCase()
                              ? "#291d1c"
                              : "#7a5c4f",
                          fontWeight:
                            form.gender === g.toLowerCase() ? 700 : 400,
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div
                    onClick={() => {
                      setForm({ ...form, agreeToTerms: !form.agreeToTerms });
                      setValidationError("");
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: "2px solid",
                      flexShrink: 0,
                      marginTop: 1,
                      borderColor: form.agreeToTerms ? "#8C5A3C" : "#c9a07a",
                      background: form.agreeToTerms ? "#8C5A3C" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {form.agreeToTerms && (
                      <span
                        style={{
                          color: "#FFF8F0",
                          fontSize: 11,
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    style={{ fontSize: 13, color: "#4B2E2B", lineHeight: 1.6 }}
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      style={{
                        color: "#291d1c",
                        fontWeight: 700,
                        textDecoration: "none",
                        borderBottom: "1px solid #C08552",
                      }}
                    >
                      Terms & Conditions
                    </Link>
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: 9,
                        verticalAlign: "super",
                        marginLeft: 2,
                      }}
                    >
                      *
                    </span>
                  </span>
                </div>

                {/* Buttons */}
                <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => {
                      setStep(1);
                      setValidationError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "transparent",
                      color: "#7a5c4f",
                      border: "2px solid #c9a07a",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="reg-btn cursor-pointer"
                    style={{
                      flex: 2,
                      padding: "14px",
                      background:
                        status === "loading"
                          ? "#c9a07a"
                          : "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
                      color: "#FFF8F0",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 6px 24px rgba(140,90,60,0.32)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    {status === "loading" ? "Creating…" : "Create Account →"}
                  </button>
                </div>
              </form>
            )}

            {/* Login link */}
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#7a5c4f" }}>
                Already have an account?{" "}
              </span>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => navigate("/login")}
                style={{
                  fontSize: 13,
                  color: "#291d1c",
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "2px solid #C08552",
                  paddingBottom: 1,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
