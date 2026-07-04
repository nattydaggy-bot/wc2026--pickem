// src/utils/scoring.js
// Scoring engine for WC2026 Pick'em
// Exports: ROUND_META, ROUND_ORDER, KNOCKOUT_ROUNDS, MAX_SCORE,
//          buildResults, enrichByWinners, calcMemberScore, tournamentStatus

export const ROUND_META = {
  group: { label:"Group Stage",    short:"GS",  points:3,  color:"#3CAC3B" },
  r32:   { label:"Round of 32",    short:"R32", points:5,  color:"#2A398D" },
  r16:   { label:"Round of 16",    short:"R16", points:7,  color:"#C9A84C" },
  qf:    { label:"Quarter-Finals", short:"QF",  points:9,  color:"#E07A1F" },
  sf:    { label:"Semi-Finals",    short:"SF",  points:10, color:"#E61D25" },
  "3rd": { label:"3rd Place",      short:"3P",  points:12, color:"#8a8a8a" },
  final: { label:"Final",          short:"F",   points:15, color:"#C9A84C" },
};
export const ROUND_ORDER    = ["group","r32","r16","qf","sf","3rd","final"];
export const KNOCKOUT_ROUNDS = new Set(["r32","r16","qf","sf","3rd","final"]);
export const MAX_SCORE      = 435;

