import { useState, useMemo, useRef } from "react";
import { calcMemberScoreWithBanker } from "../utils/scoring";

const FONT = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";
const GOLD = "#FFD700";

export default function GWSummary({ fixtures, members, results, banker = {}, onClose }) {
  const [selectedGw, setSelectedGw] = useState(null);
  const summaryRef = useRef(null);

  const allGws = useMemo(() => {
    const gws = new Set();
    fixtures.forEach(f => { if (f.gw) gws.add(f.gw); });
    return Array.from(gws).sort((a, b) => a - b);
  }, [fixtures]);

  const activeGw = useMemo(() => {
    const now = new Date();
    let latest = fixtures[fixtures.length - 1]?.gw || 1;
    for (const f of fixtures) {
      if (f.utcDate) {
        const matchDate = new Date(f.utcDate);
        if (matchDate <= now) latest = f.gw;
      }
    }
    return latest || 1;
  }, [fixtures]);

  const gw = selectedGw || activeGw;

  const gwResults = useMemo(() => {
    const gwFixtures = fixtures.filter(f => f.gw === gw);
    const gwMembers = {};
    const results_by_match = {};
    gwFixtures.forEach(f => {
      const r = results[f.id];
      if (r?.completed) results_by_match[f.id] = r;
    });
    Object.entries(members).forEach(([uname, data]) => {
      const { byGw } = calcMemberScoreWithBanker(data?.picks || {}, data?.banker || {}, fixtures.filter(f => f.gw === gw), results);
      const gwScore = byGw[gw]?.pts || 0;
      const correct = byGw[gw]?.correct || 0;
      const total = byGw[gw]?.total || 0;
      if (total > 0) {
        gwMembers[uname] = { teamName: data?.teamName || uname, score: gwScore, correct, total };
      }
    });
    const sorted = Object.entries(gwMembers).sort((a, b) => b[1].score - a[1].score || b[1].correct - a[1].correct);
    const winner = sorted.length > 0 ? sorted[0] : null;
    return { winner, allScores: sorted, matchResults: results_by_match, totalMatches: gwFixtures.length, completedMatches: Object.keys(results_by_match).length, isComplete: gwFixtures.length > 0 && Object.keys(results_by_match).length === gwFixtures.length };
  }, [fixtures, members, results, gw]);

  const downloadSummary = () => {
    let text = `🏆 EPL Pick'em GW${gw} Summary\n${'═'.repeat(40)}\n\n`;
    if (gwResults.winner) {
      text += `🥇 Winner: ${gwResults.winner[1].teamName}\n   Score: ${gwResults.winner[1].score} pts\n   Correct: ${gwResults.winner[1].correct}/${gwResults.winner[1].total}\n\n`;
    }
    text += `📊 Full Standings:\n`;
    gwResults.allScores.slice(0, 10).forEach(([uname, data], i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;
      text += `${medal} ${data.teamName} - ${data.score} pts (${data.correct}/${data.total})\n`;
    });
    if (gwResults.allScores.length > 10) text += `\n... and ${gwResults.allScores.length - 10} more players\n`;
    text += `\n🔗 ${window.location.origin}`;
    navigator.clipboard?.writeText(text).then(() => alert("✅ Summary copied to clipboard!")).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("✅ Summary copied to clipboard!");
    });
  };

  if (Object.keys(gwResults.matchResults).length === 0) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: FONT }}>
        <div style={{ background: "#0f0014", border: `1px solid ${PURPLE}55`, borderRadius: 16, maxWidth: 500, width: "100%", padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>No completed matches yet</h3>
          <p style={{ color: "#555", fontSize: "0.85rem" }}>GW{gw} hasn't finished yet. Check back after the matches!</p>
          <button onClick={onClose} style={{ marginTop: "1.5rem", padding: "0.6rem 2rem", borderRadius: 8, border: `1px solid ${PURPLE}33`, background: "rgba(124,58,237,0.1)", color: "#fff", cursor: "pointer", fontFamily: FONT }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: FONT }}>
      <div ref={summaryRef} style={{ background: "#0f0014", border: `1px solid ${GOLD}55`, borderRadius: 16, maxWidth: 550, width: "100%", maxHeight: "90vh", overflow: "auto", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div><div style={{ fontSize: "0.6rem", color: GOLD, letterSpacing: "2px", fontWeight: "bold" }}>📊 GW{gw} SUMMARY</div><div style={{ fontSize: "0.7rem", color: "#555" }}>{gwResults.completedMatches}/{gwResults.totalMatches} matches completed{gwResults.isComplete && " ✅ Complete!"}</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <select value={gw} onChange={e => setSelectedGw(Number(e.target.value))} style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${PURPLE}33`, background: "#161b22", color: "#fff", fontSize: "0.8rem", fontFamily: FONT }}>
            {allGws.map(g => <option key={g} value={g}>GW {g}</option>)}
          </select>
        </div>
        {gwResults.winner && (
          <div style={{ background: "rgba(255,215,0,0.08)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "1rem", textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2.5rem" }}>🏆</div>
            <div style={{ fontSize: "0.6rem", color: GOLD, letterSpacing: "1px", marginTop: "0.25rem" }}>GAMEWEEK WINNER</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fff" }}>{gwResults.winner[1].teamName}</div>
            <div style={{ fontSize: "0.9rem", color: GOLD }}>{gwResults.winner[1].score} pts</div>
            <div style={{ fontSize: "0.65rem", color: "#555" }}>{gwResults.winner[1].correct}/{gwResults.winner[1].total} correct</div>
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#555", marginBottom: "0.5rem", fontWeight: "bold" }}>📋 MATCH RESULTS</div>
          {Object.entries(gwResults.matchResults).map(([fid, r]) => {
            const f = fixtures.find(f => f.id === fid);
            if (!f) return null;
            return <div key={fid} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem", color: "#aaa" }}><span>{f.homeShort} vs {f.awayShort}</span><span style={{ fontWeight: "bold", color: "#fff" }}>{r.homeScore}–{r.awayScore}</span></div>;
          })}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#555", marginBottom: "0.5rem", fontWeight: "bold" }}>👥 FULL STANDINGS</div>
          {gwResults.allScores.slice(0, 15).map(([uname, data], i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return <div key={uname} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.7rem", color: i < 3 ? "#fff" : "#aaa", background: i < 3 ? "rgba(255,215,0,0.04)" : "transparent" }}><span>{medal || `${i+1}.`} {data.teamName}</span><span style={{ fontWeight: i < 3 ? "bold" : "normal", color: i === 0 ? GOLD : "#aaa" }}>{data.score} pts ({data.correct}/{data.total})</span></div>;
          })}
          {gwResults.allScores.length > 15 && <div style={{ textAlign: "center", fontSize: "0.6rem", color: "#444", padding: "0.5rem" }}>+ {gwResults.allScores.length - 15} more players</div>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={downloadSummary} style={{ flex: 1, padding: "0.5rem", borderRadius: 8, border: `1px solid ${GOLD}`, background: "rgba(255,215,0,0.08)", color: GOLD, fontSize: "0.7rem", fontWeight: "bold", cursor: "pointer", fontFamily: FONT }}>📋 Copy Summary</button>
          <button onClick={onClose} style={{ flex: 1, padding: "0.5rem", borderRadius: 8, border: `1px solid ${PURPLE}33`, background: "rgba(124,58,237,0.05)", color: "#888", fontSize: "0.7rem", cursor: "pointer", fontFamily: FONT }}>Close</button>
        </div>
        <div style={{ textAlign: "center", fontSize: "0.5rem", color: "#333", marginTop: "0.75rem" }}>Paste the summary anywhere to share with your league!</div>
      </div>
    </div>
  );
}