// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { resetPassword } from "../../features/userSlice";

// const FloatingInput = ({
//   label,
//   type = "text",
//   name,
//   value,
//   onChange,
//   placeholder,
//   required,
// }) => {
//   const [focused, setFocused] = useState(false);
//   const lifted = focused || value;
//   return (
//     <div style={{ position: "relative", paddingTop: 20, paddingBottom: 4 }}>
//       <label
//         style={{
//           position: "absolute",
//           left: 0,
//           top: lifted ? 0 : 22,
//           fontSize: lifted ? 10 : 14,
//           fontWeight: lifted ? 700 : 400,
//           color: focused ? "#8C5A3C" : "#a0714f",
//           transition: "all 0.2s ease",
//           pointerEvents: "none",
//           letterSpacing: lifted ? "0.12em" : "0",
//           textTransform: lifted ? "uppercase" : "none",
//           fontFamily: "'DM Sans',sans-serif",
//         }}
//       >
//         {label}
//         {required && (
//           <span
//             style={{
//               color: "#ef4444",
//               fontSize: 9,
//               marginLeft: 2,
//               verticalAlign: "super",
//             }}
//           >
//             *
//           </span>
//         )}
//       </label>
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={focused ? placeholder : ""}
//         onFocus={() => setFocused(true)}
//         onBlur={() => setFocused(false)}
//         style={{
//           width: "100%",
//           background: "transparent",
//           border: "none",
//           borderBottom: focused ? "2px solid #8C5A3C" : "2px solid #c9a07a",
//           padding: "7px 0",
//           fontSize: 15,
//           color: "#291d1c",
//           outline: "none",
//           transition: "border-color 0.2s",
//           fontFamily: "'DM Sans',sans-serif",
//           boxSizing: "border-box",
//         }}
//       />
//     </div>
//   );
// };

// const ResetPassword = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { token } = useParams();
//   // const [form, setForm] = useState({ password:"", confirmPassword:"" });
//   const [form, setForm] = useState({
//     email: "",
//     otp: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [validationError, setValidationError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setValidationError("");
//   };

//   const validate = () => {
//     if (form.password.length < 8)
//       return "Password must be at least 8 characters";
//     if (!/[A-Z]/.test(form.password))
//       return "Password needs at least one uppercase letter";
//     if (!/[0-9]/.test(form.password))
//       return "Password needs at least one number";
//     if (!/[!@#$%^&*]/.test(form.password))
//       return "Password needs at least one special character";
//     if (form.password !== form.confirmPassword) return "Passwords do not match";
//     return null;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const err = validate();
//     if (err) {
//       setValidationError(err);
//       return;
//     }
//     dispatch(
//       resetPassword({
//         email,
//         resetPasswordOtp,
//         newPassword: form.password,
//       }),
//     );
//     setSuccess(true);
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
//         @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
//         .fu0{animation:fadeUp .5s .05s both} .fu1{animation:fadeUp .5s .15s both}
//         .fu2{animation:fadeUp .5s .25s both} .fu3{animation:fadeUp .5s .35s both}
//         .fu4{animation:fadeUp .5s .45s both}
//         .rp-btn:hover{opacity:.88!important} .rp-btn:active{transform:scale(.98)!important}
//       `}</style>

//       <div
//         style={{
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "#FFF8F0",
//           fontFamily: "'DM Sans',sans-serif",
//           padding: "32px 16px",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* Background decorative blobs */}
//         <div
//           style={{
//             position: "absolute",
//             width: 500,
//             height: 500,
//             borderRadius: "50%",
//             background: "rgba(192,133,82,0.06)",
//             top: -180,
//             right: -120,
//             pointerEvents: "none",
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             width: 360,
//             height: 360,
//             borderRadius: "50%",
//             background: "rgba(140,90,60,0.06)",
//             bottom: -140,
//             left: -100,
//             pointerEvents: "none",
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             backgroundImage:
//               "radial-gradient(circle,rgba(193,133,81,0.1) 1px,transparent 1px)",
//             backgroundSize: "30px 30px",
//             pointerEvents: "none",
//           }}
//         />

