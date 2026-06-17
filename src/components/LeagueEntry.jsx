// src/components/LeagueEntry.jsx
// Landing / auth screen styled after the original PICK'EM artifact.
// Pure presentational + form-state component: all Firebase calls and
// localStorage persistence live in App.jsx. This component just calls
// onCreate / onJoin / onLogin with the entered values.
import { useState } from "react";
import { ROUND_META, ROUND_ORDER, FIXTURES, GROUPS } from "../data/fixtures";

const GOLD = "#C9A84C";
const BG   = "linear-gradient(135deg,#0a1628 0%,#0d1f35 100%)";
const FONT = "'Times New Roman', Times, serif";
export const LAST_CODE_KEY = "wc2026_last_code"; // remembered across logout

const inputStyle = {
  width:"100%", padding:"0.75rem 0.9rem", borderRadius:8,
  border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(255,255,255,0.04)", color:"#fff",
  fontSize:"0.95rem", boxSizing:"border-box", outline:"none",
  marginBottom:"0.2rem", fontFamily:FONT,
};
const labelStyle = {
  display:"block", fontSize:"0.68rem", letterSpacing:"1px",
  color:"#999", marginBottom:6, marginTop:"1rem", fontWeight:"bold",
};

const TEAM_COUNT = Object.values(GROUPS).reduce((s,g) => s + g.length, 0);

