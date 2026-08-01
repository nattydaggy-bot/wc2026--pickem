import { useState, useMemo } from "react";
import { matchHasStarted } from "../utils/scoring";

const FONT   = "'Times New Roman', Times, serif";
const PURPLE = "#37003c";
const GREEN  = "#00ff85";

// -- Countdown to season start ----------------------------------------
function SeasonCountdown({ onRefresh }) {
  const SEASON_START = new Date("2026-08-14T19:00:00Z"); // approx GW1 kickoff
  const now  = new Date();
  const diff = SEASON_START - now;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000)  / 60000);

  return (
    <div style={{ textAlign:"center", padding:"3rem 1.5rem", fontFamily:FONT }}>
      <img src="/logo.svg" alt="EPL"
        style={{ width:160, height:"auto", filter:"brightness(0) invert(1)",
          margin:"0 auto 1.5rem", display:"block", opacity:0.9 }} />
      <div style={{ fontSize:"0.68rem", letterSpacing:"2px", color:GREEN,
        fontWeight:"bold", marginBottom:"1rem" }}>
        2026/27 SEASON COUNTDOWN
      </div>
      {diff > 0 ? (
        <div style={{ display:"flex", justifyContent:"center", gap:"1rem", marginBottom:"1.5rem" }}>
          {[{v:days,l:"DAYS"},{v:hrs,l:"HRS"},{v:mins,l:"MINS"}].map(({v,l}) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", fontWeight:900, color:"#fff", lineHeight:1 }}>
                {String(v).padStart(2,"0")}
              </div>
              <div style={{ fontSize:"0.6rem", color:"#3a2545", letterSpacing:"1px", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize:"1.2rem", color:GREEN, marginBottom:"1.5rem" }}>
          🎉 Season has started!
        </div>
      )}
      <div style={{ color:"#3a2545", fontSize:"0.8rem", marginBottom:"1.5rem" }}>
        The 2026/27 Premier League fixture list will appear here automatically once
        ESPN publishes the schedule. Usually available 2–3 weeks before GW1.
      </div>
      <button onClick={onRefresh} style={{
        padding:"0.7rem 1.5rem", borderRadius:10, border:`1px solid ${GREEN}`,
        background:"rgba(0,255,133,0.1)", color:GREEN, fontWeight:"bold",
        fontSize:"0.9rem", cursor:"pointer", fontFamily:FONT,
      }}>
        ↻ Check for fixtures now
      </button>
    </div>
  );
}

// -- Team badge -------------------------------------------------------
function TeamBlock({ name, short, logo, pick, side }) {
  const sel = pick === side;
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      padding:"0.5rem 0.25rem",
      background: sel ? "rgba(0,255,133,0.08)" : "transparent",
      borderRadius:8 }}>
      {logo
        ? <img src={logo} alt={name} style={{ width:38, height:38, objectFit:"contain" }}
            onError={e => { e.target.style.display="none"; }} />
        : <div style={{ width:38, height:38, borderRadius:8,
            background:"rgba(255,255,255,0.07)", display:"flex",
            alignItems:"center", justifyContent:"center",
            fontSize:"0.65rem", fontWeight:"bold", color:"#aaa", fontFamily:FONT }}>
            {short}
          </div>
      }
      <div style={{ fontSize:"0.68rem", color:"#bbb", textAlign:"center",
        fontFamily:FONT, lineHeight:1.2 }}>
        {name?.length > 14 ? short : name}
      </div>
    </div>
  );
}

// -- Single match card ------------------------------------------------
function localDay(u){if(!u)return"";const d=new Date(u);return d.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});}
function localTime(u,fb){if(!u)return fb||"";return new Date(u).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit",hour12:false});}
function localDateKey(u,fb){if(!u)return fb||"";return new Date(u).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});}

