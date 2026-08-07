// src/components/HeadToHead.jsx
import { useState, useMemo } from "react";
import { matchHasStarted } from "../utils/scoring";

const FONT = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";
const GREEN = "#00ff85";

export default function HeadToHead({ fixtures, members, username, results, onClose }) {
  const [targetUser, setTargetUser] = useState("");

  const otherPlayers = Object.keys(members).filter(u => u !== username);

  const comparison = useMemo(() => {
    if (!targetUser || !members[targetUser]) return null;

    const myPicks = members[username]?.picks || {};
    const theirPicks = members[targetUser]?.picks || {};
    const myName = members[username]?.teamName || username;
    const theirName = members[targetUser]?.teamName || targetUser;
    const myBanker = members[username]?.banker || {};
    const theirBanker = members[targetUser]?.banker || {};

    const matchups = fixtures.map(f => {
      const r = results[f.id];
      const myPick = myPicks[f.id];
      const theirPick = theirPicks[f.id];
      const started = matchHasStarted(f, r);
      const isFT = r?.completed;

      let myCorrect = false;
      let theirCorrect = false;
      let result = null;
      let myPoints = 0;
      let theirPoints = 0;

      if (isFT && r?.actual) {
        myCorrect = myPick === r.actual;
        theirCorrect = theirPick === r.actual;
        myPoints = myCorrect ? (myBanker[f.gw] === f.id ? 2 : 1) : 0;
        theirPoints = theirCorrect ? (theirBanker[f.gw] === f.id ? 2 : 1) : 0;
        if (myCorrect && !theirCorrect) result = "win";
        else if (!myCorrect && theirCorrect) result = "loss";
        else if (myCorrect && theirCorrect) result = "draw";
      }

      return {
        f,
        myPick,
        theirPick,
        started,
        isFT,
        myCorrect,
        theirCorrect,
        result,
        actual: r?.actual,
        myPoints,
        theirPoints,
      };
    });

    const totals = {
      wins: matchups.filter(m => m.result === "win").length,
      losses: matchups.filter(m => m.result === "loss").length,
      draws: matchups.filter(m => m.result === "draw").length,
      pending: matchups.filter(m => !m.isFT && m.myPick && m.theirPick).length,
      myPoints: matchups.reduce((sum, m) => sum + m.myPoints, 0),
      theirPoints: matchups.reduce((sum, m) => sum + m.theirPoints, 0),
    };

    return { matchups, totals, myName, theirName };
  }, [targetUser, fixtures, members, username, results]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.92)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: FONT,
    }}>
      <div style={{
        background: "#0f0014",
        border: `1px solid ${PURPLE}55`,
        borderRadius: 16,
        maxWidth: 650,
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        padding: "1.5rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ color: "#fff", fontSize: "1rem" }}>⚔️ Head-to-Head</h3>
          <button onClick={onClose} style={{
            background: "none",
            border: "none",
            color: "#555",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}>✕</button>
        </div>

        <select
          value={targetUser}
          onChange={e => setTargetUser(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            border: `1px solid ${PURPLE}33`,
            background: "#161b22",
            color: "#fff",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            fontFamily: FONT,
          }}
        >
          <option value="">Select opponent…</option>
          {otherPlayers.map(u => (
            <option key={u} value={u}>{members[u]?.teamName || u}</option>
          ))}
        </select>

        {comparison && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: "0.5rem",
              padding: "0.75rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              marginBottom: "1rem",
              textAlign: "center",
            }}>
              <div>
                <div style={{ fontSize: "0.6rem", color: "#555" }}>{comparison.myName}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: GREEN }}>
                  {comparison.totals.wins}
                </div>
                <div style={{ fontSize: "0.6rem", color: "#444" }}>{comparison.totals.myPoints} pts</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", color: "#555", fontSize: "0.7rem" }}>
                <div>{comparison.totals.draws} draws</div>
                <div style={{ fontSize: "0.5rem", color: "#333" }}>{comparison.totals.pending} pending</div>
              </div>
              <div>
                <div style={{ fontSize: "0.6rem", color: "#555" }}>{comparison.theirName}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ef4444" }}>
                  {comparison.totals.losses}
                </div>
                <div style={{ fontSize: "0.6rem", color: "#444" }}>{comparison.totals.theirPoints} pts</div>
              </div>
            </div>

            <div style={{ maxHeight: 350, overflow: "auto" }}>
              {comparison.matchups.map((m, i) => {
                const bg = m.result === "win" ? "rgba(34,197,94,0.08)" :
                  m.result === "loss" ? "rgba(239,68,68,0.08)" :
                  m.result === "draw" ? "rgba(255,215,0,0.08)" : "transparent";
                const border = m.result === "win" ? GREEN :
                  m.result === "loss" ? "#ef4444" :
                  m.result === "draw" ? "#FFD700" : "rgba(255,255,255,0.05)";

                return (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto auto",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.3rem 0.5rem",
                    background: bg,
                    borderBottom: `1px solid ${border}33`,
                    fontSize: "0.65rem",
                  }}>
                    <span style={{ color: "#777", minWidth: 35 }}>GW{m.f.gw}</span>
                    <span style={{ color: "#666" }}>{m.f.homeShort} vs {m.f.awayShort}</span>
                    <span style={{
                      color: m.myCorrect ? GREEN : "#444",
                      fontWeight: m.myCorrect ? "bold" : "normal"
                    }}>
                      {m.myPick || "—"}
                    </span>
                    <span style={{ color: "#333" }}>vs</span>
                    <span style={{
                      color: m.theirCorrect ? GREEN : "#444",
                      fontWeight: m.theirCorrect ? "bold" : "normal"
                    }}>
                      {m.theirPick || "—"}
                    </span>
                    {m.isFT && m.actual && (
                      <span style={{ color: "#444", fontSize: "0.5rem" }}>
                        {m.actual}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}