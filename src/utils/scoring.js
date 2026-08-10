// src/utils/scoring.js — EPL Pick'em scoring engine (full version)

export const POINTS_PER_CORRECT = 1;
export const TOTAL_GAMEWEEKS = 38;
export const TOTAL_MATCHES = 380;

export function normalizeTeam(name = "") {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

const ALIASES = {
  "man city": "manchester city",
  "man utd": "manchester united",
  "man united": "manchester united",
  "spurs": "tottenham hotspur",
  "tottenham": "tottenham hotspur",
  "brighton": "brighton hove albion",
  "brighton & hove albion": "brighton hove albion",
  "brighton and hove albion": "brighton hove albion",
  "wolves": "wolverhampton wanderers",
  "west ham": "west ham united",
  "newcastle": "newcastle united",
  "nottm forest": "nottingham forest",
  "nott'm forest": "nottingham forest",
  "nffc": "nottingham forest",
  "leicester": "leicester city",
  "ipswich": "ipswich town",
  "sunderland afc": "sunderland",
  "leeds": "leeds united",
  "burnley fc": "burnley",
};

export function canonicalTeam(name) {
  const n = normalizeTeam(name);
  return ALIASES[n] || n;
}

export function buildResults(events = [], fixtures = []) {
  const byId = {};
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
      homeScore: h.score != null ? parseInt(h.score, 10) : null,
      awayScore: a.score != null ? parseInt(a.score, 10) : null,
      homeWinner: h.winner === true,
      awayWinner: a.winner === true,
      completed: comp.status?.type?.completed || false,
      state: comp.status?.type?.state || "pre",
      status: comp.status?.type?.shortDetail || "",
      espnHome: hName,
      espnAway: aName,
    };

    byId[ev.id] = entry;
    const key = [canonicalTeam(hName), canonicalTeam(aName)].sort().join("|");
    byKey[key] = entry;
  });

  const results = {};
  fixtures.forEach(f => {
    let ev = f.espnId ? byId[f.espnId] : null;
    let flipped = false;

    if (!ev && f.home && f.away) {
      const key = [canonicalTeam(f.home), canonicalTeam(f.away)].sort().join("|");
      const paired = byKey[key];
      if (paired) {
        ev = paired;
        flipped = canonicalTeam(paired.espnHome) !== canonicalTeam(f.home);
      }
    }
    if (!ev) return;

    const homeScore = flipped ? ev.awayScore : ev.homeScore;
    const awayScore = flipped ? ev.homeScore : ev.awayScore;
    const homeWinner = flipped ? ev.awayWinner : ev.homeWinner;
    const awayWinner = flipped ? ev.homeWinner : ev.awayWinner;

    let actual = null;
    if (ev.completed) {
      if (homeWinner) actual = "home";
      else if (awayWinner) actual = "away";
      else if (homeScore != null && awayScore != null)
        actual = homeScore === awayScore ? "draw" : homeScore > awayScore ? "home" : "away";
    }

    results[f.id] = { homeScore, awayScore, completed: ev.completed, state: ev.state, status: ev.status, actual };
  });

  return results;
}

