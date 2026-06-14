// src/components/PicksTab.jsx — "All Picks": everyone's predictions per match
import { useState, useMemo } from "react";
import { ROUND_META, ROUND_ORDER, ROUND_COLORS } from "../data/fixtures";

function Pill({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"0.33rem 0.6rem", borderRadius:16, border:"1px solid",
      borderColor: active ? color : "rgba(255,255,255,0.09)",
      background: active ? color + "22" : "transparent",
      color: active ? color : "#666",
      fontSize:"0.7rem", cursor:"pointer", flexShrink:0,
      fontWeight: active ? "bold" : "normal", whiteSpace:"nowrap",
    }}>{label}</button>
  );
}

function pickLabel(match, pick) {
  if (!pick) return "—";
  if (pick === "home") return (match.home || "Home") + " Win";
  if (pick === "away") return (match.away || "Away") + " Win";
  return "Draw";
}

// ── CSV export (opens in Excel) ───────────────────────────────────────
function exportPicksCSV(members, fixtures, results) {
  const entries = Object.entries(members);
  const names = entries.map(([, d]) => d.teamName || "Player");

  const rows = [["Date","Round","Home","Away","Result", ...names]];

  fixtures.forEach(f => {
    const r = results[f.id];
    const resultStr = r?.completed
      ? (r.actual === "home" ? (f.home + " Win") : r.actual === "away" ? (f.away + " Win") : "Draw") + " (" + r.homeScore + "-" + r.awayScore + ")"
      : "—";
    const pickCells = entries.map(([, d]) => pickLabel(f, d?.picks?.[f.id]));
    rows.push([f.date, (ROUND_META[f.round]?.label || f.round), f.home, f.away, resultStr, ...pickCells]);
  });

  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "WC2026_AllPicks.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Single match row showing every member's pick ─────────────────────
function PickRow({ match, members, username, result }) {
  const isFT = result?.completed;
  const isLive = result?.state === "in";

  return (
    <div style={{
      background:"rgba(255,255,255,0.03)",
      border:"1px solid rgba(255,255,255,0.055)",
      borderRadius:9, padding:"0.6rem 0.7rem", marginBottom:"0.35rem",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.35rem" }}>
        <span style={{ fontWeight:"bold", fontSize:"0.82rem", color:"#ddd" }}>
          {match.home} <span style={{ color:"#444" }}>vs</span> {match.away}
        </span>
        {(isFT || isLive) && (
          <span style={{ fontSize:"0.7rem", color: isLive ? "#4CAF50" : "#888" }}>
            {isLive ? "🔴 " : "FT "}{result.homeScore}–{result.awayScore}
          </span>
        )}
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {Object.entries(members).map(([uname, data]) => {
          const p = data?.picks?.[match.id];
          const correct = isFT && result.actual && p === result.actual;
          const wrong   = isFT && result.actual && p && p !== result.actual;
          const isMe    = uname === username;
          const display = data?.teamName || uname;
          return (
            <span key={uname} style={{
              fontSize:"0.7rem", padding:"2px 9px", borderRadius:12,
              background: correct ? "rgba(76,175,80,0.18)"
                        : wrong   ? "rgba(244,67,54,0.13)"
                        : isMe    ? "rgba(201,168,76,0.1)"
                        : "rgba(255,255,255,0.05)",
              border:"1px solid " + (correct ? "#4CAF50" : wrong ? "#f44336" : isMe ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)"),
              color: correct ? "#4CAF50" : wrong ? "#f44336" : isMe ? "#C9A84C" : "#888",
              fontWeight: isMe ? "bold" : "normal",
            }}>
              {isMe ? "You" : display}: {pickLabel(match, p)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function PicksTab({ fixtures, members, username, results }) {
  const today = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");

  const allDates = useMemo(() => [...new Set(fixtures.map(f => f.date))].sort(), [fixtures]);
  const shownDates = useMemo(() => {
    const upcoming = allDates.filter(d => d >= today);
    return (upcoming.length ? upcoming : allDates).slice(0, 7);
  }, [allDates, today]);

  const filtered = useMemo(() => fixtures.filter(f =>
    (dateFilter === "all" || f.date === dateFilter) &&
    (roundFilter === "all" || f.round === roundFilter)
  ), [fixtures, dateFilter, roundFilter]);

  const byDate = useMemo(() => {
    const g = {};
    filtered.forEach(f => { (g[f.date] = g[f.date] || []).push(f); });
    return Object.entries(g).sort(([a],[b]) => a.localeCompare(b));
  }, [filtered]);

  const totalPicks = useMemo(() =>
    Object.values(members).reduce((s,m) => s + Object.keys(m?.picks || {}).length, 0),
  [members]);

  const completedCount = useMemo(() =>
    Object.values(results).filter(r => r.completed).length,
  [results]);

  return (
    <div style={{ padding:"0.75rem" }}>

      {/* Header bar */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:"0.75rem",
        background:"rgba(255,255,255,0.03)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:9, padding:"0.55rem 0.75rem",
      }}>
        <div>
          <div style={{ fontSize:"0.78rem", color:"#ccc", fontWeight:"bold" }}>
            {Object.keys(members).length} players · {fixtures.length} fixtures · {completedCount} final
          </div>
          <div style={{ fontSize:"0.68rem", color:"#555" }}>{totalPicks} total picks made</div>
        </div>
        <button onClick={() => exportPicksCSV(members, fixtures, results)} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"0.45rem 0.8rem", borderRadius:8,
          border:"1px solid #4CAF50", background:"rgba(76,175,80,0.13)",
          color:"#4CAF50", cursor:"pointer", fontSize:"0.78rem", fontWeight:"bold",
          whiteSpace:"nowrap",
        }}>
          📥 Export
        </button>
      </div>

      {/* Round filter */}
      <div style={{ overflowX:"auto", display:"flex", gap:5, paddingBottom:8, marginBottom:4 }}>
        <Pill label="All Rounds" active={roundFilter==="all"} color="#C9A84C" onClick={() => setRoundFilter("all")} />
        {ROUND_ORDER.map(r => (
          <Pill key={r} label={ROUND_META[r].short} active={roundFilter===r} color={ROUND_COLORS[r]} onClick={() => setRoundFilter(r)} />
        ))}
      </div>

      {/* Date filter */}
      <div style={{ overflowX:"auto", display:"flex", gap:5, paddingBottom:8, marginBottom:6 }}>
        <Pill label="All Dates" active={dateFilter==="all"} color="#4FC3F7" onClick={() => setDateFilter("all")} />
        {shownDates.map(date => {
          const d = new Date(date + "T12:00:00");
          const label = date === today ? "Today" : d.toLocaleDateString("en-US",{ month:"short", day:"numeric" });
          return <Pill key={date} label={label} active={dateFilter===date} color="#4FC3F7" onClick={() => setDateFilter(date)} />;
        })}
      </div>

      {/* Picks by date */}
      {byDate.length === 0 ? (
        <div style={{ textAlign:"center", padding:"3rem 1rem", color:"#444" }}>No fixtures match this filter</div>
      ) : (
        byDate.map(([date, matches]) => (
          <div key={date} style={{ marginBottom:"1.25rem" }}>
            <div style={{
              fontSize:"0.76rem", color:"#C9A84C", fontWeight:"bold",
              padding:"0.4rem 0 0.3rem",
              borderBottom:"1px solid rgba(201,168,76,0.18)",
              marginBottom:"0.4rem",
            }}>
              {new Date(date + "T12:00:00").toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" })}
            </div>
            {matches.map(m => (
              <PickRow key={m.id} match={m} members={members} username={username} result={results?.[m.id]} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
