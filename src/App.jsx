import { useState, useEffect } from "react";
import {
  createLeague,
  leagueExists,
  savePicks,
  getPicks,
  subscribeToLeague,
} from "./firebase";
import LeagueEntry from "./components/LeagueEntry";
import PicksGrid from "./components/PicksGrid";
import Leaderboard from "./components/Leaderboard";
import { FIXTURES } from "./data/fixtures";

export default function App() {
  const [view, setView] = useState("entry");       // "entry" | "picks" | "leaderboard"
  const [leagueCode, setLeagueCode] = useState(""); // active league
  const [username, setUsername] = useState("");      // current user
  const [picks, setPicks] = useState({});            // my picks
  const [allMembers, setAllMembers] = useState({});  // everyone's data (real-time)
  const [liveScores, setLiveScores] = useState({});  // ESPN data

  // ── Join or create league ──────────────────────────────────────────
  async function handleJoinLeague({ code, user, isNew }) {
    if (isNew) {
      const result = await createLeague(code, user);
      if (result.error) return alert(result.error);
    } else {
      const exists = await leagueExists(code);
      if (!exists) return alert("League not found. Check the code.");
    }
    const existingPicks = await getPicks(code, user);
    setLeagueCode(code);
    setUsername(user);
    setPicks(existingPicks || {});
    setView("picks");
  }

  // ── Subscribe to real-time leaderboard ────────────────────────────
  useEffect(() => {
    if (!leagueCode) return;
    const unsubscribe = subscribeToLeague(leagueCode, setAllMembers);
    return () => unsubscribe();
  }, [leagueCode]);

  // ── Save a pick ───────────────────────────────────────────────────
  async function handlePick(matchId, prediction) {
    const updated = { ...picks, [matchId]: prediction };
    setPicks(updated);
    await savePicks(leagueCode, username, updated);
  }

  // ── Fetch ESPN scores every 60 seconds ───────────────────────────
  useEffect(() => {
    if (view === "entry") return;
    async function fetchScores() {
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        // Parse ESPN events into { matchId: { home, away, status } }
        const scoreMap = {};
        (data.events || []).forEach((ev) => {
          const comp = ev.competitions?.[0];
          if (!comp) return;
          const home = comp.competitors?.find((c) => c.homeAway === "home");
          const away = comp.competitors?.find((c) => c.homeAway === "away");
          scoreMap[ev.id] = {
            homeScore: home?.score,
            awayScore: away?.score,
            status: comp.status?.type?.shortDetail,
          };
        });
        setLiveScores(scoreMap);
      } catch (e) {
        console.warn("Score fetch failed:", e);
      }
    }
    fetchScores();
    const interval = setInterval(fetchScores, 60_000);
    return () => clearInterval(interval);
  }, [view]);

  // ── Render ─────────────────────────────────────────────────────────
  if (view === "entry") {
    return <LeagueEntry onJoin={handleJoinLeague} />;
  }

  return (
    <div className="app">
      <header>
        <h1>⚽ WC2026 Pick'em</h1>
        <span>League: <strong>{leagueCode}</strong> · {username}</span>
        <nav>
          <button onClick={() => setView("picks")}    className={view === "picks"       ? "active" : ""}>My Picks</button>
          <button onClick={() => setView("leaderboard")} className={view === "leaderboard" ? "active" : ""}>Leaderboard</button>
        </nav>
      </header>

      {view === "picks" && (
        <PicksGrid
          fixtures={FIXTURES}
          picks={picks}
          liveScores={liveScores}
          onPick={handlePick}
        />
      )}

      {view === "leaderboard" && (
        <Leaderboard
          members={allMembers}
          fixtures={FIXTURES}
          liveScores={liveScores}
        />
      )}
    </div>
  );
}