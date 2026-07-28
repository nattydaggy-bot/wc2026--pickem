import { useState, useMemo } from "react";
import { matchHasStarted } from "../utils/scoring";
const GREEN="#00ff85"; const PURPLE="#37003c";

function Logo({logo,short,color}){
  return logo
    ? <img src={logo} alt={short} style={{width:36,height:36,objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>
    : <div style={{width:36,height:36,borderRadius:8,background:color?`${color}33`:"rgba(255,255,255,0.08)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:"0.6rem",fontWeight:"bold",color:"rgba(255,255,255,0.5)"}}>
        {short}
      </div>;
}

function MatchCard({match,pick,result,onPick}){
  const started=matchHasStarted(match,result);
  const isLive =result?.state==="in";
  const isFT   =result?.completed;
  const actual =result?.actual;

  const btnStyle=(v)=>({
    flex:1,padding:"0.42rem 0.1rem",borderRadius:7,cursor:started&&!isFT?"default":"pointer",
    border:`1px solid ${
      pick===v?(isFT?(pick===actual?GREEN:"#ef4444"):GREEN):"rgba(255,255,255,0.08)"}`,
    background: pick===v?(isFT?(pick===actual?"rgba(0,255,133,0.15)":"rgba(239,68,68,0.13)"):"rgba(0,255,133,0.1)"):"rgba(255,255,255,0.02)",
    color: pick===v?(isFT?(pick===actual?GREEN:"#f87171"):GREEN):"rgba(255,255,255,0.35)",
    fontSize:"0.65rem",fontWeight:pick===v?"bold":"normal",
    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
    transition:"all 0.12s",
  });

  return(
    <div style={{background:"rgba(55,0,60,0.4)",border:`1px solid ${pick?"rgba(0,255,133,0.25)":"rgba(255,255,255,0.05)"}`,
      borderLeft:`3px solid ${pick?(isFT?(pick===actual?GREEN:"#ef4444"):GREEN):"transparent"}`,
      borderRadius:10,marginBottom:"0.5rem",overflow:"hidden",backdropFilter:"blur(4px)"}}>

      {/* Meta bar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"0.4rem 0.75rem",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <span style={{fontSize:"0.62rem",background:"rgba(0,255,133,0.1)",color:GREEN,
          padding:"1px 7px",borderRadius:4,fontWeight:"bold"}}>
          {match.gw?`GW${match.gw}`:"—"}
        </span>
        <span style={{fontSize:"0.65rem",color:isLive?GREEN:isFT?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.25)"}}>
          {isLive?`🔴 ${result.homeScore}–${result.awayScore}`
          :isFT?`FT  ${result.homeScore}–${result.awayScore}`
          :`${match.time} ET`}
        </span>
      </div>

      {/* Teams */}
      <div style={{display:"flex",alignItems:"center",padding:"0.6rem 0.5rem 0.35rem"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <Logo logo={match.homeLogo} short={match.homeShort} color={match.homeColor}/>
          <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.7)",textAlign:"center"}}>
            {match.home?.length>12?match.homeShort:match.home}
          </span>
        </div>
        <div style={{color:"rgba(255,255,255,0.2)",fontSize:"0.7rem",fontWeight:"bold",padding:"0 0.4rem"}}>VS</div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <Logo logo={match.awayLogo} short={match.awayShort} color={match.awayColor}/>
          <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.7)",textAlign:"center"}}>
            {match.away?.length>12?match.awayShort:match.away}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{display:"flex",gap:4,padding:"0.35rem 0.6rem 0.55rem"}}>
        <button style={btnStyle("home")} onClick={()=>!started&&onPick("home")}>
          {match.homeShort} Win
        </button>
        <button style={btnStyle("draw")} onClick={()=>!started&&onPick("draw")}>
          Draw
        </button>
        <button style={btnStyle("away")} onClick={()=>!started&&onPick("away")}>
          {match.awayShort} Win
        </button>
      </div>
      {started&&!isFT&&<div style={{textAlign:"center",fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",paddingBottom:"0.4rem"}}>
        Match in progress — picking locked
      </div>}
    </div>
  );
}

export default function FixturesTab({fixtures,picks,results,onPick}){
  const allGws=useMemo(()=>[...new Set(fixtures.map(f=>f.gw).filter(g=>g!=null&&g>0))].sort((a,b)=>a-b),[fixtures]);
  const today=new Date().toISOString().split("T")[0];

  // Find the current GW (first GW with upcoming or live fixtures)
  const defaultGw=useMemo(()=>{
    for(const g of allGws){
      const fs=fixtures.filter(f=>f.gw===g);
      if(fs.some(f=>results[f.id]?.state==="in")||fs.some(f=>f.date>=today))return g;
    }
    return allGws[allGws.length-1]||allGws[0]||null;
  },[allGws,fixtures,today,results]);

  const [activeGw,setActiveGw]=useState(null);
  const gw=activeGw??defaultGw;

  const gwFixtures=useMemo(()=>
    fixtures.filter(f=>f.gw===gw).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),
  [fixtures,gw]);

  const pickedCount=Object.keys(picks).length;

  return(
    <div style={{padding:"0.75rem"}}>

      {/* Progress */}
      <div style={{marginBottom:"0.75rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.3)"}}>Season picks</span>
          <span style={{fontSize:"0.65rem",color:GREEN}}>{pickedCount}/{fixtures.length}</span>
        </div>
        <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
          <div style={{width:`${(pickedCount/Math.max(fixtures.length,1))*100}%`,height:"100%",background:GREEN,borderRadius:2,transition:"width 0.3s"}}/>
        </div>
      </div>

      {/* GW scroller */}
      {allGws.length>0&&(
        <div style={{overflowX:"auto",display:"flex",gap:5,paddingBottom:8,marginBottom:8}}>
          {allGws.map(g=>(
            <button key={g} onClick={()=>setActiveGw(g)} style={{
              flexShrink:0,padding:"0.28rem 0.65rem",borderRadius:16,border:"1px solid",
              borderColor:g===gw?GREEN:"rgba(255,255,255,0.08)",
              background:g===gw?`${GREEN}18`:"transparent",
              color:g===gw?GREEN:"rgba(255,255,255,0.35)",
              fontSize:"0.68rem",cursor:"pointer",fontWeight:g===gw?"bold":"normal",
            }}>GW{g}</button>
          ))}
        </div>
      )}

      {gwFixtures.length===0
        ? <div style={{textAlign:"center",padding:"4rem 1rem",color:"rgba(255,255,255,0.2)"}}>
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>⚽</div>
            {allGws.length===0
              ? "Fixtures loading — ESPN schedule not yet published for 2026/27. Check back in August."
              : `No fixtures for GW${gw}`}
          </div>
        : gwFixtures.map(m=>(
          <MatchCard key={m.id} match={m} pick={picks[m.id]}
            result={results[m.id]} onPick={pred=>onPick(m.id,pred)}/>
        ))
      }
    </div>
  );
}
