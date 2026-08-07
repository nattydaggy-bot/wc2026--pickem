// src/components/StandingsTab.jsx
import { useState, useMemo } from "react";
import { calcMemberScoreWithBanker } from "../utils/scoring";
import HeadToHead from "./HeadToHead";

const FONT = "'Times New Roman', Times, serif";
const PURPLE = "#7c3aed";
const MEDALS = ["🥇","🥈","🥉"];

function exportCSV(rows, totalGws) {
  const gwCols = Array.from({length:totalGws},(_,i)=>i+1);
  const header = ["Rank","Team","Total",`Max(${totalGws})`,"Picks",...gwCols.map(g=>`GW${g}`)];
  const lines  = [header];
  rows.forEach((r,i)=>{
    lines.push([i+1, r.teamName, r.score, totalGws, r.picksMade,
      ...gwCols.map(g => { const b=r.byGw[g]; return b ? `${b.correct}/${b.total}` : "0/0"; })
    ]);
  });
  const csv  = lines.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a    = document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download = "EPL_Standings.csv"; a.click();
}

export default function StandingsTab({ fixtures, members, username, results, status, leagueCode, onRefresh, banker = {} }) {
  const [copied,    setCopied]    = useState(false);
  const [refreshing,setRefreshing]= useState(false);
  const [h2hTarget, setH2hTarget] = useState(null);

  const totalGws = useMemo(() => Math.max(0,...fixtures.map(f=>f.gw||0)), [fixtures]);

  const rows = useMemo(() =>
    Object.entries(members).map(([uname, data]) => {
      const { score, picksMade, byGw } = calcMemberScoreWithBanker(
        data?.picks||{}, 
        data?.banker||{}, 
        fixtures, 
        results
      );
      return { username:uname, teamName:data?.teamName||uname, score, picksMade, byGw, isMe:uname===username };
    }).sort((a,b)=>b.score-a.score||b.picksMade-a.picksMade)
  , [members, fixtures, results, username]);

  const me = rows.find(r=>r.isMe);
  const stColor = status?.label==="Live"?"#22c55e":status?.label==="In Progress"?"#60a5fa":"#555";

  async function doRefresh() { setRefreshing(true); try { await onRefresh?.(); } finally { setTimeout(()=>setRefreshing(false),500); } }
  function doCopy() { navigator.clipboard?.writeText(leagueCode); setCopied(true); setTimeout(()=>setCopied(false),1500); }

  return (
    <div style={{ padding:"0.75rem", fontFamily:FONT }}>

      <div style={{ background:"rgba(124,58,237,0.06)", border:`1px solid ${PURPLE}33`,
        borderRadius:10, padding:"0.85rem", textAlign:"center", marginBottom:"0.75rem" }}>
        <div style={{ fontSize:"0.6rem", letterSpacing:"2px", color:PURPLE, fontWeight:"bold", marginBottom:6 }}>
          INVITE CODE
        </div>
        <div style={{ fontSize:"1.6rem", fontWeight:900, letterSpacing:5, color:"#60a5fa", marginBottom:8 }}>
          {leagueCode}
        </div>
        <button onClick={doCopy} style={{ padding:"0.3rem 0.85rem", borderRadius:7,
          border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)",
          color:"#999", fontSize:"0.7rem", cursor:"pointer", fontFamily:FONT }}>
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:"0.85rem" }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
          background:"#161b22", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8,
          fontSize:"0.7rem", color:stColor, fontWeight:"bold", padding:"0.5rem" }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:stColor,display:"inline-block" }}/>
          {status?.label||"Loading"}
        </div>
        <button onClick={doRefresh} style={{ flex:1, padding:"0.5rem", borderRadius:8,
          border:"1px solid rgba(255,255,255,0.08)", background:"#161b22",
          color:"#888", fontSize:"0.7rem", cursor:"pointer", fontFamily:FONT }}>
          {refreshing?"Refreshing…":"↻ Refresh"}
        </button>
        <button onClick={()=>exportCSV(rows,totalGws)} style={{ flex:1, padding:"0.5rem", borderRadius:8,
          border:"1px solid #22c55e", background:"rgba(34,197,94,0.1)",
          color:"#22c55e", fontSize:"0.7rem", fontWeight:"bold", cursor:"pointer", fontFamily:FONT }}>
          📥 Export
        </button>
      </div>

      <div style={{ display:"grid", gap:6, marginBottom:"1.25rem" }}>
        {rows.map((row,i)=>(
          <div key={row.username} style={{
            display:"flex", alignItems:"center", gap:"0.75rem",
            background: row.isMe?"rgba(124,58,237,0.07)":"#161b22",
            border:`1px solid ${row.isMe?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.06)"}`,
            borderRadius:9, padding:"0.65rem 0.85rem",
          }}>
            <span style={{ fontSize:i<3?"1.1rem":"0.82rem",color:"#777",minWidth:26,textAlign:"center" }}>
              {MEDALS[i]??i+1}
            </span>
            <span 
              style={{ 
                flex:1, fontSize:"0.88rem",
                fontWeight:row.isMe?"bold":"normal", 
                color:row.isMe?PURPLE:"#ddd",
                cursor: row.isMe ? "default" : "pointer",
                textDecoration: row.isMe ? "none" : "underline",
                textDecorationColor: "rgba(255,255,255,0.1)",
              }}
              onClick={() => !row.isMe && setH2hTarget(row.username)}
            >
              {row.teamName}{row.isMe&&<span style={{color:"#444",fontWeight:"normal"}}> (You)</span>}
            </span>
            <span style={{ fontSize:"0.7rem", color:"#444" }}>{row.picksMade}/{fixtures.length}</span>
            <span style={{ fontSize:"1.05rem", fontWeight:"bold", color:"#22c55e", minWidth:45, textAlign:"right" }}>
              {row.score}<span style={{fontSize:"0.6rem",color:"#444"}}> pts</span>
            </span>
          </div>
        ))}
        {rows.length===0&&(
          <div style={{textAlign:"center",padding:"2.5rem",color:"#333"}}>
            No players yet — share the invite code!
          </div>
        )}
      </div>

      {me&&(
        <div>
          <div style={{fontSize:"0.72rem",fontWeight:"bold",color:PURPLE,marginBottom:"0.5rem",letterSpacing:"0.5px"}}>
            YOUR GAMEWEEK BREAKDOWN
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:4,
            background:"#161b22", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"0.75rem" }}>
            {Array.from({length:Math.min(totalGws, 38)},(_,i)=>i+1).map(g=>{
              const b=me.byGw[g]||{correct:0,total:0};
              return (
                <div key={g} style={{textAlign:"center"}}>
                  <div style={{fontSize:"0.55rem",color:"#444",marginBottom:2}}>GW{g}</div>
                  <div style={{fontSize:"0.9rem",fontWeight:"bold",color:b.correct>0?"#22c55e":"#333"}}>
                    {b.correct}
                  </div>
                  <div style={{fontSize:"0.5rem",color:"#333"}}>/{b.total}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.5rem",fontSize:"0.65rem",color:"#444"}}>
            <span>{me.score} pts</span>
            <span>{me.picksMade}/{fixtures.length} picks made</span>
          </div>
        </div>
      )}

      {h2hTarget && (
        <HeadToHead 
          fixtures={fixtures}
          members={members}
          username={username}
          results={results}
          onClose={() => setH2hTarget(null)}
        />
      )}
    </div>
  );
}