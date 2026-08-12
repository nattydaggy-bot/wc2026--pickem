import { useState } from "react";
const GREEN = "#00ff85";
const PURPLE = "#37003c";
const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.85rem",
  borderRadius: 8,
  border: "1px solid rgba(0,255,133,0.2)",
  background: "rgba(0,255,133,0.05)",
  color: "#fff",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  outline: "none",
};
const label = {
  display: "block",
  fontSize: "0.62rem",
  letterSpacing: "1.5px",
  color: "rgba(255,255,255,0.35)",
  marginBottom: 5,
  marginTop: "0.9rem",
  fontWeight: "bold",
};

export default function LeagueEntry({ onCreate, onJoin, onLogin, busy, error, clearError, savedCode }) {
  const [mode, setMode] = useState("home");
  const [code, setCode] = useState("");
  const [user, setUser] = useState("");
  const [team, setTeam] = useState("");
  const [local, setLocal] = useState("");
  const shown = error || local;

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
      if (!savedCode && !code.trim()) return setLocal("Please enter a league code.");
      if (!user.trim()) return setLocal("Please enter your username.");
      onLogin({ code: (savedCode || code.trim().toUpperCase()), username: user.trim() });
    }
  }

  const CFG = {
    create: { emoji: "🚀", title: "Create a League", color: GREEN, textColor: "#000", sub: "Username private · Team name on leaderboard", cta: "Create League & Get Code" },
    join: { emoji: "🔗", title: "Join a League", color: "#00ff85", textColor: "#fff", sub: "Username private · Team name on leaderboard", cta: "Join League" },
    login: { emoji: "👤", title: "Log In", color: "#00ff85", textColor: "#fff", sub: "Enter the username you used to join.", cta: "Log In" },
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top,#2a0038 0%,#0d0014 65%)`, color: "#fff", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <div style={{ background: PURPLE, borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1rem", border: `2px solid ${GREEN}33` }}>
            <img src="/logo.svg" alt="Premier League" style={{ width: 240, height: "auto", display: "block", margin: "0 auto 1.25rem", filter: "brightness(0) invert(1)" }} />
            <div style={{ fontSize: "0.65rem", letterSpacing: "3px", color: GREEN, fontWeight: "bold", marginBottom: 4 }}>PICK'EM</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "0.5px" }}>2026/27 SEASON</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 6 }}>380 matches · 20 teams · Aug 2026 – May 2027</div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {["Home Win", "Draw", "Away Win"].map(l => (
              <span key={l} style={{ fontSize: "0.65rem", background: "rgba(0,255,133,0.08)", border: `1px solid ${GREEN}33`, borderRadius: 20, padding: "2px 10px", color: GREEN }}>{l}</span>
            ))}
          </div>
        </div>

        {mode === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => goto("create")} style={{ padding: "0.95rem", borderRadius: 10, border: "none", background: GREEN, color: "#000", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>🚀 Create a League</button>
            <div style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>Have a code from a friend?</div>
            <button onClick={() => goto("join")} style={{ padding: "0.95rem", borderRadius: 10, border: `1px solid ${GREEN}55`, background: "rgba(0,255,133,0.06)", color: GREEN, fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>🔗 Join a League</button>
            <div style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>Already joined?</div>
            <button onClick={() => goto("login")} style={{ padding: "0.95rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.6)", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>👤 Log In</button>
          </div>
        )}

        {mode !== "home" && (() => {
          const cfg = CFG[mode];
          return (
            <div style={{ background: "rgba(0,255,133,0.04)", border: `1px solid ${GREEN}22`, borderRadius: 12, padding: "1.4rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: "bold", color: cfg.color, marginBottom: 3 }}>{cfg.emoji} {cfg.title}</div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{cfg.sub}</div>
              <div onClick={() => goto("home")} style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", cursor: "pointer", marginBottom: "0.5rem" }}>← Back</div>

              {mode === "join" && (
                <>
                  <label style={label}>LEAGUE CODE</label>
                  <input style={{ ...inputStyle, letterSpacing: 3, textTransform: "uppercase" }} placeholder="e.g. ABC123" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" />
                </>
              )}

              {mode === "login" && (savedCode ? (
                <div style={{ background: "rgba(0,255,133,0.06)", border: `1px solid ${GREEN}33`, borderRadius: 8, padding: "0.55rem 0.85rem", marginTop: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)" }}>Saved league</span>
                  <span style={{ fontSize: "1rem", fontWeight: "bold", letterSpacing: 3, color: GREEN }}>{savedCode}</span>
                  <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)" }}>auto</span>
                </div>
              ) : (
                <>
                  <label style={label}>LEAGUE CODE</label>
                  <input style={{ ...inputStyle, letterSpacing: 3, textTransform: "uppercase" }} placeholder="e.g. ABC123" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" />
                </>
              ))}

              <label style={label}>USERNAME (PRIVATE)</label>
              <input style={inputStyle} placeholder="e.g. natty99" value={user} onChange={e => setUser(e.target.value)} autoComplete="off" />

              {mode !== "login" && (
                <>
                  <label style={label}>TEAM NAME (PUBLIC)</label>
                  <input style={inputStyle} placeholder="e.g. The Gooners" value={team} onChange={e => setTeam(e.target.value)} autoComplete="off" />
                </>
              )}

              {shown && <div style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "0.75rem" }}>{shown}</div>}

              <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "0.85rem", borderRadius: 10, border: "none", background: busy ? "#333" : cfg.color, color: cfg.textColor, fontWeight: "bold", fontSize: "0.95rem", cursor: busy ? "not-allowed" : "pointer", marginTop: "1.2rem" }}>{busy ? "Please wait…" : cfg.cta}</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}