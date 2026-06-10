import { useState } from "react";

export default function LeagueEntry({ onJoin }) {
  const [mode, setMode] = useState("join");
  const [username, setUsername] = useState("");
  const [leagueCode, setLeagueCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function generateCode() {
    return Array.from({ length: 6 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
  }

  async function handleSubmit() {
    setError("");
    if (!username.trim()) return setError("Please enter a username");
    const code = mode === "create" ? generateCode() : leagueCode.trim().toUpperCase();
    if (mode === "join" && !code) return setError("Please enter a league code");
    setLoading(true);
    try { await onJoin({ code, user: username.trim(), isNew: mode === "create" }); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const inputStyle = {
    width: "100%", padding: "0.75rem", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)", color: "white",
    fontSize: "1rem", boxSizing: "border-box", outline: "none"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d1b2a 0%, #1a3a4a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: 16, padding: "2.5rem",
        width: "100%", maxWidth: 420, color: "white"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem" }}>⚽</div>
          <h1 style={{ color: "#FFD700", margin: "0.5rem 0", fontSize: "1.5rem" }}>
            WC2026 Pick'em
          </h1>
          <p style={{ color: "#aaa", margin: 0, fontSize: "0.9rem" }}>
            Predict all 104 World Cup matches
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
          {["join", "create"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "0.6rem", borderRadius: 8, border: "none",
              cursor: "pointer",
              background: mode === m ? "#FFD700" : "rgba(255,255,255,0.1)",
              color: mode === m ? "#000" : "#fff",
              fontWeight: mode === m ? "bold" : "normal", fontSize: "0.9rem"
            }}>
              {m === "join" ? "Join League" : "Create League"}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", color: "#ccc" }}>
            Your Name
          </label>
          <input
            type="text" placeholder="e.g. Natnael"
            value={username} onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
        </div>

        {mode === "join" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", color: "#ccc" }}>
              League Code
            </label>
            <input
              type="text" placeholder="e.g. ABC123"
              value={leagueCode}
              onChange={(e) => setLeagueCode(e.target.value.toUpperCase())}
              style={{ ...inputStyle, letterSpacing: "0.2em" }}
            />
          </div>
        )}

        {mode === "create" && (
          <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: "1rem" }}>
            A unique code will be generated for you to share with friends.
          </p>
        )}

        {error && <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "0.85rem", borderRadius: 8, border: "none",
          background: loading ? "#666" : "#FFD700", color: "#000",
          fontWeight: "bold", fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Loading..." : mode === "create" ? "Create My League" : "Join League"}
        </button>
      </div>
    </div>
  );
}