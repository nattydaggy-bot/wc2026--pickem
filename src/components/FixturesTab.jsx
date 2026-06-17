// src/components/FixturesTab.jsx
import { useState, useMemo } from "react";
import { ROUND_META, ROUND_ORDER, ROUND_COLORS } from "../data/fixtures";

function fmtDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" });
}

function shortName(name = "") {
  if (name.startsWith("TBD")) return "TBD";
  return name.substring(0, 3).toUpperCase();
}

// ── Pill (filter chip) ──────────────────────────────────────────────────
function Pill({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"0.35rem 0.65rem", borderRadius:20, border:"1px solid",
      borderColor: active ? color : "rgba(255,255,255,0.1)",
      background: active ? color + "22" : "transparent",
      color: active ? color : "#777",
      fontSize:"0.72rem", cursor:"pointer", flexShrink:0,
      fontWeight: active ? "bold" : "normal", whiteSpace:"nowrap",
    }}>
      {label}
    </button>
  );
}

// ── Single match card ────────────────────────────────────────────────────
function MatchCard({ match, pick, result, onPick }) {
  const isLive   = result?.state === "in";
  const isFT     = result?.completed;
  // Times in fixtures.js are ET (UTC-4 during the tournament window).
  // Lock picks at kickoff even if ESPN's live data hasn't matched up yet.
  const kickoffMs = (match.date && match.time)
    ? new Date(`${match.date}T${match.time}:00-04:00`).getTime()
    : null;
  const started = kickoffMs != null && Date.now() >= kickoffMs;
  const locked  = (result && result.state !== "pre") || started; // started or finished
  const rMeta    = ROUND_META[match.round] || {};
  const roundTag = match.group ? "Grp " + match.group : rMeta.short;

  // No draw from Round of 32 onwards — knockout rules apply
  const isKnockout = match.round !== "group";
  const opts = isKnockout ? [
    { v:"home", label: match.home ? match.home + " Win" : "Home Win" },
    { v:"away", label: match.away ? match.away + " Win" : "Away Win" },
  ] : [
    { v:"home", label: match.home ? match.home + " Win" : "Home Win" },
    { v:"draw", label: "Draw" },
    { v:"away", label: match.away ? match.away + " Win" : "Away Win" },
  ];

  return (
    <div style={{
      background:"rgba(255,255,255,0.035)",
      border:"1px solid " + (isLive ? "#E61D25" : pick ? "rgba(201,168,76,0.22)" : "rgba(255,255,255,0.06)"),
      borderLeft: "3px solid " + (isLive ? "#E61D25" : pick ? "#C9A84C" : "transparent"),
      borderRadius:10, padding:"0.8rem 0.7rem", marginBottom:"0.45rem", overflow:"hidden",
    }}>
      {/* LIVE banner — full width, always at the top of the card */}
      {isLive && (
        <div style={{
          background:"#E61D25", color:"#fff", textAlign:"center",
          fontSize:"0.7rem", fontWeight:"bold", letterSpacing:"1.5px",
          padding:"4px 0", margin:"-0.8rem -0.7rem 0.55rem",
        }}>
          🔴 LIVE{result.status ? " · " + result.status : ""} — {result.homeScore}–{result.awayScore}
        </div>
      )}

      {/* Top meta row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.55rem" }}>
        <span style={{
          fontSize:"0.65rem", fontWeight:"bold", color: ROUND_COLORS[match.round] || "#888",
          background: (ROUND_COLORS[match.round] || "#888") + "1a",
          padding:"2px 7px", borderRadius:4,
        }}>
          {roundTag}
        </span>
        <span style={{ fontSize:"0.68rem", color: isFT ? "#aaa" : "#555" }}>
          {isFT
            ? "FT " + result.homeScore + "–" + result.awayScore
            : isLive
              ? ""
              : (locked ? "🔒 " : "") + (match.time || "") + " ET"}
        </span>
      </div>

      {/* Teams */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.65rem" }}>
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{
            fontSize:"1.1rem", fontWeight:"bold", letterSpacing:1,
            background:"rgba(255,255,255,0.07)", borderRadius:6,
            padding:"0.25rem 0.4rem", display:"inline-block", minWidth:42,
          }}>{shortName(match.home)}</div>
          <div style={{ fontSize:"0.66rem", color:"#bbb", marginTop:3 }}>{match.home}</div>
        </div>
        <div style={{ color:"#333", fontSize:"0.8rem", fontWeight:"bold", padding:"0 0.5rem" }}>VS</div>
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{
            fontSize:"1.1rem", fontWeight:"bold", letterSpacing:1,
            background:"rgba(255,255,255,0.07)", borderRadius:6,
            padding:"0.25rem 0.4rem", display:"inline-block", minWidth:42,
          }}>{shortName(match.away)}</div>
          <div style={{ fontSize:"0.66rem", color:"#bbb", marginTop:3 }}>{match.away}</div>
        </div>
      </div>

      {/* Venue */}
      <div style={{ fontSize:"0.62rem", color:"#555", marginBottom:"0.5rem", textAlign:"center" }}>
        {match.venue}{match.date ? " · " + fmtDate(match.date) : ""}
      </div>

      {/* Pick buttons */}
      <div style={{ display:"flex", gap:5 }}>
        {opts.map(opt => {
          const sel = pick === opt.v;
          const correct = isFT && result.actual === opt.v && sel;
          const wrong   = isFT && result.actual && sel && result.actual !== opt.v;
          return (
            <button key={opt.v}
              disabled={locked}
              onClick={() => !locked && onPick(opt.v)}
              style={{
                flex:1, padding:"0.48rem 0.1rem", borderRadius:7,
                border:"1px solid " + (correct ? "#4CAF50" : wrong ? "#f44336" : sel ? "#C9A84C" : "rgba(255,255,255,0.08)"),
                background: correct ? "rgba(76,175,80,0.18)" : wrong ? "rgba(244,67,54,0.13)" : sel ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
                color: correct ? "#4CAF50" : wrong ? "#f44336" : sel ? "#C9A84C" : "#888",
                fontWeight: sel ? "bold" : "normal", fontSize:"0.68rem",
                cursor: locked ? "default" : "pointer", opacity: locked && !sel ? 0.5 : 1,
              }}>
              {sel && (correct ? "✓ " : wrong ? "✗ " : "● ")}{opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function FixturesTab({ fixtures, picks, results, onPick }) {
  const today = new Date().toISOString().split("T")[0];

  const [roundFilter, setRoundFilter] = useState("all");
  const [dateFilter, setDateFilter]   = useState("all");

  const allDates = useMemo(() => [...new Set(fixtures.map(f => f.date))].sort(), [fixtures]);
  const shownDates = useMemo(() => {
    const upcoming = allDates.filter(d => d >= today);
    return (upcoming.length ? upcoming : allDates).slice(0, 7);
  }, [allDates, today]);

  const filtered = useMemo(() => fixtures.filter(f =>
    (roundFilter === "all" || f.round === roundFilter) &&
    (dateFilter === "all" || f.date === dateFilter)
  ), [fixtures, roundFilter, dateFilter]);

  const byDate = useMemo(() => {
    const g = {};
    filtered.forEach(f => { (g[f.date] = g[f.date] || []).push(f); });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const pickedCount = picks ? Object.keys(picks).length : 0;

  return (
    <div style={{ padding:"0.75rem" }}>

      {/* Progress bar */}
      <div style={{ marginBottom:"0.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:"0.7rem", color:"#666" }}>Your picks</span>
          <span style={{ fontSize:"0.7rem", color:"#C9A84C" }}>{pickedCount}/{fixtures.length}</span>
        </div>
        <div style={{ height:3, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
          <div style={{ width:(pickedCount/fixtures.length*100)+"%", height:"100%", background:"#C9A84C", borderRadius:2 }} />
        </div>
      </div>

      {/* Round filter */}
      <div style={{ overflowX:"auto", display:"flex", gap:5, paddingBottom:8, marginBottom:4 }}>
        <Pill label={"All " + fixtures.length} active={roundFilter==="all"} color="#C9A84C" onClick={() => setRoundFilter("all")} />
        {ROUND_ORDER.map(r => (
          <Pill key={r} label={ROUND_META[r].label} active={roundFilter===r} color={ROUND_COLORS[r]} onClick={() => setRoundFilter(r)} />
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

      {/* Match list */}
      {byDate.length === 0 ? (
        <div style={{ textAlign:"center", padding:"3rem 1rem", color:"#444" }}>No fixtures match this filter</div>
      ) : (
        byDate.map(([date, matches]) => (
          <div key={date}>
            <div style={{
              fontSize:"0.78rem", fontWeight:"bold", color:"#C9A84C",
              padding:"0.45rem 0 0.3rem",
              borderBottom:"1px solid rgba(201,168,76,0.18)",
              marginBottom:"0.45rem", letterSpacing:"0.3px"
            }}>
              {fmtDate(date)}
            </div>
            {matches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                pick={picks?.[m.id]}
                result={results?.[m.id]}
                onPick={pred => onPick(m.id, pred)}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
