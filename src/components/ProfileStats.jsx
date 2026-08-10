// src/components/ProfileStats.jsx
import { useMemo } from "react";

const FONT = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";
const GREEN = "#00ff85";

export default function ProfileStats({ fixtures, picks, results, username, teamName }) {
  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    let streak = 0;
    let bestStreak = 0;

    const sortedFixtures = [...fixtures].sort((a, b) => a.date.localeCompare(b.date));

    sortedFixtures.forEach(f => {
      const r = results[f.id];
      const p = picks[f.id];
      if (r?.actual && p) {
        total++;
        if (p === r.actual) {
          correct++;
          streak++;
          if (streak > bestStreak) bestStreak = streak;
        } else {
          streak = 0;
        }
      }
    });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    return { accuracy, correct, total, currentStreak: streak, bestStreak };
  }, [fixtures, picks, results]);

  if (stats.total === 0) {
    return (
      <div style={{ background: "rgba(124,58,237,0.05)", border: `1px solid ${PURPLE}33`, borderRadius: 10, padding: "0.85rem 1rem", marginBottom: "0.75rem", fontFamily: FONT, textAlign: "center", color: "#444", fontSize: "0.8rem" }}>
        Make your first pick to see your stats!
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(124,58,237,0.05)", border: `1px solid ${PURPLE}33`, borderRadius: 10, padding: "0.85rem 1rem", marginBottom: "0.75rem", fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "1px" }}>{teamName || username} · Accuracy</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginTop: 2 }}>
            <span style={{ fontSize: "1.6rem", fontWeight: "bold", color: GREEN }}>{stats.accuracy.toFixed(1)}%</span>
            <span style={{ fontSize: "0.65rem", color: "#555" }}>({stats.correct}/{stats.total} picks)</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.6rem" }}>
          <div style={{ textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "0.75rem" }}>
            <div style={{ color: "#555" }}>🔥 Streak</div>
            <div style={{ color: stats.currentStreak >= 3 ? GREEN : "#555" }}>{stats.currentStreak >= 3 ? `🔥 ${stats.currentStreak}` : stats.currentStreak}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#555" }}>Best</div>
            <div style={{ color: "#555" }}>{stats.bestStreak}</div>
          </div>
        </div>
      </div>
    </div>
  );
}