//         <div
//           style={{
//             width: "100%",
//             maxWidth: 420,
//             position: "relative",
//             zIndex: 1,
//           }}
//         >
//           {/* Brand mark */}
//           <div
//             className="fu0"
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               marginBottom: 36,
//               justifyContent: "center",
//             }}
//           >
//             <div
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: "50%",
//                 background: "linear-gradient(135deg,#C08552,#8C5A3C)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 14,
//                 color: "#FFF8F0",
//               }}
//             >
//               ✦
//             </div>
//             <span
//               style={{
//                 fontSize: 11,
//                 fontWeight: 700,
//                 letterSpacing: "0.22em",
//                 textTransform: "uppercase",
//                 color: "#8C5A3C",
//               }}
//             >
//               BeSocial
//             </span>
//           </div>

//           {/* Card */}
//           <div
//             style={{
//               background: "#FFF8F0",
//               borderRadius: 20,
//               border: "1.5px solid #e1bc9c",
//               boxShadow:
//                 "0 8px 48px rgba(140,90,60,0.1), 0 2px 8px rgba(140,90,60,0.06)",
//               padding: "44px 40px",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 height: 3,
//                 background: "linear-gradient(90deg,#C08552,#eaaf7c,#C08552)",
//                 borderRadius: "20px 20px 0 0",
//               }}
//             />

//             {success ? (
//               <div style={{ textAlign: "center", padding: "8px 0" }}>
//                 <div
//                   className="fu0"
//                   style={{
//                     width: 64,
//                     height: 64,
//                     borderRadius: "50%",
//                     background: "linear-gradient(135deg,#C08552,#8C5A3C)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     margin: "0 auto 20px",
//                     boxShadow: "0 6px 20px rgba(140,90,60,0.3)",
//                   }}
//                 >
//                   <span style={{ color: "#FFF8F0", fontSize: 26 }}>✓No worries</span>
//                 </div>
//                 <div className="fu1">
//                   <h2
//                     style={{
//                       fontFamily: "'Playfair Display',serif",
//                       fontSize: 26,
//                       color: "#291d1c",
//                       marginBottom: 10,
//                     }}
//                   >
//                     Password updated!
//                   </h2>
//                   <p
//                     style={{
//                       color: "#7a5c4f",
//                       fontSize: 14,
//                       lineHeight: 1.7,
//                       marginBottom: 28,
//                     }}
//                   >
//                     Your password has been reset successfully.
//                     <br />
//                     You can now log in with your new credentials.
//                   </p>
//                 </div>
//                 <div className="fu2">
//                   <button
//                     onClick={() => navigate("/login")}
//                     className="rp-btn"
//                     style={{
//                       width: "100%",
//                       padding: "14px",
//                       background:
//                         "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
//                       color: "#FFF8F0",
//                       border: "none",
//                       borderRadius: 10,
//                       fontSize: 13,
//                       fontWeight: 600,
//                       letterSpacing: "0.1em",
//                       textTransform: "uppercase",
//                       cursor: "pointer",
//                       boxShadow: "0 6px 24px rgba(140,90,60,0.3)",
//                       transition: "all 0.2s",
//                       fontFamily: "'DM Sans',sans-serif",
//                     }}
//                   >
//                     Go to Login →
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="fu0">
//                   <p
//                     style={{
//                       fontSize: 10,
//                       letterSpacing: "0.22em",
//                       textTransform: "uppercase",
//                       color: "#C08552",
//                       fontWeight: 700,
//                       marginBottom: 10,
//                     }}
//                   >
//                     New Password
//                   </p>
//                   <h1
//                     style={{
//                       fontFamily: "'Playfair Display',serif",
//                       fontSize: "clamp(24px,3vw,32px)",
//                       color: "#291d1c",
//                       marginBottom: 8,
//                       lineHeight: 1.2,
//                     }}
//                   >
//                     Reset your password
//                   </h1>
//                   <p
//                     style={{
//                       color: "#7a5c4f",
//                       fontSize: 13,
//                       lineHeight: 1.7,
//                       marginBottom: 32,
//                     }}
//                   >
//                     Choose a strong password to secure your account.
//                   </p>
//                 </div>

