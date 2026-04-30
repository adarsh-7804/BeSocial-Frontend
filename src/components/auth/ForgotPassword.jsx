import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../features/userSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
    setSubmitted(true);
  };

  const lifted = focused || email;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fu0{animation:fadeUp .5s .05s both} .fu1{animation:fadeUp .5s .15s both}
        .fu2{animation:fadeUp .5s .25s both} .fu3{animation:fadeUp .5s .35s both}
        .fp-btn:hover{opacity:.88!important} .fp-btn:active{transform:scale(.98)!important}
      `}</style>

      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:"#FFF8F0", fontFamily:"'DM Sans',sans-serif", padding:"32px 16px",
        position:"relative", overflow:"hidden",
      }}>
        {/* Background decorative blobs */}
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"rgba(192,133,82,0.06)", top:-180, right:-120, pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:360, height:360, borderRadius:"50%", background:"rgba(140,90,60,0.06)", bottom:-140, left:-100, pointerEvents:"none" }} />
        {/* dot grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(193,133,81,0.1) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none" }} />

        <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>

          {/* Brand mark */}
          <div className="fu0" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, justifyContent:"center" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#C08552,#8C5A3C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#FFF8F0" }}>✦</div>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8C5A3C" }}>BeSocial</span>
          </div>

          {/* Card */}
          <div style={{
            background:"#FFF8F0", borderRadius:20,
            border:"1.5px solid #e1bc9c",
            boxShadow:"0 8px 48px rgba(140,90,60,0.1), 0 2px 8px rgba(140,90,60,0.06)",
            padding:"44px 40px",
            position:"relative", overflow:"hidden",
          }}>
            {/* Top accent */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#C08552,#eaaf7c,#C08552)", borderRadius:"20px 20px 0 0" }} />

            {submitted ? (
              <div style={{ textAlign:"center", padding:"8px 0" }}>
                <div className="fu0" style={{
                  width:64, height:64, borderRadius:"50%",
                  background:"linear-gradient(135deg,#C08552,#8C5A3C)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 20px", boxShadow:"0 6px 20px rgba(140,90,60,0.3)",
                }}>
                  <span style={{ color:"#FFF8F0", fontSize:26 }}>✓</span>
                </div>
                <div className="fu1">
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:"#291d1c", marginBottom:10 }}>Check your inbox</h2>
                  <p style={{ color:"#7a5c4f", fontSize:14, lineHeight:1.7, marginBottom:28 }}>
                    We've sent reset instructions to<br/>
                    <strong style={{ color:"#291d1c" }}>{email}</strong>
                  </p>
                </div>
                <div className="fu2">
                  <button onClick={() => navigate("/login")} className="fp-btn cursor-pointer"
                    style={{
                      width:"100%", padding:"14px", background:"linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
                      color:"#FFF8F0", border:"none", borderRadius:10, fontSize:13, fontWeight:600,
                      letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer",
                      boxShadow:"0 6px 24px rgba(140,90,60,0.3)", transition:"all 0.2s",
                      fontFamily:"'DM Sans',sans-serif",
                    }}>
                    Back to Login →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="fu0">
                  <p style={{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#C08552", fontWeight:700, marginBottom:10 }}>Account Recovery</p>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3vw,32px)", color:"#291d1c", marginBottom:8, lineHeight:1.2 }}>
                    Forgot your password?
                  </h1>
                  <p style={{ color:"#7a5c4f", fontSize:13, lineHeight:1.7, marginBottom:36 }}>
                    No worries — enter your email and we'll send you a reset link right away.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="fu1" style={{ position:"relative", paddingTop:20, paddingBottom:4, marginBottom:32 }}>
                    <label style={{
                      position:"absolute", left:0, top: lifted ? 0 : 22,
                      fontSize: lifted ? 10 : 14, fontWeight: lifted ? 700 : 400,
                      color: focused ? "#8C5A3C" : "#a0714f", transition:"all 0.2s ease",
                      pointerEvents:"none", letterSpacing: lifted ? "0.12em" : "0",
                      textTransform: lifted ? "uppercase" : "none", fontFamily:"'DM Sans',sans-serif",
                    }}>
                      Email Address
                      <span style={{ color:"#ef4444", fontSize:9, marginLeft:2, verticalAlign:"super" }}>*</span>
                    </label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder={focused ? "name@mail.com" : ""}
                      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                      style={{
                        width:"100%", background:"transparent", border:"none",
                        borderBottom: focused ? "2px solid #8C5A3C" : "2px solid #c9a07a",
                        padding:"7px 0", fontSize:15, color:"#291d1c", outline:"none",
                        transition:"border-color 0.2s", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box",
                      }}
                    />
                  </div>

                  <div className="fu2">
                    <button type="submit" className="fp-btn cursor-pointer"
                      style={{
                        width:"100%", padding:"14px", background:"linear-gradient(135deg,#C08552 0%,#8C5A3C 100%)",
                        color:"#FFF8F0", border:"none", borderRadius:10, fontSize:13, fontWeight:600,
                        letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer",
                        boxShadow:"0 6px 24px rgba(140,90,60,0.3)", transition:"all 0.2s",
                        fontFamily:"'DM Sans',sans-serif",
                      }}>
                      Send Reset Link →
                    </button>
                  </div>

                  <div className="fu3" style={{ marginTop:16 }}>
                    <button type="button" onClick={() => navigate("/login")} className="fp-btn cursor-pointer"
                      style={{
                        width:"100%", padding:"13px", background:"transparent",
                        color:"#7a5c4f", border:"2px solid #c9a07a", borderRadius:10, fontSize:13, fontWeight:500,
                        cursor:"pointer", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif",
                      }}>
                      ← Back to Login
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
