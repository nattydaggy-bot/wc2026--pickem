import { useState } from "react";
const FONT = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";
const BG = "linear-gradient(160deg,#0d1117 0%,#13101f 100%)";

const inputStyle = {
  width:"100%", padding:"0.7rem 0.85rem", borderRadius:8,
  border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
  color:"#fff", fontSize:"0.95rem", boxSizing:"border-box", outline:"none",
  fontFamily:FONT,
};
const labelStyle = {
  display:"block", fontSize:"0.65rem", letterSpacing:"1.5px", color:"#666",
  marginBottom:5, marginTop:"0.9rem", fontWeight:"bold",
};

export default function LeagueEntry({ onCreate, onJoin, onLogin, busy, error, clearError, savedCode }) {
  const [mode, setMode]     = useState("home");
  const [code, setCode]     = useState("");
  const [user, setUser]     = useState("");
  const [team, setTeam]     = useState("");
  const [local, setLocal]   = useState("");

  const shownError = error || local;
  function goto(m) { setLocal(""); clearError?.(); setCode(""); setUser(""); setTeam(""); setMode(m); }

  function submit() {
    setLocal("");
    if (mode === "create") {
      if (!user.trim()) return setLocal("Please enter a username.");
      onCreate({ username: user.trim(), teamName: team.trim() });
    } else if (mode === "join") {
      if (!code.trim()) return setLocal("Please enter a league code.");
      if (!user.trim()) return setLocal("Please enter a username.");
      onJoin({ code: code.trim().toUpperCase(), username: user.trim(), teamName: team.trim() });
    } else {
      if (!user.trim()) return setLocal("Please enter your username.");
      onLogin({ code: savedCode, username: user.trim() });
    }
  }

  const CFG = {
    create: { emoji:"🚀", title:"Create a League", color:"#22c55e",
      sub:"Username is private · Team name shows on leaderboard", cta:"Create League & Get Code" },
    join:   { emoji:"🔗", title:"Join a League",   color:PURPLE,
      sub:"Username is private · Team name shows on leaderboard", cta:"Join League" },
    login:  { emoji:"👤", title:"Log In",          color:"#60a5fa",
      sub:"Enter the username you used to join.", cta:"Log In" },
  };

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:FONT,
      display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"2rem 1rem" }}>
      <div style={{ width:"100%", maxWidth:440 }}>

        {/* Hero */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <img src="/logo.svg" alt="EPL" style={{ width:72, height:72, objectFit:"contain", margin:"0 auto 0.75rem", display:"block" }} />
          <div style={{ fontSize:"0.65rem", letterSpacing:"3px", color:PURPLE, fontWeight:"bold", marginBottom:6 }}>
            PREMIER LEAGUE PICK'EM
          </div>
          <div style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"0.5px", lineHeight:1.1 }}>
            2026/27 SEASON
          </div>
          <div style={{ fontSize:"0.75rem", color:"#555", marginTop:8 }}>
            380 matches · 20 teams · Aug 2026 – May 2027
          </div>
          <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginTop:10 }}>
            {["Home Win","Draw","Away Win"].map(l => (
              <span key={l} style={{ fontSize:"0.65rem", background:"rgba(124,58,237,0.15)",
                border:"1px solid rgba(124,58,237,0.35)", borderRadius:20,
                padding:"2px 10px", color:PURPLE }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {mode === "home" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => goto("create")} style={{
              padding:"0.95rem", borderRadius:10, border:"none",
              background:"#22c55e", color:"#000", fontWeight:"bold",
              fontSize:"1rem", cursor:"pointer", fontFamily:FONT,
            }}>🚀 Create a League</button>
            <div style={{ textAlign:"center", fontSize:"0.73rem", color:"#444" }}>Have a code from a friend?</div>
            <button onClick={() => goto("join")} style={{
              padding:"0.95rem", borderRadius:10, border:"none",
              background:PURPLE, color:"#fff", fontWeight:"bold",
              fontSize:"1rem", cursor:"pointer", fontFamily:FONT,
            }}>🔗 Join a League</button>
            <div style={{ textAlign:"center", fontSize:"0.73rem", color:"#444" }}>Already joined?</div>
            <button onClick={() => goto("login")} style={{
              padding:"0.95rem", borderRadius:10,
              border:"1px solid rgba(255,255,255,0.12)", background:"transparent",
              color:"#60a5fa", fontWeight:"bold", fontSize:"1rem",
              cursor:"pointer", fontFamily:FONT,
            }}>👤 Log In</button>
          </div>
        )}

        {mode !== "home" && (() => {
          const cfg = CFG[mode];
          return (
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:12, padding:"1.4rem" }}>
              <div style={{ fontSize:"1rem", fontWeight:"bold", color:cfg.color, marginBottom:3 }}>
                {cfg.emoji} {cfg.title}
              </div>
              <div style={{ fontSize:"0.7rem", color:"#555", marginBottom:4 }}>{cfg.sub}</div>
              <div onClick={() => goto("home")} style={{ fontSize:"0.75rem", color:"#444",
                cursor:"pointer", marginBottom:"0.5rem" }}>← Back</div>

              {mode === "join" && (
                <>
                  <label style={labelStyle}>LEAGUE CODE</label>
                  <input style={{ ...inputStyle, letterSpacing:3, textTransform:"uppercase" }}
                    placeholder="e.g. ABC123" maxLength={6} value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" />
                </>
              )}

              {mode === "login" && savedCode && (
                <div style={{ background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.2)",
                  borderRadius:8, padding:"0.55rem 0.85rem", marginTop:"0.85rem",
                  display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.65rem", color:"#555" }}>League</span>
                  <span style={{ fontSize:"1rem", fontWeight:"bold", letterSpacing:3, color:"#60a5fa" }}>{savedCode}</span>
                  <span style={{ fontSize:"0.6rem", color:"#333" }}>saved</span>
                </div>
              )}

              <label style={labelStyle}>USERNAME (PRIVATE)</label>
              <input style={inputStyle} placeholder="e.g. natty99" value={user}
                onChange={e => setUser(e.target.value)} autoComplete="off" />

              {mode !== "login" && (
                <>
                  <label style={labelStyle}>TEAM NAME (PUBLIC)</label>
                  <input style={inputStyle} placeholder="e.g. The Gooners" value={team}
                    onChange={e => setTeam(e.target.value)} autoComplete="off" />
                </>
              )}

              {shownError && <div style={{ color:"#f87171", fontSize:"0.78rem", marginTop:"0.75rem" }}>{shownError}</div>}

              <button onClick={submit} disabled={busy} style={{
                width:"100%", padding:"0.85rem", borderRadius:10, border:"none",
                background: busy ? "#333" : cfg.color, color: mode==="create" ? "#000" : "#fff",
                fontWeight:"bold", fontSize:"0.95rem",
                cursor: busy ? "not-allowed" : "pointer", marginTop:"1.2rem", fontFamily:FONT,
              }}>
                {busy ? "Please wait…" : cfg.cta}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
