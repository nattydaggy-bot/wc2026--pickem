// src/components/WeekWinner.jsx
import { useState, useMemo } from "react";
import { calcMemberScoreWithBanker } from "../utils/scoring";

const FONT = "'Times New Roman', Times, serif";
const GOLD = "#FFD700";

export default function WeekWinner({ fixtures, members, results, banker = {} }) {
  const [currentGw, setCurrentGw] = useState(null);

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

  const gwScores = useMemo(() => {
    const scores = {};
    const gw = currentGw || activeGw;
    Object.entries(members).forEach(([uname, data]) => {
      const { byGw } = calcMemberScoreWithBanker(data?.picks || {}, data?.banker || {}, fixtures, results);
      scores[uname] = {
        score: byGw[gw]?.pts || 0,
        correct: byGw[gw]?.correct || 0,
        total: byGw[gw]?.total || 0,
        teamName: data?.teamName || uname,
      };
    });
    return scores;
  }, [members, fixtures, results, currentGw, activeGw]);

  const sorted = Object.entries(gwScores).sort((a, b) => b[1].score - a[1].score).filter(([_, data]) => data.total > 0);
  const winner = sorted.length > 0 ? sorted[0] : null;

  const allGws = useMemo(() => {
    const gws = new Set();
    fixtures.forEach(f => { if (f.gw) gws.add(f.gw); });
    return Array.from(gws).sort((a, b) => a - b);
  }, [fixtures]);

  return (
    <div style={{ background: "rgba(255,215,0,0.05)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "0.7rem 0.85rem", marginBottom: "0.65rem", fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div>
            <div style={{ fontSize: "0.55rem", color: GOLD, letterSpacing: "2px", fontWeight: "bold" }}>GW {currentGw || activeGw}</div>
            {winner ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: 1 }}>
                <span style={{ fontSize: "1.1rem" }}>🏆</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff" }}>{winner[1].teamName}</span>
                <span style={{ fontSize: "0.7rem", color: GOLD }}>{winner[1].score} pts</span>
                <span style={{ fontSize: "0.5rem", color: "#555" }}>({winner[1].correct}/{winner[1].total})</span>
              </div>
            ) : (
              <span style={{ color: "#444", fontSize: "0.7rem" }}>No picks yet</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <select value={currentGw || activeGw} onChange={e => setCurrentGw(Number(e.target.value))} style={{ padding: "0.15rem 0.4rem", borderRadius: 6, border: `1px solid ${GOLD}33`, background: "rgba(0,0,0,0.3)", color: "#aaa", fontSize: "0.6rem", fontFamily: FONT }}>
            {allGws.map(g => <option key={g} value={g}>GW {g}</option>)}
          </select>
          <div style={{ display: "flex", gap: 2 }}>
            {sorted.slice(0, 3).map(([uname, data], i) => (
              <div key={uname} style={{ fontSize: "0.5rem", color: i === 0 ? GOLD : "#555", background: "rgba(255,255,255,0.04)", padding: "1px 5px", borderRadius: 6 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {data.teamName}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}