// -- Shared layout wrapper (TOP-LEVEL so it's not re-created every render —
//    a Shell defined inside LeagueEntry would remount on each keystroke and
//    steal focus from the inputs, forcing "one letter at a time" typing) ---
function Shell({ children }) {
  return (
    <div style={{
      minHeight:"100vh", background:BG, color:"#fff",
      fontFamily:FONT,
      display:"flex", justifyContent:"center",
      padding:"2rem 1rem",
    }}>
      <div style={{ width:"100%", maxWidth:440 }}>

        {/* Hero header */}
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <div style={{
            width:64, height:64, borderRadius:"50%",
            background:"radial-gradient(circle,#1d2c44,#0a1628)",
            border:`2px solid ${GOLD}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.8rem", margin:"0 auto 0.6rem"
          }}>{"\uD83C\uDFC6"}</div>
          <div style={{
            fontSize:"0.68rem", letterSpacing:"2px", color:GOLD,
            fontWeight:"bold", marginBottom:4
          }}>WE ARE 26 · FIFA WORLD CUP 2026</div>
          <div style={{ fontSize:"1.9rem", fontWeight:900, letterSpacing:"1px" }}>
            PICK'EM
          </div>
          <div style={{ fontSize:"0.74rem", color:"#888", marginTop:4 }}>
            {FIXTURES.length} matches · {TEAM_COUNT} teams · June 11 – July 19 · USA / CAN / MEX
          </div>
          <div style={{
            display:"flex", flexWrap:"wrap", gap:5, justifyContent:"center",
            marginTop:"0.75rem"
          }}>
            {ROUND_ORDER.map(r => (
              <span key={r} style={{
                fontSize:"0.62rem", fontWeight:"bold", color:"#fff",
                background:ROUND_META[r].color, opacity:0.85,
                padding:"3px 8px", borderRadius:5
              }}>{ROUND_META[r].short} {ROUND_META[r].points}pts</span>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function LeagueEntry({ onCreate, onJoin, onLogin, busy, error, clearError }) {
  const [mode, setMode] = useState("home"); // home | create | join | login
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [teamName, setTeamName] = useState("");
  const [localError, setLocalError] = useState("");

  const shownError = error || localError;

  function goto(m) {
    setLocalError("");
    clearError?.();
    setUsername(""); setTeamName("");
    // Pre-fill the league code on Join/Login from the last one used,
    // so returning players usually don't have to type it again.
    if (m === "join" || m === "login") {
      setCode(localStorage.getItem(LAST_CODE_KEY) || "");
    } else {
      setCode("");
    }
    setMode(m);
  }

  function handleCreate() {
    setLocalError("");
    if (!username.trim()) return setLocalError("Please enter a username.");
    onCreate?.({ username: username.trim(), teamName: teamName.trim() });
  }

  function handleJoin() {
    setLocalError("");
    if (!code.trim())     return setLocalError("Please enter a league code.");
    if (!username.trim()) return setLocalError("Please enter a username.");
    onJoin?.({ code: code.trim().toUpperCase(), username: username.trim(), teamName: teamName.trim() });
  }

  function handleLogin() {
    setLocalError("");
    // Code is read from localStorage – user never has to type it on login
    const loginCode = (localStorage.getItem(LAST_CODE_KEY) || code).trim().toUpperCase();
    if (!loginCode)       return setLocalError("No saved league found. Please use 'Join a League' first.");
    if (!username.trim()) return setLocalError("Please enter your username.");
    onLogin?.({ code: loginCode, username: username.trim() });
  }

  // -- HOME ----------------------------------------------------------------
  if (mode === "home") {
    return (
      <Shell>
        <div style={{
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:10, padding:"0.7rem 1rem", textAlign:"center",
          fontSize:"0.78rem", color:"#bbb", marginBottom:"1.25rem"
        }}>
          🌍 {FIXTURES.length} matches · Group Stage picks open now · {FIXTURES.length} fixtures
        </div>

        <button onClick={() => goto("create")} style={{
          width:"100%", padding:"0.95rem", borderRadius:10, border:"none",
          background:"#2e9e4f", color:"#fff", fontWeight:"bold", fontSize:"1rem",
          cursor:"pointer", marginBottom:"0.85rem", fontFamily:FONT,
        }}>🚀 Create a League</button>

        <div style={{ textAlign:"center", fontSize:"0.75rem", color:"#777", marginBottom:"0.6rem" }}>
          Have a code from a friend?
        </div>
        <button onClick={() => goto("join")} style={{
          width:"100%", padding:"0.95rem", borderRadius:10, border:"none",
          background:"#3b4ec9", color:"#fff", fontWeight:"bold", fontSize:"1rem",
          cursor:"pointer", marginBottom:"0.85rem", fontFamily:FONT,
        }}>🔗 Join a League</button>

        <div style={{ textAlign:"center", fontSize:"0.75rem", color:"#777", marginBottom:"0.6rem" }}>
          Already joined?
        </div>
        <button onClick={() => goto("login")} style={{
          width:"100%", padding:"0.95rem", borderRadius:10,
          border:"1px solid rgba(255,255,255,0.18)",
          background:"transparent", color:"#cbb9ff", fontWeight:"bold", fontSize:"1rem",
          cursor:"pointer", fontFamily:FONT,
        }}>👤 Log In</button>
      </Shell>
    );
  }

  // -- CREATE / JOIN / LOGIN forms -----------------------------------------
  const cfg = {
    create: { title:"🚀 Create a League", color:"#2e9e4f",
      sub:"Username is private · Team name shows on the leaderboard.",
      action: handleCreate, cta:"Create League & Get Code" },
    join:   { title:"🔗 Join a League", color:"#3b4ec9",
      sub:"Username is private · Team name shows on the leaderboard.",
      action: handleJoin, cta:"Join League" },
    login:  { title:"👤 Log In", color:"#7b5cff",
      sub:"Enter the username you used before.",
      action: handleLogin, cta:"Log In" },
  }[mode];

  return (
    <Shell>
      <div style={{
        background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:12, padding:"1.4rem"
      }}>
        <div style={{ fontSize:"1.05rem", fontWeight:"bold", color:cfg.color, marginBottom:4 }}>
          {cfg.title}
        </div>
        <div style={{ fontSize:"0.73rem", color:"#888", marginBottom:"0.4rem" }}>{cfg.sub}</div>
        <div
          onClick={() => goto("home")}
          style={{ fontSize:"0.78rem", color:"#777", cursor:"pointer", marginBottom:"0.5rem" }}
        >← Back</div>

        {/* LEAGUE CODE — shown for Join, hidden for Login (auto-read from localStorage) */}
        {mode === "join" && (
          <>
            <label style={labelStyle}>LEAGUE CODE</label>
            <input style={{ ...inputStyle, letterSpacing:"3px", textTransform:"uppercase" }}
              placeholder="e.g. ABC123" value={code}
              onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6}
              autoComplete="off" />
          </>
        )}

        {/* Login: show the stored league code as a read-only badge */}
        {mode === "login" && (() => {
          const stored = localStorage.getItem(LAST_CODE_KEY) || code;
          return stored ? (
            <div style={{
              background:"rgba(79,195,247,0.08)", border:"1px solid rgba(79,195,247,0.25)",
              borderRadius:8, padding:"0.6rem 0.9rem", marginTop:"1rem",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <span style={{ fontSize:"0.7rem", color:"#888" }}>League</span>
              <span style={{ fontSize:"1.1rem", fontWeight:"bold", letterSpacing:"3px", color:"#4fc3f7" }}>
                {stored.toUpperCase()}
              </span>
              <span style={{ fontSize:"0.65rem", color:"#555" }}>auto</span>
            </div>
          ) : (
            <div style={{ color:"#f87171", fontSize:"0.78rem", marginTop:"1rem",
              background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)",
              borderRadius:8, padding:"0.6rem 0.9rem" }}>
              No saved league. Use <strong>Join a League</strong> first.
            </div>
          );
        })()}

        <label style={labelStyle}>USERNAME (PRIVATE)</label>
        <input style={inputStyle} placeholder="e.g. godfrey99" value={username}
          onChange={e => setUsername(e.target.value)} autoComplete="off" />

        {mode !== "login" && (
          <>
            <label style={labelStyle}>TEAM NAME (PUBLIC)</label>
            <input style={inputStyle} placeholder="e.g. The Lionhearts" value={teamName}
              onChange={e => setTeamName(e.target.value)} autoComplete="off" />
          </>
        )}

        {shownError && (
          <div style={{ color:"#ff6b6b", fontSize:"0.8rem", marginTop:"0.8rem" }}>{shownError}</div>
        )}

        <button onClick={cfg.action} disabled={busy} style={{
          width:"100%", padding:"0.85rem", borderRadius:10, border:"none",
          background: busy ? "#555" : cfg.color, color:"#fff",
          fontWeight:"bold", fontSize:"0.95rem", fontFamily:FONT,
          cursor: busy ? "not-allowed" : "pointer", marginTop:"1.2rem"
        }}>
          {busy ? "Please wait…" : cfg.cta}
        </button>
      </div>
    </Shell>
  );
}