export function calcMemberScore(picks = {}, fixtures = [], results = {}) {
  let score = 0;
  let picksMade = 0;
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

export function calcMemberScoreWithBanker(picks = {}, banker = {}, fixtures = [], results = {}) {
  let score = 0;
  let picksMade = 0;
  const byGw = {};
  let correctStreak = 0;
  let bestStreak = 0;

  const sortedFixtures = [...fixtures].sort((a, b) => (a.gw || 0) - (b.gw || 0) || a.date.localeCompare(b.date));

  sortedFixtures.forEach(f => {
    const gw = f.gw ?? 0;
    if (!byGw[gw]) byGw[gw] = { correct: 0, total: 0, pts: 0 };
    byGw[gw].total++;
    if (picks[f.id]) picksMade++;

    const r = results[f.id];
    const isCorrect = r?.actual && picks[f.id] === r.actual;

    if (isCorrect) {
      const isBanker = banker[gw] === f.id;
      const points = isBanker ? 2 : 1;
      score += points;
      byGw[gw].correct++;
      byGw[gw].pts += points;
      correctStreak++;
      if (correctStreak > bestStreak) bestStreak = correctStreak;
    } else {
      correctStreak = 0;
    }
  });

  return { score, picksMade, byGw, currentStreak: correctStreak, bestStreak };
}

export function matchHasStarted(fixture, result) {
  if (result?.state === "in" || result?.completed) return true;
  if (!fixture.date || !fixture.time) return false;
  const [h, m] = fixture.time.split(":").map(Number);
  const utcH = h + 4;
  const base = new Date(fixture.date + "T00:00:00Z").getTime();
  const kickoff = base + (utcH < 24 ? utcH : utcH - 24) * 3600000 + m * 60000;
  return Date.now() >= kickoff;
}

export function seasonStatus(results = {}) {
  const completed = Object.values(results).filter(r => r.completed).length;
  const live = Object.values(results).filter(r => r.state === "in").length;
  if (live > 0) return { label: "Live", completed, live };
  if (completed === 0) return { label: "Pre-Season", completed, live };
  if (completed < 380) return { label: "In Progress", completed, live };
  return { label: "Season Done", completed, live };
}

// --- New functions for FixturesTab ---
export function calculateTeamForm(teamName, fixtures, results) {
  const form = [];
  const teamCanon = canonicalTeam(teamName);

  const matches = fixtures.filter(f => {
    const homeCanon = canonicalTeam(f.home);
    const awayCanon = canonicalTeam(f.away);
    return (homeCanon === teamCanon || awayCanon === teamCanon) && results[f.id]?.completed;
  });

  matches.sort((a, b) => new Date(b.date) - new Date(a.date));
  const last5 = matches.slice(0, 5);

  last5.forEach(f => {
    const r = results[f.id];
    const homeCanon = canonicalTeam(f.home);
    const isHome = homeCanon === teamCanon;
    const homeScore = r.homeScore;
    const awayScore = r.awayScore;

    let result = 'D';
    if (homeScore !== null && awayScore !== null) {
      if (isHome) {
        result = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
      } else {
        result = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
      }
    }
    form.push(result);
  });

  return form;
}

export function getLeaguePosition(teamName, fixtures, results) {
  const teams = {};

  fixtures.forEach(f => {
    const home = canonicalTeam(f.home);
    const away = canonicalTeam(f.away);
    if (!teams[home]) teams[home] = { name: home, played: 0, won: 0, drawn: 0, lost: 0, pts: 0 };
    if (!teams[away]) teams[away] = { name: away, played: 0, won: 0, drawn: 0, lost: 0, pts: 0 };
  });

  fixtures.forEach(f => {
    const r = results[f.id];
    if (!r?.completed) return;
    const home = canonicalTeam(f.home);
    const away = canonicalTeam(f.away);
    const homeScore = r.homeScore;
    const awayScore = r.awayScore;

    if (homeScore !== null && awayScore !== null) {
      teams[home].played++;
      teams[away].played++;

      if (homeScore > awayScore) {
        teams[home].won++;
        teams[home].pts += 3;
        teams[away].lost++;
      } else if (homeScore < awayScore) {
        teams[away].won++;
        teams[away].pts += 3;
        teams[home].lost++;
      } else {
        teams[home].drawn++;
        teams[home].pts += 1;
        teams[away].drawn++;
        teams[away].pts += 1;
      }
    }
  });

  const sorted = Object.values(teams).sort((a, b) => b.pts - a.pts);
  const pos = sorted.findIndex(t => t.name === canonicalTeam(teamName)) + 1;
  return pos > 0 ? pos : null;
}

export function getGWDeadline(fixtures, gw) {
  const gwFixtures = fixtures.filter(f => f.gw === gw);
  if (gwFixtures.length === 0) return null;

  const earliest = gwFixtures.reduce((earliest, f) => {
    if (!f.utcDate) return earliest;
    const d = new Date(f.utcDate);
    return d < earliest ? d : earliest;
  }, new Date(gwFixtures[0]?.utcDate || Date.now() + 86400000));

  return earliest;
}