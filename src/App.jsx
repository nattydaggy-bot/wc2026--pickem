import { useState, useEffect, useMemo, useCallback } from "react";
import { createLeague, joinLeague, getMember, leagueExists, savePicks, subscribeToLeague } from "./firebase";
import { buildResults, calcMemberScore, seasonStatus } from "./utils/scoring";
import LeagueEntry  from "./components/LeagueEntry";
import FixturesTab  from "./components/FixturesTab";
import PicksTab     from "./components/PicksTab";
import StandingsTab from "./components/StandingsTab";

const LAST  = "epl_session";
const CACHE = "epl_fixtures_v3";  // bump to clear old cache
const GREEN  = "#00ff85";
const PURPLE = "#37003c";

export default function App() {
  const [view,       setView]       = useState("entry");
  const [activeTab,  setActiveTab]  = useState("fixtures");
  const [leagueCode, setLeagueCode] = useState("");
  const [username,   setUsername]   = useState("");
  const [teamName,   setTeamName]   = useState("");
  const [picks,      setPicks]      = useState({});
  const [members,    setMembers]    = useState({});
  const [fixtures,   setFixtures]   = useState([]);
  const [loadingFix, setLoadingFix] = useState(true);
  const [espnEvents, setEspnEvents] = useState([]);
  const [authError,  setAuthError]  = useState("");
  const [authBusy,   setAuthBusy]   = useState(false);

  /* ── Restore session ── */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LAST)||"null");
      if (s?.code && s?.username) {
        setLeagueCode(s.code); setUsername(s.username);
        setTeamName(s.teamName||s.username); setPicks(s.picks||{});
        setView("app");
      }
    } catch {}
  }, []);

  /* ── Load EPL fixtures (cached 24 h) ── */
  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem(CACHE);
        const ts  = localStorage.getItem(CACHE+"_ts");
        if (raw && ts && Date.now()-+ts < 86400000) {
          setFixtures(JSON.parse(raw)); setLoadingFix(false); return;
        }
        const r = await fetch("/api/fixtures");
        const d = await r.json();
        const fs = d.fixtures||[];
        setFixtures(fs);
        localStorage.setItem(CACHE,       JSON.stringify(fs));
        localStorage.setItem(CACHE+"_ts", String(Date.now()));
      } catch(e) { console.warn("Fixture load failed", e); }
      finally    { setLoadingFix(false); }
    }
    load();
  }, []);

  /* ── ESPN scores (60 s) ── */
  const refreshScores = useCallback(async () => {
    try {
      const r = await fetch("/api/scores");
      if (!r.ok) return;
      setEspnEvents((await r.json()).events||[]);
    } catch {}
  }, []);

  useEffect(() => {
    if (view!=="app") return;
    refreshScores();
    const t = setInterval(refreshScores, 60000);
    return () => clearInterval(t);
  }, [view, refreshScores]);

  /* ── Firestore ── */
  useEffect(() => {
    if (!leagueCode) return;
    return subscribeToLeague(leagueCode, setMembers);
  }, [leagueCode]);

  /* ── Derived ── */
  const results  = useMemo(()=>buildResults(espnEvents,fixtures),[espnEvents,fixtures]);
  const merged   = useMemo(()=>({...members,[username]:{...(members[username]||{}),picks,teamName}}),[members,username,picks,teamName]);
  const myStats  = useMemo(()=>calcMemberScore(picks,fixtures,results),[picks,fixtures,results]);
  const status   = useMemo(()=>seasonStatus(results),[results]);

  function saveSession(code,user,tName,p){
    localStorage.setItem(LAST,JSON.stringify({code,username:user,teamName:tName,picks:p}));
  }

  async function handleCreate({username:u,teamName:t}){
    setAuthBusy(true); setAuthError("");
    try {
      const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code,result,tries=0;
      do{code=Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join("");result=await createLeague(code,u,t);tries++;}
      while(result.error&&tries<6);
      if(result.error)return setAuthError(result.error);
      setLeagueCode(code);setUsername(u);setTeamName(t||u);setPicks({});
      saveSession(code,u,t||u,{});setView("app");
    } finally{setAuthBusy(false);}
  }
  async function handleJoin({code,username:u,teamName:t}){
    setAuthBusy(true);setAuthError("");
    try{
      if(!(await leagueExists(code)))return setAuthError("League not found.");
      const r=await joinLeague(code,u,t);
      if(r.error)return setAuthError(r.error);
      setLeagueCode(code);setUsername(u);setTeamName(t||u);setPicks({});
      saveSession(code,u,t||u,{});setView("app");
    }finally{setAuthBusy(false);}
  }
  async function handleLogin({code:c,username:u}){
    setAuthBusy(true);setAuthError("");
    try{
      const savedCode=c||leagueCode||(JSON.parse(localStorage.getItem(LAST)||"null")?.code);
      if(!savedCode)return setAuthError("No saved league. Please join first.");
      if(!(await leagueExists(savedCode)))return setAuthError("League not found.");
      const member=await getMember(savedCode,u);
      if(!member)return setAuthError("Username not found. Use Join to create your account.");
      const p=member.picks||{};
      setLeagueCode(savedCode);setUsername(u);setTeamName(member.teamName||u);setPicks(p);
      saveSession(savedCode,u,member.teamName||u,p);setView("app");
    }finally{setAuthBusy(false);}
  }
  async function handlePick(matchId,pred){
    const updated={...picks,[matchId]:pred};
    setPicks(updated);saveSession(leagueCode,username,teamName,updated);
    await savePicks(leagueCode,username,updated,teamName);
  }
  function handleLogout(){
    localStorage.removeItem(LAST);
    setView("entry");setLeagueCode("");setUsername("");setTeamName("");setPicks({});setMembers({});
  }

  if(view==="entry") return (
    <LeagueEntry onCreate={handleCreate} onJoin={handleJoin} onLogin={handleLogin}
      busy={authBusy} error={authError} clearError={()=>setAuthError("")}
      savedCode={JSON.parse(localStorage.getItem(LAST)||"null")?.code||""} />
  );

  const TABS=[
    {id:"fixtures", label:"Fixtures", icon:"📅"},
    {id:"picks",    label:"All Picks",icon:"👥"},
    {id:"standings",label:"Standings",icon:"🏆"},
  ];
  const stColor = status.label==="Live"?GREEN : status.label==="In Progress"?"#d4b0ff":"rgba(255,255,255,0.3)";

  return (
    <div style={{minHeight:"100vh",color:"#fff",display:"flex",flexDirection:"column",maxWidth:520,margin:"0 auto",position:"relative"}}>

      {/* Header */}
      <header style={{background:PURPLE,borderBottom:`2px solid ${GREEN}`,
        padding:"0.55rem 0.85rem",display:"flex",justifyContent:"space-between",
        alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.55rem"}}>
          <img src="/logo.svg" alt="EPL" style={{height:26,width:"auto",maxWidth:140,objectFit:"contain",filter:"brightness(0) invert(1)"}}/>
          <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>
            {leagueCode} · {teamName}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"0.95rem",fontWeight:"bold",color:GREEN}}>
            {myStats.score}<span style={{color:"rgba(255,255,255,0.3)",fontSize:"0.7rem"}}>/{fixtures.length}</span>
          </div>
          <div style={{fontSize:"0.6rem",color:stColor}}>{status.label}</div>
          <button onClick={handleLogout} style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",
            background:"none",border:"none",cursor:"pointer",textDecoration:"underline",padding:0}}>
            Log out
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{flex:1,overflowY:"auto",paddingBottom:72}}>
        {loadingFix
          ? <div style={{textAlign:"center",padding:"5rem 1rem",color:"rgba(255,255,255,0.3)"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>⚽</div>
              Loading Premier League fixtures…
            </div>
          : <>
              {activeTab==="fixtures"  && <FixturesTab  fixtures={fixtures} picks={picks} results={results} onPick={handlePick}/>}
              {activeTab==="picks"     && <PicksTab     fixtures={fixtures} members={merged} username={username} results={results}/>}
              {activeTab==="standings" && <StandingsTab fixtures={fixtures} members={merged} username={username} results={results} status={status} leagueCode={leagueCode} onRefresh={refreshScores}/>}
            </>
        }
      </main>

      {/* Bottom nav */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:520,background:PURPLE,
        borderTop:`2px solid ${GREEN}`,display:"flex",zIndex:20}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            flex:1,padding:"0.6rem 0.25rem 0.4rem",border:"none",background:"none",
            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            color: activeTab===t.id?GREEN:"rgba(255,255,255,0.35)",
            borderTop: activeTab===t.id?`2px solid ${GREEN}`:"2px solid transparent",
          }}>
            <span style={{fontSize:"1.25rem"}}>{t.icon}</span>
            <span style={{fontSize:"0.62rem",fontWeight:activeTab===t.id?"bold":"normal"}}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
