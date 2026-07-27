import { useState, useMemo } from "react";
import { matchHasStarted } from "../utils/scoring";

const FONT   = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";

function TeamBlock({ name, short, logo, color, pick, side }) {
  const isSelected = pick === side;
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      padding:"0.5rem 0.25rem",
      background: isSelected ? `${color || PURPLE}22` : "transparent",
      borderRadius:8, transition:"background 0.15s" }}>
      {logo
        ? <img src={logo} alt={name} style={{ width:38, height:38, objectFit:"contain" }} onError={e => { e.target.style.display="none"; }} />
        : <div style={{ width:38, height:38, borderRadius:8, background:"rgba(255,255,255,0.07)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"0.65rem", fontWeight:"bold", color:"#aaa", fontFamily:FONT }}>
            {short}
          </div>
      }
      <div style={{ fontSize:"0.68rem", color:"#bbb", textAlign:"center", fontFamily:FONT, lineHeight:1.2 }}>
        {name?.length > 14 ? short : name}
      </div>
    </div>
  );
}

function MatchCard({ match, pick, result, onPick }) {
  const started  = matchHasStarted(match, result);
  const isLive   = result?.state === "in";
  const isFT     = result?.completed;
  const actual   = result?.actual;

  const opts = [
    { v:"home", label: match.home || "Home" },
    { v:"away", label: match.away || "Away" },
  ];
  // Insert draw in the middle
  opts.splice(1, 0, { v:"draw", label:"Draw" });

  const resultColor = (v) => {
    if (!isFT || !actual) return pick === v ? PURPLE : "rgba(255,255,255,0.06)";
    if (pick === v && pick === actual) return "#22c55e";
    if (pick === v && pick !== actual) return "#ef4444";
    if (v === actual) return "rgba(34,197,94,0.15)";
    return "rgba(255,255,255,0.04)";
  };
  const textColor = (v) => {
    if (!isFT || !actual) return pick === v ? "#fff" : "#555";
    if (pick === v && pick === actual) return "#22c55e";
    if (pick === v && pick !== actual) return "#ef4444";
    if (v === actual) return "#4ade80";
    return "#444";
  };

  return (
    <div style={{ background:"#161b22", border:`1px solid ${pick ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)"}`,
      borderLeft: pick ? `3px solid ${isFT ? (pick===actual?"#22c55e":"#ef4444") : PURPLE}` : "3px solid transparent",
      borderRadius:10, marginBottom:"0.5rem", overflow:"hidden" }}>

      {/* Top bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"0.45rem 0.75rem", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:"0.65rem", background:"rgba(124,58,237,0.15)",
          color:PURPLE, padding:"2px 7px", borderRadius:4, fontFamily:FONT }}>
          {match.gw ? `GW${match.gw}` : "—"}
        </span>
        <span style={{ fontSize:"0.68rem", color: isLive?"#22c55e":isFT?"#888":"#555", fontFamily:FONT }}>
          {isLive
            ? `🔴 ${result.homeScore}–${result.awayScore}`
            : isFT
              ? `FT  ${result.homeScore}–${result.awayScore}`
              : `${match.time} ET`}
        </span>
      </div>

      {/* Teams */}
      <div style={{ display:"flex", alignItems:"center", padding:"0.25rem 0.5rem" }}>
        <TeamBlock name={match.home} short={match.homeShort} logo={match.homeLogo}
          color={match.homeColor} pick={pick} side="home" />
        <div style={{ color:"#333", fontSize:"0.75rem", fontWeight:"bold", padding:"0 0.4rem", fontFamily:FONT }}>VS</div>
        <TeamBlock name={match.away} short={match.awayShort} logo={match.awayLogo}
          color={match.awayColor} pick={pick} side="away" />
      </div>

      {/* Venue */}
      {match.venue && (
        <div style={{ textAlign:"center", fontSize:"0.6rem", color:"#333", padding:"0 0.75rem 0.3rem", fontFamily:FONT }}>
          {match.venue}
        </div>
      )}

      {/* Pick buttons */}
      <div style={{ display:"flex", gap:4, padding:"0.5rem 0.6rem 0.6rem", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        {opts.map(o => (
          <button key={o.v} onClick={() => !started || isFT || onPick(o.v)} style={{
            flex:1, padding:"0.45rem 0.1rem", borderRadius:7,
            border:`1px solid ${pick===o.v ? (isFT?(pick===actual?"#22c55e":"#ef4444"):PURPLE) : "rgba(255,255,255,0.07)"}`,
            background: resultColor(o.v),
            color: textColor(o.v),
            fontSize:"0.68rem", cursor: started&&!isFT ? "not-allowed" : "pointer",
            fontWeight: pick===o.v ? "bold" : "normal",
            fontFamily:FONT, transition:"all 0.12s",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {pick===o.v && isFT && (pick===actual ? "✓ " : "✗ ")}
            {o.v==="home" ? `${match.homeShort || match.home?.slice(0,3)} Win`
             : o.v==="away" ? `${match.awayShort || match.away?.slice(0,3)} Win`
             : "Draw"}
          </button>
        ))}
      </div>
      {started && !isFT && (
        <div style={{ textAlign:"center", fontSize:"0.6rem", color:"#444",
          paddingBottom:"0.4rem", fontFamily:FONT }}>
          Match in progress — picking locked
        </div>
      )}
    </div>
  );
}

export default function FixturesTab({ fixtures, picks, results, onPick }) {
  const allGws = useMemo(() => {
    const set = new Set(fixtures.map(f => f.gw).filter(g => g != null));
    return [...set].sort((a,b) => a - b);
  }, [fixtures]);

  const today = new Date().toISOString().split("T")[0];
  const currentGw = useMemo(() => {
    // Find the GW with the nearest upcoming or live fixture
    for (const gw of allGws) {
      const gwFixtures = fixtures.filter(f => f.gw === gw);
      const hasUpcoming = gwFixtures.some(f => f.date >= today);
      const hasLive     = gwFixtures.some(f => results[f.id]?.state === "in");
      if (hasLive || hasUpcoming) return gw;
    }
    return allGws[allGws.length - 1] || 1;
  }, [allGws, fixtures, today, results]);

  const [activeGw, setActiveGw] = useState(null);
  const gw = activeGw ?? currentGw;

  const gwFixtures = useMemo(() =>
    fixtures.filter(f => f.gw === gw).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
  [fixtures, gw]);

  const pickedCount = Object.keys(picks).length;

  return (
    <div style={{ padding:"0.75rem", fontFamily:FONT }}>

      {/* Progress */}
      <div style={{ marginBottom:"0.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:"0.68rem", color:"#555" }}>Season picks</span>
          <span style={{ fontSize:"0.68rem", color:PURPLE }}>{pickedCount}/{fixtures.length}</span>
        </div>
        <div style={{ height:2, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
          <div style={{ width:`${(pickedCount/Math.max(fixtures.length,1))*100}%`,
            height:"100%", background:PURPLE, borderRadius:2, transition:"width 0.3s" }} />
        </div>
      </div>

      {/* GW scroller */}
      <div style={{ overflowX:"auto", display:"flex", gap:5, paddingBottom:8, marginBottom:6 }}>
        {allGws.map(g => (
          <button key={g} onClick={() => setActiveGw(g)} style={{
            flexShrink:0, padding:"0.3rem 0.65rem", borderRadius:16, border:"1px solid",
            borderColor: g===gw ? PURPLE : "rgba(255,255,255,0.08)",
            background:  g===gw ? "rgba(124,58,237,0.15)" : "transparent",
            color:       g===gw ? PURPLE : "#555",
            fontSize:"0.72rem", cursor:"pointer", fontWeight: g===gw?"bold":"normal",
            fontFamily:FONT,
          }}>GW{g}</button>
        ))}
      </div>

      {/* Fixtures */}
      {gwFixtures.length === 0
        ? <div style={{ textAlign:"center", padding:"3rem 1rem", color:"#333" }}>No fixtures for GW{gw}</div>
        : gwFixtures.map(m => (
          <MatchCard key={m.id} match={m} pick={picks[m.id]}
            result={results[m.id]} onPick={pred => onPick(m.id, pred)} />
        ))
      }
    </div>
  );
}
