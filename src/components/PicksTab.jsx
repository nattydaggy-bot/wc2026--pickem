import { useState, useMemo } from "react";
import { matchHasStarted } from "../utils/scoring";
const FONT = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";

function exportCSV(members, fixtures) {
  const names  = Object.keys(members);
  const header = ["Match","Date","GW","Home","Away", ...names.map(n => members[n]?.teamName || n)];
  const rows   = [header];
  fixtures.forEach(f => {
    rows.push([f.id, f.date, f.gw||"", f.home, f.away,
      ...names.map(n => {
        const p = members[n]?.picks?.[f.id];
        if (!p) return "—";
        if (p==="home") return `${f.home} Win`;
        if (p==="away") return `${f.away} Win`;
        return "Draw";
      })
    ]);
  });
  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = "EPL_AllPicks.csv"; a.click();
}

export default function PicksTab({ fixtures, members, username, results }) {
  const allGws    = useMemo(() => [...new Set(fixtures.map(f=>f.gw).filter(Boolean))].sort((a,b)=>a-b), [fixtures]);
  const [gw, setGw] = useState(null);
  const shown = useMemo(() => gw == null ? fixtures : fixtures.filter(f=>f.gw===gw), [fixtures, gw]);

  return (
    <div style={{ padding:"0.75rem", fontFamily:FONT }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
        <span style={{ fontSize:"0.78rem", color:"#bbb" }}>
          {Object.keys(members).length} players · {Object.values(members).reduce((s,m)=>s+Object.keys(m?.picks||{}).length,0)} total picks
        </span>
        <button onClick={() => exportCSV(members, fixtures)} style={{
          padding:"0.4rem 0.7rem", borderRadius:8, border:"1px solid #22c55e",
          background:"rgba(34,197,94,0.1)", color:"#22c55e",
          fontSize:"0.72rem", fontWeight:"bold", cursor:"pointer", fontFamily:FONT,
        }}>📥 Export .csv</button>
      </div>

      {/* GW filter */}
      <div style={{ overflowX:"auto", display:"flex", gap:5, paddingBottom:8, marginBottom:8 }}>
        <button onClick={() => setGw(null)} style={{
          flexShrink:0, padding:"0.3rem 0.65rem", borderRadius:16, border:"1px solid",
          borderColor: gw==null ? "#60a5fa":"rgba(255,255,255,0.08)",
          background:  gw==null ? "rgba(96,165,250,0.12)":"transparent",
          color:       gw==null ? "#60a5fa":"#555", fontSize:"0.72rem", cursor:"pointer", fontFamily:FONT,
        }}>All GWs</button>
        {allGws.map(g => (
          <button key={g} onClick={() => setGw(g)} style={{
            flexShrink:0, padding:"0.3rem 0.65rem", borderRadius:16, border:"1px solid",
            borderColor: g===gw ? "#60a5fa":"rgba(255,255,255,0.08)",
            background:  g===gw ? "rgba(96,165,250,0.12)":"transparent",
            color:       g===gw ? "#60a5fa":"#555", fontSize:"0.72rem", cursor:"pointer", fontFamily:FONT,
          }}>GW{g}</button>
        ))}
      </div>

      {/* Match rows */}
      {shown.map(f => {
        const r       = results[f.id];
        const started = matchHasStarted(f, r);
        const isFT    = r?.completed;
        return (
          <div key={f.id} style={{ background:"#161b22", border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:9, padding:"0.6rem 0.75rem", marginBottom:"0.4rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.35rem" }}>
              <span style={{ fontWeight:"bold", fontSize:"0.8rem", color:"#ddd" }}>
                {f.home} <span style={{ color:"#333" }}>vs</span> {f.away}
              </span>
              <span style={{ fontSize:"0.65rem", color: r?.state==="in"?"#22c55e":"#555" }}>
                {isFT ? `FT ${r.homeScore}–${r.awayScore}` : r?.state==="in" ? `🔴 ${r.homeScore}–${r.awayScore}` : `GW${f.gw||"?"}`}
              </span>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {Object.entries(members).map(([uname, data]) => {
                const p       = data?.picks?.[f.id];
                const isMe    = uname === username;
                const display = data?.teamName || uname;
                if (!started && !isMe) return (
                  <span key={uname} style={{ fontSize:"0.68rem", padding:"2px 8px", borderRadius:12,
                    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
                    color:"#333", fontFamily:FONT }}>
                    {display}: 🔒
                  </span>
                );
                const correct = isFT && r?.actual && p===r.actual;
                const wrong   = isFT && r?.actual && p && p!==r.actual;
                const label   = p==="home" ? `${f.homeShort||f.home?.slice(0,3)} Win`
                               : p==="away" ? `${f.awayShort||f.away?.slice(0,3)} Win`
                               : p==="draw" ? "Draw" : "—";
                return (
                  <span key={uname} style={{ fontSize:"0.68rem", padding:"2px 8px", borderRadius:12,
                    background: correct?"rgba(34,197,94,0.15)":wrong?"rgba(239,68,68,0.12)":isMe?"rgba(124,58,237,0.1)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${correct?"#22c55e":wrong?"#ef4444":isMe?"rgba(124,58,237,0.35)":"rgba(255,255,255,0.07)"}`,
                    color: correct?"#4ade80":wrong?"#f87171":isMe?PURPLE:"#777",
                    fontWeight: isMe?"bold":"normal", fontFamily:FONT }}>
                    {isMe?"You":display}: {label}
                  </span>
                );
              })}
            </div>
            {!started && (
              <div style={{ fontSize:"0.6rem", color:"#333", marginTop:4, fontFamily:FONT }}>
                Picks hidden until kickoff
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
