// src/App.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  createLeague, joinLeague, leagueExists, getMember,
  savePicks, subscribeToLeague,
} from "./firebase";
import { FIXTURES, ROUND_META, MAX_POSSIBLE } from "./data/fixtures";
import { buildResults, calcMemberScore, tournamentStatus } from "./utils/scoring";

import LeagueEntry  from "./components/LeagueEntry";
import FixturesTab  from "./components/FixturesTab";
import PicksTab     from "./components/PicksTab";
import StandingsTab from "./components/StandingsTab";

const SESSION_KEY = "wc2026_session";
const CODE_CHARS  = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids confusion

function genCode() {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

export default function App() {
  // phase: "loading" | "entry" | "app"
  const [phase, setPhase]       = useState("loading");
  const [leagueCode, setLeagueCode] = useState("");
  const [username, setUsername]     = useState("");
  const [teamName, setTeamName]     = useState("");
  const [picks, setPicks]           = useState({});
  const [members, setMembers]       = useState({});
  const [results, setResults]       = useState({});
  const [activeTab, setActiveTab]   = useState("fixtures");
  const [entryError, setEntryError] = useState("");
  const [entryBusy, setEntryBusy]   = useState(false);

  // ── Restore session from localStorage on first load ────────────────
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) { setPhase("entry"); return; }
    (async () => {
      try {
        const { leagueCode: c, username: u } = JSON.parse(raw);
        const m = await getMember(c, u);
        if (m) {
          setLeagueCode(c);
          setUsername(u);
          setTeamName(m.teamName || u);
          setPicks(m.picks || {});
          setPhase("app");
        } else {
          localStorage.removeItem(SESSION_KEY);
          setPhase("entry");
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setPhase("entry");
      }
    })();
  }, []);

  function persist(code, user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ leagueCode: code, username: user }));
  }

  // ── Create / Join / Login handlers (passed to LeagueEntry) ─────────
  const handleCreate = useCallback(async ({ username: u, teamName: t }) => {
    setEntryBusy(true); setEntryError("");
    try {
      let code, result;
      for (let i = 0; i < 5; i++) {
        code = genCode();
        result = await createLeague(code, u.trim(), (t || u).trim());
        if (!result.error) break;
      }
      if (result.error) { setEntryError(result.error); return; }
      persist(code, u.trim());
      setLeagueCode(code); setUsername(u.trim()); setTeamName((t || u).trim()); setPicks({});
      setPhase("app");
      // Surface the code to the creator immediately
      setTimeout(() => {
        alert("League created! \n\nYour invite code is: " + code + "\n\nShare it with friends so they can join. You can find it again anytime in the Standings tab.");
      }, 200);
    } finally {
      setEntryBusy(false);
    }
  }, []);

  const handleJoin = useCallback(async ({ code, username: u, teamName: t }) => {
    setEntryBusy(true); setEntryError("");
    try {
      const c = code.trim().toUpperCase();
      if (!(await leagueExists(c))) { setEntryError("League not found. Check the code and try again."); return; }
      const result = await joinLeague(c, u.trim(), (t || u).trim());
      if (result.error) { setEntryError(result.error); return; }
      persist(c, u.trim());
      setLeagueCode(c); setUsername(u.trim()); setTeamName((t || u).trim()); setPicks({});
      setPhase("app");
    } finally {
      setEntryBusy(false);
    }
  }, []);

  const handleLogin = useCallback(async ({ code, username: u }) => {
    setEntryBusy(true); setEntryError("");
    try {
      const c = code.trim().toUpperCase();
      if (!(await leagueExists(c))) { setEntryError("League not found. Check the code and try again."); return; }
      const m = await getMember(c, u.trim());
      if (!m) { setEntryError("No player found with that username in this league."); return; }
      persist(c, u.trim());
      setLeagueCode(c); setUsername(u.trim()); setTeamName(m.teamName || u.trim()); setPicks(m.picks || {});
      setPhase("app");
    } finally {
      setEntryBusy(false);
    }
  }, []);

  function handleLogout() {
    if (!window.confirm("Log out of this league? You can log back in anytime with your username.")) return;
    localStorage.removeItem(SESSION_KEY);
    setPhase("entry");
    setLeagueCode(""); setUsername(""); setTeamName(""); setPicks({});
    setMembers({}); setResults({}); setActiveTab("fixtures"); setEntryError("");
  }

  // ── Real-time member list (for leaderboard / all-picks) ─────────────
  useEffect(() => {
    if (phase !== "app" || !leagueCode) return;
    return subscribeToLeague(leagueCode, setMembers);
  }, [phase, leagueCode]);

  // ── Save a pick (optimistic local update + Firestore write) ────────
  async function handlePick(matchId, prediction) {
    const updated = { ...picks, [matchId]: prediction };
    setPicks(updated);
    try { await savePicks(leagueCode, username, updated, teamName); }
    catch (e) { console.warn("Save failed:", e); }
  }

  // ── Live scores via /api/scores (Vercel proxy -> ESPN) ───────────────
  const refreshScores = useCallback(async () => {
    try {
      const res = await fetch("/api/scores");
      if (!res.ok) return;
      const data = await res.json();
      setResults(buildResults(data.events || [], FIXTURES));
    } catch { /* silent - keep last known results */ }
  }, []);

  useEffect(() => {
    if (phase !== "app") return;
    refreshScores();
    const t = setInterval(refreshScores, 30_000);
    return () => clearInterval(t);
  }, [phase, refreshScores]);

  // ── Merge "my" live picks into the members map (so I see my own
  //    updates instantly even before Firestore round-trips back) ─────
  const mergedMembers = useMemo(() => ({
    ...members,
    [username]: { ...(members[username] || {}), picks, teamName },
  }), [members, username, picks, teamName]);

  const myScore = useMemo(
    () => calcMemberScore(picks, FIXTURES, results, ROUND_META),
    [picks, results]
  );

  const status = useMemo(
    () => tournamentStatus(results, FIXTURES.length),
    [results]
  );

  // ── Entry screens (loading / home / create / join / login) ──────────
  if (phase === "loading") {
    return (
      <div style={{
        minHeight:"100vh", background:"#0a1628", color:"#C9A84C",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Segoe UI', system-ui, Arial, sans-serif", fontSize:"1.1rem"
      }}>
        ⚽ Loading…
      </div>
    );
  }

  if (phase === "entry") {
    return (
      <LeagueEntry
        onCreate={handleCreate}
        onJoin={handleJoin}
        onLogin={handleLogin}
        busy={entryBusy}
        error={entryError}
        clearError={() => setEntryError("")}
      />
    );
  }

  // ── Main app (logged in) ─────────────────────────────────────────────
  const TABS = [
    { id: "fixtures",  label: "Fixtures",  icon: "📅" },
    { id: "picks",     label: "All Picks", icon: "👥" },
    { id: "standings", label: "Standings", icon: "🏆" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a1628",
      color: "white",
      fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      maxWidth: 520,
      margin: "0 auto",
      position: "relative",
    }}>

      {/* Compact header */}
      <header style={{
        background: "linear-gradient(135deg,#0a1628 0%,#152035 100%)",
        borderBottom: "2px solid #C9A84C",
        padding: "0.6rem 1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:"radial-gradient(circle at 35% 30%, #FFE08A, #C9A84C 60%, #8a6d22 100%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.1rem", flexShrink:0
          }}>🏆</div>
          <div>
            <div style={{ fontSize:"0.85rem", fontWeight:"bold", color:"#C9A84C", letterSpacing:"0.5px" }}>
              WC 2026 · {leagueCode}
            </div>
            <div style={{ fontSize:"0.7rem", color:"#999" }}>
              {teamName}{Object.keys(mergedMembers).length === 1 ? " (SOLO)" : " · " + Object.keys(mergedMembers).length + " players"}
            </div>
          </div>
        </div>

        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"0.95rem", fontWeight:"bold" }}>
            {myScore.score}<span style={{ color:"#666", fontSize:"0.75rem" }}>/{MAX_POSSIBLE}</span>
          </div>
          <div style={{ fontSize:"0.62rem", color:"#777", marginTop:1, textTransform:"capitalize" }}>
            {status.label}
          </div>
          <button onClick={handleLogout} style={{
            border:"none", background:"none", color:"#666",
            fontSize:"0.68rem", cursor:"pointer", padding:0, marginTop:2,
            textDecoration:"underline"
          }}>
            Log out
          </button>
        </div>
      </header>

      {/* Tab content */}
      <main style={{ flex:1, overflowY:"auto", paddingBottom:"72px" }}>
        {activeTab === "fixtures" && (
          <FixturesTab
            fixtures={FIXTURES}
            picks={picks}
            results={results}
            onPick={handlePick}
          />
        )}
        {activeTab === "picks" && (
          <PicksTab
            fixtures={FIXTURES}
            members={mergedMembers}
            username={username}
            results={results}
          />
        )}
        {activeTab === "standings" && (
          <StandingsTab
            fixtures={FIXTURES}
            members={mergedMembers}
            username={username}
            results={results}
            status={status}
            leagueCode={leagueCode}
            onRefresh={refreshScores}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:520,
        background:"#0d1e35",
        borderTop:"1px solid rgba(201,168,76,0.25)",
        display:"flex", zIndex:20,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex:1, padding:"0.7rem 0.25rem 0.45rem",
              border:"none", background:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              color: activeTab === tab.id ? "#C9A84C" : "#555",
              borderTop: activeTab === tab.id ? "2px solid #C9A84C" : "2px solid transparent",
            }}
          >
            <span style={{ fontSize:"1.4rem" }}>{tab.icon}</span>
            <span style={{ fontSize:"0.68rem", fontWeight: activeTab === tab.id ? "bold" : "normal" }}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
