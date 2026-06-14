// src/components/StandingsTab.jsx
import { useState, useMemo } from "react";
import { calcMemberScore, ROUND_META, ROUND_ORDER, MAX_SCORE } from "../utils/scoring";

const MEDALS = ["🥇","🥈","🥉"];
const GOLD = "#C9A84C";

// -- CSV / Excel export ---------------------------------------------------
function exportStandings(rows) {
  const roundCols = ROUND_ORDER.map(r => ROUND_META[r].short);
  const header = ["Rank","Team","Score",`Max (${MAX_SCORE})`,"Picks Made", ...roundCols.map(c => `${c} (correct/total)`)];
  const lines = [header];

  rows.forEach((row, i) => {
    const roundCells = ROUND_ORDER.map(r => {
      const b = row.breakdown[r];
      return `${b.correct}/${b.total}`;
    });
    lines.push([i+1, row.teamName, row.score, MAX_SCORE, row.picksMade, ...roundCells]);
  });

  const csv = lines.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "WC2026_Standings.csv";
  a.click();
}

const STATUS_STYLES = {
  "pre-tournament": { color:"#888",   label:"Pre-tournament" },
  "live":           { color:"#4CAF50",label:"Live now"       },
  "in progress":    { color:"#4fc3f7",label:"In progress"    },
  "completed":      { color:GOLD,     label:"Completed"      },
};

export default function StandingsTab({ fixtures, members, username, results, status, leagueCode, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    return Object.entries(members).map(([uname, data]) => {
      const { score, picksMade, breakdown } = calcMemberScore(data?.picks || {}, fixtures, results, ROUND_META);
      return {
        username: uname,
        teamName: data?.teamName || uname,
        score, picksMade, breakdown,
        isMe: uname === username,
      };
    }).sort((a,b) => b.score - a.score || b.picksMade - a.picksMade);
  }, [members, fixtures, results, username]);

  const me = rows.find(r => r.isMe);
  const st = STATUS_STYLES[status?.label] || STATUS_STYLES["pre-tournament"];

  async function handleRefresh() {
    setRefreshing(true);
    try { await onRefresh?.(); } finally { setTimeout(() => setRefreshing(false), 400); }
  }
  function handleCopy() {
    navigator.clipboard?.writeText(leagueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ padding:"0.75rem" }}>

      {/* Invite code box */}
      <div style={{
        background:"rgba(201,168,76,0.06)", border:`1px solid ${GOLD}44`,
        borderRadius:10, padding:"0.85rem", textAlign:"center", marginBottom:"0.75rem"
      }}>
        <div style={{ fontSize:"0.65rem", letterSpacing:"2px", color:GOLD, fontWeight:"bold", marginBottom:6 }}>
          INVITE CODE
        </div>
        <div style={{ fontSize:"1.6rem", fontWeight:900, letterSpacing:"5px", color:"#4fc3f7", marginBottom:6 }}>
          {leagueCode}
        </div>
        <button onClick={handleCopy} style={{
          padding:"0.3rem 0.85rem", borderRadius:7, border:"1px solid rgba(255,255,255,0.15)",
          background:"rgba(255,255,255,0.04)", color:"#ccc", fontSize:"0.7rem", cursor:"pointer"
        }}>{copied ? "Copied!" : "Copy code"}</button>
      </div>

      {/* Status + refresh + export */}
      <div style={{ display:"flex", gap:6, marginBottom:"0.85rem" }}>
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:8, fontSize:"0.72rem", color: st.color, fontWeight:"bold"
        }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:st.color, display:"inline-block" }} />
          {st.label}
        </div>
        <button onClick={handleRefresh} style={{
          flex:1, padding:"0.5rem", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)",
          background:"rgba(255,255,255,0.03)", color:"#ccc", fontSize:"0.72rem", cursor:"pointer"
        }}>{refreshing ? "Refreshing..." : "Refresh scores"}</button>
        <button onClick={() => exportStandings(rows)} style={{
          flex:1, padding:"0.5rem", borderRadius:8, border:"1px solid #4CAF50",
          background:"rgba(76,175,80,0.12)", color:"#4CAF50", fontSize:"0.72rem",
          fontWeight:"bold", cursor:"pointer"
        }}>Export .csv</button>
      </div>

      {/* Leaderboard */}
      <div style={{ display:"grid", gap:6, marginBottom:"1.25rem" }}>
        {rows.map((row, idx) => (
          <div key={row.username} style={{
            display:"flex", alignItems:"center", gap:"0.75rem",
            background: row.isMe ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.03)",
            border:`1px solid ${row.isMe ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
            borderRadius:9, padding:"0.65rem 0.85rem"
          }}>
            <span style={{ fontSize: idx < 3 ? "1.15rem" : "0.85rem", color:"#999", minWidth:26, textAlign:"center" }}>
              {MEDALS[idx] ?? idx+1}
            </span>
            <span style={{ flex:1, fontSize:"0.88rem", fontWeight: row.isMe ? "bold" : "normal", color: row.isMe ? GOLD : "#ddd" }}>
              {row.teamName}{row.isMe && <span style={{ color:"#777", fontWeight:"normal" }}> (You)</span>}
            </span>
            <span style={{ fontSize:"0.7rem", color:"#666" }}>{row.picksMade}/{fixtures.length}</span>
            <span style={{ fontSize:"1.05rem", fontWeight:"bold", color:"#4CAF50", minWidth:55, textAlign:"right" }}>
              {row.score} <span style={{ fontSize:"0.65rem", color:"#777" }}>pts</span>
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ textAlign:"center", padding:"2.5rem 1rem", color:"#444" }}>
            No players yet -- share your invite code above!
          </div>
        )}
      </div>

      {/* Your round breakdown */}
      {me && (
        <div>
          <div style={{ fontSize:"0.78rem", fontWeight:"bold", color:GOLD, marginBottom:"0.5rem", letterSpacing:"0.5px" }}>
            YOUR ROUND BREAKDOWN
          </div>
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6,
            background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:10, padding:"0.85rem"
          }}>
            {ROUND_ORDER.map(r => {
              const b = me.breakdown[r];
              const meta = ROUND_META[r];
              return (
                <div key={r} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"0.62rem", color:"#888", marginBottom:2, fontWeight:"bold" }}>{meta.short}</div>
                  <div style={{ fontSize:"1.1rem", fontWeight:"bold", color: b.correct>0 ? "#4CAF50" : "#555" }}>
                    {b.correct}
                  </div>
                  <div style={{ fontSize:"0.6rem", color:"#555" }}>/{b.total}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"0.6rem", fontSize:"0.7rem", color:"#777" }}>
            <span>{me.score}/{MAX_SCORE} pts possible</span>
            <span>{me.picksMade}/{fixtures.length} picks made</span>
          </div>
        </div>
      )}
    </div>
  );
}