//                 {validationError && (
//                   <div
//                     className="fu0"
//                     style={{
//                       background: "#fee2e2",
//                       border: "1px solid #fca5a5",
//                       borderRadius: 10,
//                       padding: "11px 15px",
//                       marginBottom: 22,
//                       color: "#b91c1c",
//                       fontSize: 13,
//                     }}
//                   >
//                     {validationError}
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit}>
//                   <div className="fu1">
//                     <FloatingInput
//                       label="New Password"
//                       type="password"
//                       name="password"
//                       value={form.password}
//                       onChange={handleChange}
//                       placeholder="Min. 8 chars, uppercase, number, symbol"
//                       required
//                     />
//                   </div>
//                   <div className="fu2" style={{ marginTop: 20 }}>
//                     <FloatingInput
//                       label="Confirm New Password"
//                       type="password"
//                       name="confirmPassword"
//                       value={form.confirmPassword}
//                       onChange={handleChange}
//                       placeholder="Re-enter your new password"
//                       required
//                     />
//                   </div>

//                   {/* Password hints */}
//                   <div
//                     className="fu3"
//                     style={{
//                       marginTop: 18,
//                       padding: "14px 16px",
//                       background: "rgba(192,133,82,0.07)",
//                       borderRadius: 10,
//                       border: "1px solid #e1bc9c",
//                     }}
//                   >
//                     <p
//                       style={{
//                         fontSize: 11,
//                         color: "#8C5A3C",
//                         fontWeight: 700,
//                         marginBottom: 8,
//                         letterSpacing: "0.06em",
//                         textTransform: "uppercase",
//                       }}
//                     >
//                       Password must have:
//                     </p>
//                     {[
//                       {
//                         rule: "At least 8 characters",
//                         met: form.password.length >= 8,
//                       },
//                       {
//                         rule: "One uppercase letter",
//                         met: /[A-Z]/.test(form.password),
//                       },
//                       { rule: "One number", met: /[0-9]/.test(form.password) },
//                       {
//                         rule: "One special character (!@#$%^&*)",
//                         met: /[!@#$%^&*]/.test(form.password),
//                       },
//                     ].map(({ rule, met }) => (
//                       <div
//                         key={rule}
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 8,
//                           marginBottom: 4,
//                         }}
//                       >
//                         <span
//                           style={{
//                             fontSize: 11,
//                             color: met ? "#8C5A3C" : "#c9a07a",
//                             fontWeight: 700,
//                           }}
//                         >
//                           {met ? "✓" : "·"}
//                         </span>
//                         <span
//                           style={{
//                             fontSize: 12,
//                             color: met ? "#291d1c" : "#a0714f",
//                           }}
//                         >
//                           {rule}
//                         </span>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="fu4" style={{ marginTop: 28 }}>
//                     <button
//                       type="submit"
//                       className="rp-btn"
//                       style={{
//                         width: "100%",
//                         padding: "14px",
//                         background:
//                           "linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
//                         color: "#FFF8F0",
//                         border: "none",
//                         borderRadius: 10,
//                         fontSize: 13,
//                         fontWeight: 600,
//                         letterSpacing: "0.1em",
//                         textTransform: "uppercase",
//                         cursor: "pointer",
//                         boxShadow: "0 6px 24px rgba(140,90,60,0.3)",
//                         transition: "all 0.2s",
//                         fontFamily: "'DM Sans',sans-serif",
//                       }}
//                     >
//                       Reset Password →
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => navigate("/login")}
//                       className="rp-btn"
//                       style={{
//                         width: "100%",
//                         marginTop: 12,
//                         padding: "13px",
//                         background: "transparent",
//                         color: "#7a5c4f",
//                         border: "2px solid #c9a07a",
//                         borderRadius: 10,
//                         fontSize: 13,
//                         fontWeight: 500,
//                         cursor: "pointer",
//                         transition: "all 0.2s",
//                         fontFamily: "'DM Sans',sans-serif",
//                       }}
//                     >
//                       ← Back to Login
//                     </button>
//                   </div>
//                 </form>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ResetPassword;

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPassword, forgotPassword } from "../../features/userSlice";
import { selectAuthLoading } from "../../features/userSlice";

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
          fontFamily: "'DM Sans',sans-serif",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

// Step indicator dots
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