function MatchCard({ match, pick, result, onPick }) {
  const started = matchHasStarted(match, result);
  const isLive  = result?.state === "in";
  const isFT    = result?.completed;
  const actual  = result?.actual;

  const bc = (v) => {
    if (!isFT || !actual) return pick===v ? GREEN : "rgba(255,255,255,0.06)";
    if (pick===v && pick===actual) return "#22c55e";
    if (pick===v && pick!==actual) return "#ef4444";
    if (v===actual) return "rgba(34,197,94,0.15)";
    return "rgba(255,255,255,0.04)";
  };
  const tc = (v) => {
    if (!isFT || !actual) return pick===v ? "#000" : "#555";
    if (pick===v && pick===actual) return "#22c55e";
    if (pick===v && pick!==actual) return "#ef4444";
    if (v===actual) return "#4ade80";
    return "#444";
  };

  const opts = [
    { v:"home", label:`${match.homeShort} Win` },
    { v:"draw", label:"Draw" },
    { v:"away", label:`${match.awayShort} Win` },
  ];

  return (
    <div style={{ background:"#1a0030",
      border:`1px solid ${pick ? "rgba(0,255,133,0.3)" : "rgba(255,255,255,0.06)"}`,
      borderLeft:`3px solid ${pick ? (isFT?(pick===actual?"#22c55e":"#ef4444"):GREEN) : "transparent"}`,
      borderRadius:10, marginBottom:"0.5rem", overflow:"hidden" }}>

      <div style={{ display:"flex", justifyContent:"space-between",
        padding:"0.4rem 0.75rem",
        borderBottom:"1px solid rgba(255,255,255,0.05)", alignItems:"center" }}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:"0.65rem",background:"rgba(0,255,133,0.1)",color:GREEN,padding:"2px 7px",borderRadius:4,fontFamily:FONT}}>GW{match.gw}</span>
          {match.utcDate&&<span style={{fontSize:"0.63rem",color:"rgba(0,255,133,0.7)",fontFamily:FONT}}>{localDay(match.utcDate)}</span>}
        </div>
        <span style={{ fontSize:"0.68rem", fontFamily:FONT,
          color: isLive?"#22c55e":isFT?"#888":"#554060" }}>
          {isLive ? `🔴 ${result.homeScore}–${result.awayScore}`
           : isFT  ? `FT  ${result.homeScore}–${result.awayScore}`
           : localTime(match.utcDate, match.time)}
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"center", padding:"0.25rem 0.5rem" }}>
        <TeamBlock name={match.home} short={match.homeShort} logo={match.homeLogo} pick={pick} side="home" />
        <div style={{ color:"#2a0040", fontSize:"0.75rem", fontWeight:"bold",
          padding:"0 0.4rem", fontFamily:FONT }}>VS</div>
        <TeamBlock name={match.away} short={match.awayShort} logo={match.awayLogo} pick={pick} side="away" />
      </div>

      {match.venue && (
        <div style={{ textAlign:"center", fontSize:"0.58rem", color:"#2a0040",
          padding:"0 0.75rem 0.25rem", fontFamily:FONT }}>{match.venue}</div>
      )}

      <div style={{ display:"flex", gap:4, padding:"0.45rem 0.6rem 0.55rem",
        borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        {opts.map(o => (
          <button key={o.v} onClick={() => !started && onPick(o.v)} style={{
            flex:1, padding:"0.45rem 0.1rem", borderRadius:7,
            border:`1px solid ${pick===o.v?(isFT?(pick===actual?"#22c55e":"#ef4444"):GREEN):"rgba(255,255,255,0.07)"}`,
            background: bc(o.v), color: tc(o.v),
            fontSize:"0.68rem", cursor: started&&!isFT?"not-allowed":"pointer",
            fontWeight: pick===o.v?"bold":"normal",
            fontFamily:FONT, whiteSpace:"nowrap",
            overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {pick===o.v&&isFT&&(pick===actual?"✓ ":"✗ ")}{o.label}
          </button>
        ))}
      </div>
      {started&&!isFT&&(
        <div style={{textAlign:"center",fontSize:"0.58rem",color:"#2a0040",
          paddingBottom:"0.35rem",fontFamily:FONT}}>Match in progress · picking locked</div>
      )}
    </div>
  );
}

// -- Main component ---------------------------------------------------
export default function FixturesTab({ fixtures, picks, results, onPick, onRefreshFixtures }) {
  const allGws = useMemo(() =>
    [...new Set(fixtures.map(f=>f.gw).filter(g=>g!=null))].sort((a,b)=>a-b),
  [fixtures]);

  const today = new Date().toISOString().split("T")[0];
  const currentGw = useMemo(() => {
    for (const gw of allGws) {
      const gf = fixtures.filter(f=>f.gw===gw);
      if (gf.some(f=>results[f.id]?.state==="in"||f.date>=today)) return gw;
    }
    return allGws[0] || 1;
  }, [allGws, fixtures, today, results]);

  const [activeGw, setActiveGw] = useState(null);
  const gw = activeGw ?? currentGw;
  const gwFixtures = useMemo(() =>
    fixtures.filter(f=>f.gw===gw).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),
  [fixtures, gw]);

  const pickedCount = Object.keys(picks).length;

  // No fixtures yet — show countdown
  if (fixtures.length === 0) {
    return <SeasonCountdown onRefresh={onRefreshFixtures} />;
  }

  return (
    <div style={{ padding:"0.75rem", fontFamily:FONT }}>

      {/* Progress */}
      <div style={{ marginBottom:"0.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:"0.68rem", color:"#554060" }}>Season picks</span>
          <span style={{ fontSize:"0.68rem", color:GREEN }}>{pickedCount}/{fixtures.length}</span>
        </div>
        <div style={{ height:2, background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
          <div style={{ width:`${(pickedCount/Math.max(fixtures.length,1))*100}%`,
            height:"100%", background:GREEN, borderRadius:2 }} />
        </div>
      </div>

      {/* GW scroller */}
      <div style={{ overflowX:"auto", display:"flex", gap:5, paddingBottom:8, marginBottom:6 }}>
        {allGws.map(g => (
          <button key={g} onClick={() => setActiveGw(g)} style={{
            flexShrink:0, padding:"0.3rem 0.65rem", borderRadius:16, border:"1px solid",
            borderColor: g===gw ? GREEN : "rgba(255,255,255,0.06)",
            background:  g===gw ? "rgba(0,255,133,0.12)" : "transparent",
            color:       g===gw ? GREEN : "#554060",
            fontSize:"0.72rem", cursor:"pointer",
            fontWeight: g===gw?"bold":"normal", fontFamily:FONT,
          }}>GW{g}</button>
        ))}
      </div>

      {/* Match list */}
      {gwFixtures.length === 0
        ? <div style={{ textAlign:"center", padding:"2rem", color:"#3a2545" }}>
            No fixtures for GW{gw}
          </div>
        : (() => {
          const days={};
          gwFixtures.forEach(m=>{const k=localDateKey(m.utcDate,m.date);if(!days[k])days[k]=[];days[k].push(m);});
          return Object.entries(days).map(([day,ms])=>(
            <div key={day}>
              <div style={{fontSize:"0.73rem",fontWeight:"bold",color:"rgba(0,255,133,0.75)",padding:"0.5rem 0 0.3rem",borderBottom:"1px solid rgba(0,255,133,0.12)",marginBottom:"0.4rem",fontFamily:FONT}}>{day}</div>
              {ms.map(m=><MatchCard key={m.id} match={m} pick={picks[m.id]} result={results[m.id]} onPick={pred=>onPick(m.id,pred)}/>)}
            </div>
          ));
        })()
      }
    </div>
  );
}
