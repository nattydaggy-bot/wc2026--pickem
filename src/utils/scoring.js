// src/utils/scoring.js — EPL Pick'em scoring engine

export const POINTS_PER_CORRECT = 1;   // 1 point per correct H / D / A pick
export const TOTAL_GAMEWEEKS    = 38;
export const TOTAL_MATCHES      = 380; // 20 teams × 19 home + 19 away

// -- Team-name normalisation for ESPN matching -------------------------
export function normalizeTeam(name = "") {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

const ALIASES = {
  "man city":                "manchester city",
  "man utd":                 "manchester united",
  "man united":              "manchester united",
  "spurs":                   "tottenham hotspur",
  "tottenham":               "tottenham hotspur",
  "brighton":                "brighton hove albion",
  "brighton & hove albion":  "brighton hove albion",
  "brighton and hove albion":"brighton hove albion",
  "wolves":                  "wolverhampton wanderers",
  "west ham":                "west ham united",
  "newcastle":               "newcastle united",
  "nottm forest":            "nottingham forest",
  "nott'm forest":           "nottingham forest",
  "nffc":                    "nottingham forest",
  "leicester":               "leicester city",
  "ipswich":                 "ipswich town",
  "sunderland afc":          "sunderland",
  "leeds":                   "leeds united",
  "burnley fc":              "burnley",
};

export function canonicalTeam(name) {
  const n = normalizeTeam(name);
  return ALIASES[n] || n;
}

// -- Build result map from raw ESPN events ----------------------------
// Returns { [fixtureId]: { homeScore, awayScore, completed, actual, state, status } }
export function buildResults(events = [], fixtures = []) {
  // Index ESPN events by ESPN event-ID and by sorted team-pair key
  const byId  = {};
  const byKey = {};

  events.forEach(ev => {
    const comp = ev.competitions?.[0];
    if (!comp) return;
    const h = comp.competitors?.find(c => c.homeAway === "home");
    const a = comp.competitors?.find(c => c.homeAway === "away");
    if (!h || !a) return;

    const hName = h.team?.displayName || h.team?.name || "";
    const aName = a.team?.displayName || a.team?.name || "";

    const entry = {
      homeScore:  h.score != null ? parseInt(h.score, 10) : null,
      awayScore:  a.score != null ? parseInt(a.score, 10) : null,
      homeWinner: h.winner === true,
      awayWinner: a.winner === true,
      completed:  comp.status?.type?.completed || false,
      state:      comp.status?.type?.state     || "pre",
      status:     comp.status?.type?.shortDetail || "",
      espnHome:   hName,
      espnAway:   aName,
    };

    byId[ev.id] = entry;
    const key = [canonicalTeam(hName), canonicalTeam(aName)].sort().join("|");
    byKey[key] = entry;
  });

  const results = {};
  fixtures.forEach(f => {
    let ev      = f.espnId ? byId[f.espnId] : null;
    let flipped = false;

    if (!ev && f.home && f.away) {
      const key    = [canonicalTeam(f.home), canonicalTeam(f.away)].sort().join("|");
      const paired = byKey[key];
      if (paired) {
        ev      = paired;
        flipped = canonicalTeam(paired.espnHome) !== canonicalTeam(f.home);
      }
    }
    if (!ev) return;

    const homeScore  = flipped ? ev.awayScore  : ev.homeScore;
    const awayScore  = flipped ? ev.homeScore  : ev.awayScore;
    const homeWinner = flipped ? ev.awayWinner : ev.homeWinner;
    const awayWinner = flipped ? ev.homeWinner : ev.awayWinner;

    let actual = null;
    if (ev.completed) {
      if (homeWinner)      actual = "home";
      else if (awayWinner) actual = "away";
      else if (homeScore != null && awayScore != null)
        actual = homeScore === awayScore ? "draw"
               : homeScore > awayScore   ? "home" : "away";
    }

    results[f.id] = { homeScore, awayScore, completed: ev.completed,
                      state: ev.state, status: ev.status, actual };
  });

  return results;
}

// -- Score calculation (1 pt per correct pick, GW breakdown) ----------
export function calcMemberScore(picks = {}, fixtures = [], results = {}) {
  let score = 0, picksMade = 0;
  const byGw = {};

  fixtures.forEach(f => {
    const gw = f.gw ?? 0;
    if (!byGw[gw]) byGw[gw] = { correct: 0, total: 0, pts: 0 };
    byGw[gw].total++;
    if (picks[f.id]) picksMade++;

    const r = results[f.id];
    if (r?.actual && picks[f.id] === r.actual) {
      score++;
      byGw[gw].correct++;
      byGw[gw].pts++;
    }
  });

  return { score, picksMade, byGw };
}

// -- Has a match started? (for hiding other players' picks) -----------
export function matchHasStarted(fixture, result) {
  if (result?.state === "in" || result?.completed) return true;
  if (!fixture.date || !fixture.time) return false;
  const [h, m] = fixture.time.split(":").map(Number);
  const utcH   = h + 4; // ET = UTC-4 (summer DST)
  const base   = new Date(fixture.date + "T00:00:00Z").getTime();
  const kickoff = base + (utcH < 24 ? utcH : utcH - 24) * 3600000 + m * 60000;
  return Date.now() >= kickoff;
}

// -- Season status for header badge -----------------------------------
export function seasonStatus(results = {}) {
  const completed = Object.values(results).filter(r => r.completed).length;
  const live      = Object.values(results).filter(r => r.state === "in").length;
  if (live > 0)          return { label: "Live",        completed, live };
  if (completed === 0)   return { label: "Pre-Season",  completed, live };
  if (completed < 380)   return { label: "In Progress", completed, live };
  return                        { label: "Season Done", completed, live };
}