// -- Team name normalisation ----------------------------------------
export function normalizeTeam(name = "") {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

const ALIASES = {
  "united states": "usa", "us": "usa",
  "korea republic": "south korea", "republic of korea": "south korea",
  "ir iran": "iran",
  "czech republic": "czechia",
  "cote divoire": "ivory coast", "ivory coast cote divoire": "ivory coast",
  "cabo verde": "cape verde",
  "bosnia and herzegovina": "bosnia herzegovina",
  "bosniaherzegovina": "bosnia herzegovina",
  "congo dr": "dr congo",
  "democratic republic of congo": "dr congo",
  "democratic republic of the congo": "dr congo",
  "curacao": "curacao",
  "turkey": "turkey", "turkiye": "turkey",
};

export function canonicalTeam(name) {
  const n = normalizeTeam(name);
  return ALIASES[n] || n;
}

export function pairKey(a, b) {
  return [canonicalTeam(a), canonicalTeam(b)].sort().join("|");
}

// -- Build { fixtureId: result } from raw ESPN events ---------------
export function buildResults(events = [], fixtures = []) {
  const byPairKey = {};
  events.forEach(ev => {
    const comp = ev.competitions?.[0];
    if (!comp) return;
    const h = comp.competitors?.find(c => c.homeAway === "home");
    const a = comp.competitors?.find(c => c.homeAway === "away");
    if (!h || !a) return;
    const key = pairKey(h.team?.displayName || "", a.team?.displayName || "");
    byPairKey[key] = {
      homeName:   h.team?.displayName || "",
      awayName:   a.team?.displayName || "",
      homeScore:  h.score != null ? parseInt(h.score, 10) : null,
      awayScore:  a.score != null ? parseInt(a.score, 10) : null,
      homeWinner: h.winner === true,
      awayWinner: a.winner === true,
      completed:  comp.status?.type?.completed || false,
      state:      comp.status?.type?.state     || "pre",
      status:     comp.status?.type?.shortDetail || "",
    };
  });

  const results = {};
  fixtures.forEach(f => {
    if (!f.home || !f.away) return;
    // Skip placeholder fixtures — they can't match ESPN events yet
    if (/^(Winner|Loser|TBD)/i.test(f.home) || /^(Winner|Loser|TBD)/i.test(f.away)) return;
    const key = pairKey(f.home, f.away);
    const ev  = byPairKey[key];
    if (!ev) return;
    const flipped    = canonicalTeam(ev.homeName) !== canonicalTeam(f.home);
    const homeScore  = flipped ? ev.awayScore  : ev.homeScore;
    const awayScore  = flipped ? ev.homeScore  : ev.awayScore;
    const homeWinner = flipped ? ev.awayWinner : ev.homeWinner;
    const awayWinner = flipped ? ev.homeWinner : ev.awayWinner;
    let actual = null;
    if (ev.completed) {
      if (homeWinner)                                    actual = "home";
      else if (awayWinner)                               actual = "away";
      else if (homeScore != null && awayScore != null)
        actual = homeScore === awayScore ? "draw"
               : homeScore > awayScore   ? "home" : "away";
    }
    results[f.id] = { homeScore, awayScore, completed: ev.completed,
                      state: ev.state, status: ev.status, actual };
  });
  return results;
}

// -- Auto-cascade bracket: "Winner M86" -> "Argentina" -> QF -> SF -> Final
//
// Multi-pass algorithm:
//   Pass 1: R32 fixtures have real names -> build winner map
//           -> substitute "Winner M73..M88" in R16 fixtures
//   Pass 2: R16 fixtures now have real names -> rebuild results from ESPN
//           -> build R16 winner map -> fill QF "Winner M89..M96"
//   Pass 3: QF -> SF   Pass 4: SF -> Final + 3rd place
//
// This runs automatically on every 60-second ESPN refresh, so the
// bracket updates the moment ESPN marks a match as completed.
export function enrichByWinners(fixtures, espnEvents = []) {
  if (!espnEvents.length) return fixtures;

  // Parse "Winner M86"  -> { type:"winner", id:"m086" }
  // Parse "Loser M101"  -> { type:"loser",  id:"m101" }
  function parseRef(label = "") {
    if (!label) return null;
    const wm = label.match(/^Winner\s+M?0*(\d+)$/i);
    if (wm) return { type: "winner", id: "m" + String(wm[1]).padStart(3, "0") };
    const lm = label.match(/^Loser\s+M?0*(\d+)$/i);
    if (lm) return { type: "loser",  id: "m" + String(lm[1]).padStart(3, "0") };
    return null;
  }

  let current = fixtures.map(f => ({ ...f }));

  for (let pass = 0; pass < 6; pass++) {
    // Rebuild results using current fixture names (resolves newly-filled slots)
    const liveResults = buildResults(espnEvents, current);

    // Build winner/loser maps from all completed fixtures that have real names
    const winnerMap = {}, loserMap = {};
    current.forEach(f => {
      const r = liveResults[f.id];
      if (!r?.completed || !r.actual) return;
      if (parseRef(f.home) || parseRef(f.away)) return; // not real names yet
      if (r.actual === "home") { winnerMap[f.id] = f.home; loserMap[f.id] = f.away; }
      if (r.actual === "away") { winnerMap[f.id] = f.away; loserMap[f.id] = f.home; }
    });

    // Substitute placeholders with real team names
    let changed = false;
    current = current.map(f => {
      const homeRef = parseRef(f.home);
      const awayRef = parseRef(f.away);
      if (!homeRef && !awayRef) return f;

      const resolve = ref => ref
        ? (ref.type === "winner" ? winnerMap[ref.id] : loserMap[ref.id]) ?? null
        : null;

      const newHome = homeRef ? (resolve(homeRef) ?? f.home) : f.home;
      const newAway = awayRef ? (resolve(awayRef) ?? f.away) : f.away;

      if (newHome !== f.home || newAway !== f.away) {
        changed = true;
        return { ...f, home: newHome, away: newAway };
      }
      return f;
    });

    if (!changed) break; // stable — no more known winners to propagate
  }

  return current;
}

// -- Score calculation -----------------------------------------------
export function calcMemberScore(picks = {}, fixtures = [], results = {}, roundMeta = {}) {
  let score = 0, picksMade = 0;
  const breakdown = {};
  Object.keys(roundMeta).forEach(r => { breakdown[r] = { correct: 0, total: 0, points: 0 }; });
  fixtures.forEach(f => {
    if (picks[f.id]) picksMade++;
    if (breakdown[f.round]) breakdown[f.round].total++;
    const meta = roundMeta[f.round] || { points: 0 };
    const r    = results[f.id];
    if (r && r.actual && picks[f.id] === r.actual) {
      score += meta.points;
      if (breakdown[f.round]) {
        breakdown[f.round].correct++;
        breakdown[f.round].points += meta.points;
      }
    }
  });
  return { score, picksMade, breakdown };
}

// -- Tournament status (for header badge) ---------------------------
export function tournamentStatus(results = {}, totalFixtures = 104) {
  const completed = Object.values(results).filter(r => r.completed).length;
  const live      = Object.values(results).filter(r => r.state === "in").length;
  if (live > 0)              return { label: "live",          completed, live };
  if (completed === 0)       return { label: "pre-tournament", completed, live };
  if (completed < totalFixtures) return { label: "in progress",  completed, live };
  return                          { label: "completed",        completed, live };
}