const STEPS = ["Email", "OTP", "Password"];

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
        setValidationError(result.payload || "Failed to send OTP. Try again.");
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .fu0{animation:fadeUp .5s .05s both}
        .fu1{animation:fadeUp .5s .15s both}
        .fu2{animation:fadeUp .5s .25s both}
        .fu3{animation:fadeUp .5s .35s both}
        .fu4{animation:fadeUp .5s .45s both}
        .slide-in{animation:slideIn .35s ease both}
        .rp-btn:hover{opacity:.88!important}
        .rp-btn:active{transform:scale(.98)!important}
        .otp-input{
          text-align:center;
          font-size:22px!important;
          letter-spacing:0.4em!important;
          font-weight:600!important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF8F0",
          fontFamily: "'DM Sans',sans-serif",
          padding: "32px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative blobs */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(192,133,82,0.06)",
            top: -180,
            right: -120,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(140,90,60,0.06)",
            bottom: -140,
            left: -100,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle,rgba(193,133,81,0.1) 1px,transparent 1px)",
            backgroundSize: "30px 30px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: 440,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Brand mark */}
          <div
            className="fu0"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 36,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#C08552,#8C5A3C)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#FFF8F0",
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#8C5A3C",
              }}
            >
              BeSocial
            </span>
          </div>

          {/* Card */}
          <div
            style={{
              background: "#FFF8F0",
              borderRadius: 20,
              border: "1.5px solid #e1bc9c",
              boxShadow:
                "0 8px 48px rgba(140,90,60,0.1), 0 2px 8px rgba(140,90,60,0.06)",
              padding: "44px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top gradient bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg,#C08552,#eaaf7c,#C08552)",
                borderRadius: "20px 20px 0 0",
              }}
            />

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
                      fontFamily: "'Playfair Display',serif",
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
                    onClick={() => navigate("/login")}
                    className="rp-btn cursor-pointer"
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
                    Go to Login →
                  </button>
                </div>
              </div>
            ) : (
              /*  FORM STATE  */
              <>
                {/* Header */}
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
                    Reset Password · Step {step + 1} of 3
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "clamp(22px,3vw,30px)",
                      color: "#291d1c",
                      marginBottom: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    {stepLabels[step]}
                  </h1>
                  <p
                    style={{
                      color: "#7a5c4f",
                      fontSize: 13,
                      lineHeight: 1.7,
                      marginBottom: 24,
                    }}
                  >
                    {stepDescriptions[step]}
                  </p>
                </div>

                {/* Step dots */}

                {/* Error message */}
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
                  {step === 0 && (
                    <div className="slide-in">
                      <FloatingInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  )}

                  {step === 1 && (
                    <div className="slide-in">
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
                            top: form.otp ? 0 : 22,
                            fontSize: form.otp ? 10 : 14,
                            fontWeight: form.otp ? 700 : 400,
                            color: "#a0714f",
                            transition: "all 0.2s ease",
                            pointerEvents: "none",
                            letterSpacing: form.otp ? "0.12em" : "0",
                            textTransform: form.otp ? "uppercase" : "none",
                            fontFamily: "'DM Sans',sans-serif",
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
                            border: "none",
                            borderBottom: "2px solid #c9a07a",
                            padding: "7px 0",
                            fontSize: 22,
                            color: "#291d1c",
                            outline: "none",
                            transition: "border-color 0.2s",
                            fontFamily: "'DM Sans',sans-serif",
                            boxSizing: "border-box",
                            textAlign: "center",
                            letterSpacing: "0.4em",
                            fontWeight: 600,
                          }}
                          onFocus={(e) => {
                            e.target.style.borderBottomColor = "#8C5A3C";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderBottomColor = "#c9a07a";
                          }}
                        />
                      </div>

                      <p
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
                      </p>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="slide-in">
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
                        {[
                          {
                            rule: "At least 8 characters",
                            met: form.password.length >= 8,
                          },
                          {
                            rule: "One uppercase letter",
                            met: /[A-Z]/.test(form.password),
                          },
                          {
                            rule: "One number",
                            met: /[0-9]/.test(form.password),
                          },
                          {
                            rule: "One special character (!@#$%^&*)",
                            met: /[!@#$%^&*]/.test(form.password),
                          },
                        ].map(({ rule, met }) => (
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
                  <div style={{ marginTop: 28 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rp-btn cursor-pointer"
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
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 24px rgba(140,90,60,0.3)",
                        transition: "all 0.2s",
                        fontFamily: "'DM Sans',sans-serif",
                        opacity: loading ? 0.7 : 1,
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
                        className="rp-btn cursor-pointer"
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
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        ← Back
                      </button>
                    )}

                    {step === 0 && (
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="rp-btn cursor-pointer"
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
                          fontFamily: "'DM Sans',sans-serif",
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
