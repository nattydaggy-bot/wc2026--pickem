// src/utils/scoring.js
// Handles: normalizing team names, matching ESPN events to our fixtures,
// and calculating each member's score based on correct picks.

// ── Normalize a team name for comparison ──────────────────────────────
export function normalizeTeam(name = "") {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")  // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// ── Known ESPN name → our canonical fixture name ───────────────────────
// If a score doesn't match up, add the ESPN name (normalized) here.
const ALIASES = {
  "united states": "usa",
  "us": "usa",
  "korea republic": "south korea",
  "republic of korea": "south korea",
  "ir iran": "iran",
  "islamic republic of iran": "iran",
  "czech republic": "czechia",
  "cote divoire": "ivory coast",
  "ivory coast cote divoire": "ivory coast",
  "cabo verde": "cape verde",
  "bosnia and herzegovina": "bosnia herzegovina",
  "bosniaherzegovina": "bosnia herzegovina",
  "congo dr": "dr congo",
  "dr congo": "dr congo",
  "democratic republic of congo": "dr congo",
  "democratic republic of the congo": "dr congo",
  "trinidad tobago": "trinidad and tobago",
  "curacao": "curacao",
};

export function canonicalTeam(name) {
  const n = normalizeTeam(name);
  return ALIASES[n] || n;
}

// Order-independent key used to find the same fixture regardless of
// which side ESPN lists as "home" vs "away".
export function pairKey(a, b) {
  return [canonicalTeam(a), canonicalTeam(b)].sort().join("|");
}

// ── Build a { [fixtureId]: result } map from ESPN scoreboard events ────
// result = { homeScore, awayScore, completed, state, status, actual }
// homeScore/awayScore are oriented to OUR fixture's home/away order.
// actual = "home" | "draw" | "away" | null (null = not decided yet)
export function buildResults(events = [], fixtures = []) {
  const byPairKey = {};

  events.forEach(ev => {
    const comp = ev.competitions?.[0];
    if (!comp) return;
    const home = comp.competitors?.find(c => c.homeAway === "home");
    const away = comp.competitors?.find(c => c.homeAway === "away");
    if (!home || !away) return;

    const homeName = home.team?.displayName || home.team?.name || "";
    const awayName = away.team?.displayName || away.team?.name || "";
    const key = pairKey(homeName, awayName);

    byPairKey[key] = {
      homeName, awayName,
      homeScore: home.score != null ? parseInt(home.score, 10) : null,
      awayScore: away.score != null ? parseInt(away.score, 10) : null,
      homeWinner: home.winner === true,
      awayWinner: away.winner === true,
      completed: comp.status?.type?.completed || false,
      state:     comp.status?.type?.state || "pre",   // pre | in | post
      status:    comp.status?.type?.shortDetail || "",
    };
  });

  const results = {};
  fixtures.forEach(f => {
    if (!f.home || !f.away) return;
    if (String(f.home).startsWith("TBD") || String(f.away).startsWith("TBD")) return;

    const key = pairKey(f.home, f.away);
    const ev = byPairKey[key];
    if (!ev) return;

    // Does ESPN's "home" line up with OUR fixture's "home"?
    const flipped = canonicalTeam(ev.homeName) !== canonicalTeam(f.home);

    const homeScore = flipped ? ev.awayScore : ev.homeScore;
    const awayScore = flipped ? ev.homeScore : ev.awayScore;
    const homeWinner = flipped ? ev.awayWinner : ev.homeWinner;
    const awayWinner = flipped ? ev.homeWinner : ev.awayWinner;

    let actual = null;
    if (ev.completed) {
      if (homeWinner) actual = "home";
      else if (awayWinner) actual = "away";
      else if (homeScore != null && awayScore != null) {
        actual = homeScore === awayScore ? "draw" : (homeScore > awayScore ? "home" : "away");
      }
    }

    results[f.id] = {
      homeScore, awayScore,
      completed: ev.completed,
      state: ev.state,
      status: ev.status,
      actual,
    };
  });

  return results;
}

// ── Calculate one member's total score + per-round breakdown ───────────
export function calcMemberScore(picks = {}, fixtures = [], results = {}, roundMeta = {}) {
  let score = 0;
  let picksMade = 0;
  const breakdown = {};
  Object.keys(roundMeta).forEach(r => { breakdown[r] = { correct: 0, total: 0, points: 0 }; });

  fixtures.forEach(f => {
    if (picks[f.id]) picksMade++;
    if (breakdown[f.round]) breakdown[f.round].total++;

    const meta = roundMeta[f.round] || { points: 0 };
    const r = results[f.id];
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

// ── Overall tournament status, based on how many fixtures are decided ──
export function tournamentStatus(results = {}, totalFixtures = 104) {
  const completed = Object.values(results).filter(r => r.completed).length;
  const live = Object.values(results).filter(r => r.state === "in").length;
  if (live > 0) return { label: "live", completed, live };
  if (completed === 0) return { label: "pre-tournament", completed, live };
  if (completed < totalFixtures) return { label: "in progress", completed, live };
  return { label: "completed", completed, live };
}

// ── Round metadata (label + points per correct pick) ───────────────────
// Matches the official scoring table: GS 3 · R32 5 · R16 7 · QF 9 · SF 10 · 3rd 12 · Final 15
// Total possible = 72*3 + 16*5 + 8*7 + 4*9 + 2*10 + 1*12 + 1*15 = 435
export const ROUND_META = {
  group: { label: "Group Stage",    short: "GS",    points: 3  },
  r32:   { label: "Round of 32",    short: "R32",   points: 5  },
  r16:   { label: "Round of 16",    short: "R16",   points: 7  },
  qf:    { label: "Quarter-Finals", short: "QF",    points: 9  },
  sf:    { label: "Semi-Finals",    short: "SF",    points: 10 },
  "3rd": { label: "3rd Place",      short: "3P",    points: 12 },
  final: { label: "Final",          short: "F",     points: 15 },
};

export const ROUND_ORDER = ["group","r32","r16","qf","sf","3rd","final"];
export const MAX_SCORE = 435; // for the standard 104-fixture WC2026 format
