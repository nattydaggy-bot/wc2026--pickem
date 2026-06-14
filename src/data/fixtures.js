// src/data/fixtures.js
// FIFA World Cup 2026 — All 104 Fixtures
// Times are in ET (Eastern Time).
// Knockout home/away show as "TBD (...)" until group stage completes —
// update these manually as teams qualify.

export const FIXTURES = [

  // ════════════════════════════════════════════════════════════════════
  //  GROUP STAGE  (June 11 – June 27) — 72 matches
  // ════════════════════════════════════════════════════════════════════

  // ── GROUP A: Mexico · South Korea · Czechia · South Africa ──────────
  { id:"m001", round:"group", group:"A", date:"2026-06-11", time:"15:00", home:"Mexico",              away:"South Africa",         venue:"Estadio Azteca, Mexico City" },
  { id:"m002", round:"group", group:"A", date:"2026-06-11", time:"22:00", home:"South Korea",         away:"Czechia",              venue:"Estadio Akron, Guadalajara" },
  { id:"m003", round:"group", group:"A", date:"2026-06-18", time:"12:00", home:"Czechia",             away:"South Africa",         venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m004", round:"group", group:"A", date:"2026-06-18", time:"23:00", home:"Mexico",              away:"South Korea",          venue:"Estadio Akron, Guadalajara" },
  { id:"m005", round:"group", group:"A", date:"2026-06-24", time:"21:00", home:"Czechia",             away:"Mexico",               venue:"Estadio Azteca, Mexico City" },
  { id:"m006", round:"group", group:"A", date:"2026-06-24", time:"21:00", home:"South Africa",        away:"South Korea",          venue:"Estadio BBVA, Monterrey" },

  // ── GROUP B: Switzerland · Canada · Qatar · Bosnia & Herzegovina ─────
  { id:"m007", round:"group", group:"B", date:"2026-06-12", time:"15:00", home:"Canada",              away:"Bosnia & Herzegovina", venue:"BMO Field, Toronto" },
  { id:"m008", round:"group", group:"B", date:"2026-06-13", time:"15:00", home:"Qatar",               away:"Switzerland",          venue:"Levi's Stadium, Santa Clara" },
  { id:"m009", round:"group", group:"B", date:"2026-06-18", time:"15:00", home:"Switzerland",         away:"Bosnia & Herzegovina", venue:"SoFi Stadium, Los Angeles" },
  { id:"m010", round:"group", group:"B", date:"2026-06-18", time:"18:00", home:"Canada",              away:"Qatar",                venue:"BC Place, Vancouver" },
  { id:"m011", round:"group", group:"B", date:"2026-06-24", time:"15:00", home:"Switzerland",         away:"Canada",               venue:"BC Place, Vancouver" },
  { id:"m012", round:"group", group:"B", date:"2026-06-24", time:"15:00", home:"Bosnia & Herzegovina",away:"Qatar",                venue:"Lumen Field, Seattle" },

  // ── GROUP C: Brazil · Morocco · Scotland · Haiti ─────────────────────
  { id:"m013", round:"group", group:"C", date:"2026-06-13", time:"21:00", home:"Brazil",              away:"Morocco",              venue:"MetLife Stadium, East Rutherford" },
  { id:"m014", round:"group", group:"C", date:"2026-06-14", time:"15:00", home:"Scotland",            away:"Haiti",                venue:"AT&T Stadium, Arlington" },
  { id:"m015", round:"group", group:"C", date:"2026-06-19", time:"18:00", home:"Scotland",            away:"Morocco",              venue:"Gillette Stadium, Foxborough" },
  { id:"m016", round:"group", group:"C", date:"2026-06-19", time:"21:00", home:"Brazil",              away:"Haiti",                venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m017", round:"group", group:"C", date:"2026-06-25", time:"18:00", home:"Brazil",              away:"Scotland",             venue:"SoFi Stadium, Los Angeles" },
  { id:"m018", round:"group", group:"C", date:"2026-06-25", time:"18:00", home:"Haiti",               away:"Morocco",              venue:"Arrowhead Stadium, Kansas City" },

  // ── GROUP D: USA · Turkey · Australia · Paraguay ──────────────────────
  { id:"m019", round:"group", group:"D", date:"2026-06-12", time:"21:00", home:"USA",                 away:"Paraguay",             venue:"SoFi Stadium, Los Angeles" },
  { id:"m020", round:"group", group:"D", date:"2026-06-13", time:"18:00", home:"Australia",           away:"Turkey",               venue:"NRG Stadium, Houston" },
  { id:"m021", round:"group", group:"D", date:"2026-06-19", time:"15:00", home:"USA",                 away:"Australia",            venue:"Lumen Field, Seattle" },
  { id:"m022", round:"group", group:"D", date:"2026-06-20", time:"00:00", home:"Turkey",              away:"Paraguay",             venue:"Levi's Stadium, Santa Clara" },
  { id:"m023", round:"group", group:"D", date:"2026-06-25", time:"21:00", home:"USA",                 away:"Turkey",               venue:"AT&T Stadium, Arlington" },
  { id:"m024", round:"group", group:"D", date:"2026-06-25", time:"21:00", home:"Paraguay",            away:"Australia",            venue:"Lincoln Financial Field, Philadelphia" },

  // ── GROUP E: Germany · Ecuador · Ivory Coast · Curaçao ───────────────
  { id:"m025", round:"group", group:"E", date:"2026-06-14", time:"13:00", home:"Germany",             away:"Curaçao",              venue:"NRG Stadium, Houston" },
  { id:"m026", round:"group", group:"E", date:"2026-06-14", time:"19:00", home:"Ivory Coast",         away:"Ecuador",              venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m027", round:"group", group:"E", date:"2026-06-20", time:"16:00", home:"Germany",             away:"Ivory Coast",          venue:"BMO Field, Toronto" },
  { id:"m028", round:"group", group:"E", date:"2026-06-20", time:"20:00", home:"Ecuador",             away:"Curaçao",              venue:"Arrowhead Stadium, Kansas City" },
  { id:"m029", round:"group", group:"E", date:"2026-06-25", time:"15:00", home:"Ecuador",             away:"Germany",              venue:"MetLife Stadium, East Rutherford" },
  { id:"m030", round:"group", group:"E", date:"2026-06-25", time:"15:00", home:"Curaçao",             away:"Ivory Coast",          venue:"BC Place, Vancouver" },

  // ── GROUP F: Netherlands · Japan · Sweden · Tunisia ──────────────────
  { id:"m031", round:"group", group:"F", date:"2026-06-14", time:"16:00", home:"Netherlands",         away:"Japan",                venue:"AT&T Stadium, Arlington" },
  { id:"m032", round:"group", group:"F", date:"2026-06-14", time:"22:00", home:"Sweden",              away:"Tunisia",              venue:"Estadio BBVA, Monterrey" },
  { id:"m033", round:"group", group:"F", date:"2026-06-20", time:"13:00", home:"Netherlands",         away:"Sweden",               venue:"NRG Stadium, Houston" },
  { id:"m034", round:"group", group:"F", date:"2026-06-20", time:"22:00", home:"Tunisia",             away:"Japan",                venue:"Estadio Akron, Guadalajara" },
  { id:"m035", round:"group", group:"F", date:"2026-06-26", time:"18:00", home:"Netherlands",         away:"Tunisia",              venue:"Gillette Stadium, Foxborough" },
  { id:"m036", round:"group", group:"F", date:"2026-06-26", time:"18:00", home:"Japan",               away:"Sweden",               venue:"Arrowhead Stadium, Kansas City" },

  // ── GROUP G: Belgium · Iran · Egypt · New Zealand ────────────────────
  { id:"m037", round:"group", group:"G", date:"2026-06-15", time:"18:00", home:"Belgium",             away:"Egypt",                venue:"Lumen Field, Seattle" },
  { id:"m038", round:"group", group:"G", date:"2026-06-15", time:"21:00", home:"Iran",                away:"New Zealand",          venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m039", round:"group", group:"G", date:"2026-06-21", time:"15:00", home:"Belgium",             away:"New Zealand",          venue:"SoFi Stadium, Los Angeles" },
  { id:"m040", round:"group", group:"G", date:"2026-06-21", time:"18:00", home:"Iran",                away:"Egypt",                venue:"NRG Stadium, Houston" },
  { id:"m041", round:"group", group:"G", date:"2026-06-26", time:"21:00", home:"Belgium",             away:"Iran",                 venue:"MetLife Stadium, East Rutherford" },
  { id:"m042", round:"group", group:"G", date:"2026-06-26", time:"21:00", home:"New Zealand",         away:"Egypt",                venue:"AT&T Stadium, Arlington" },

  // ── GROUP H: Spain · Uruguay · Saudi Arabia · Cape Verde ─────────────
  { id:"m043", round:"group", group:"H", date:"2026-06-15", time:"12:00", home:"Spain",               away:"Cape Verde",           venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m044", round:"group", group:"H", date:"2026-06-15", time:"18:00", home:"Saudi Arabia",        away:"Uruguay",              venue:"Hard Rock Stadium, Miami" },
  { id:"m045", round:"group", group:"H", date:"2026-06-21", time:"12:00", home:"Spain",               away:"Saudi Arabia",         venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m046", round:"group", group:"H", date:"2026-06-21", time:"18:00", home:"Uruguay",             away:"Cape Verde",           venue:"NRG Stadium, Houston" },
  { id:"m047", round:"group", group:"H", date:"2026-06-26", time:"20:00", home:"Spain",               away:"Uruguay",              venue:"Estadio Akron, Guadalajara" },
  { id:"m048", round:"group", group:"H", date:"2026-06-26", time:"20:00", home:"Saudi Arabia",        away:"Cape Verde",           venue:"Levi's Stadium, Santa Clara" },

  // ── GROUP I: France · Senegal · Norway · Iraq ─────────────────────────
  { id:"m049", round:"group", group:"I", date:"2026-06-16", time:"15:00", home:"France",              away:"Senegal",              venue:"MetLife Stadium, East Rutherford" },
  { id:"m050", round:"group", group:"I", date:"2026-06-16", time:"18:00", home:"Norway",              away:"Iraq",                 venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m051", round:"group", group:"I", date:"2026-06-22", time:"17:00", home:"France",              away:"Iraq",                 venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m052", round:"group", group:"I", date:"2026-06-22", time:"20:00", home:"Norway",              away:"Senegal",              venue:"Gillette Stadium, Foxborough" },
  { id:"m053", round:"group", group:"I", date:"2026-06-27", time:"15:00", home:"France",              away:"Norway",               venue:"Gillette Stadium, Foxborough" },
  { id:"m054", round:"group", group:"I", date:"2026-06-27", time:"15:00", home:"Iraq",                away:"Senegal",              venue:"BMO Field, Toronto" },

  // ── GROUP J: Argentina · Austria · Algeria · Jordan ──────────────────
  { id:"m055", round:"group", group:"J", date:"2026-06-16", time:"21:00", home:"Argentina",           away:"Algeria",              venue:"Arrowhead Stadium, Kansas City" },
  { id:"m056", round:"group", group:"J", date:"2026-06-17", time:"15:00", home:"Austria",             away:"Jordan",               venue:"Lumen Field, Seattle" },
  { id:"m057", round:"group", group:"J", date:"2026-06-22", time:"13:00", home:"Argentina",           away:"Austria",              venue:"AT&T Stadium, Arlington" },
  { id:"m058", round:"group", group:"J", date:"2026-06-22", time:"18:00", home:"Algeria",             away:"Jordan",               venue:"NRG Stadium, Houston" },
  { id:"m059", round:"group", group:"J", date:"2026-06-27", time:"22:00", home:"Argentina",           away:"Jordan",               venue:"AT&T Stadium, Arlington" },
  { id:"m060", round:"group", group:"J", date:"2026-06-27", time:"22:00", home:"Algeria",             away:"Austria",              venue:"Arrowhead Stadium, Kansas City" },

  // ── GROUP K: Portugal · Colombia · DR Congo · Uzbekistan ─────────────
  { id:"m061", round:"group", group:"K", date:"2026-06-17", time:"13:00", home:"Portugal",            away:"DR Congo",             venue:"NRG Stadium, Houston" },
  { id:"m062", round:"group", group:"K", date:"2026-06-17", time:"22:00", home:"Uzbekistan",          away:"Colombia",             venue:"Estadio Azteca, Mexico City" },
  { id:"m063", round:"group", group:"K", date:"2026-06-23", time:"15:00", home:"Portugal",            away:"Uzbekistan",           venue:"SoFi Stadium, Los Angeles" },
  { id:"m064", round:"group", group:"K", date:"2026-06-23", time:"18:00", home:"Colombia",            away:"DR Congo",             venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m065", round:"group", group:"K", date:"2026-06-27", time:"19:30", home:"Portugal",            away:"Colombia",             venue:"MetLife Stadium, East Rutherford" },
  { id:"m066", round:"group", group:"K", date:"2026-06-27", time:"19:30", home:"DR Congo",            away:"Uzbekistan",           venue:"Mercedes-Benz Stadium, Atlanta" },

  // ── GROUP L: England · Croatia · Panama · Ghana ───────────────────────
  { id:"m067", round:"group", group:"L", date:"2026-06-17", time:"16:00", home:"England",             away:"Croatia",              venue:"AT&T Stadium, Arlington" },
  { id:"m068", round:"group", group:"L", date:"2026-06-17", time:"19:00", home:"Ghana",               away:"Panama",               venue:"BMO Field, Toronto" },
  { id:"m069", round:"group", group:"L", date:"2026-06-23", time:"16:00", home:"England",             away:"Ghana",                venue:"Gillette Stadium, Foxborough" },
  { id:"m070", round:"group", group:"L", date:"2026-06-23", time:"19:00", home:"Croatia",             away:"Panama",               venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m071", round:"group", group:"L", date:"2026-06-27", time:"17:00", home:"England",             away:"Panama",               venue:"MetLife Stadium, East Rutherford" },
  { id:"m072", round:"group", group:"L", date:"2026-06-27", time:"17:00", home:"Croatia",             away:"Ghana",                venue:"Lumen Field, Seattle" },

  // ════════════════════════════════════════════════════════════════════
  //  ROUND OF 32  (June 28 – July 2) — 16 matches
  //  ⚠️ Teams are TBD — update home/away as group stage results come in
  // ════════════════════════════════════════════════════════════════════

  { id:"m073", round:"r32", date:"2026-06-28", time:"12:00", home:"TBD (W-A)",  away:"TBD (3rd best)", venue:"MetLife Stadium, East Rutherford" },
  { id:"m074", round:"r32", date:"2026-06-28", time:"16:00", home:"TBD (W-B)",  away:"TBD (3rd best)", venue:"AT&T Stadium, Arlington" },
  { id:"m075", round:"r32", date:"2026-06-28", time:"20:00", home:"TBD (W-C)",  away:"TBD (R-D)",      venue:"SoFi Stadium, Los Angeles" },
  { id:"m076", round:"r32", date:"2026-06-28", time:"22:00", home:"TBD (W-D)",  away:"TBD (R-C)",      venue:"NRG Stadium, Houston" },
  { id:"m077", round:"r32", date:"2026-06-29", time:"12:00", home:"TBD (W-E)",  away:"TBD (3rd best)", venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m078", round:"r32", date:"2026-06-29", time:"16:00", home:"TBD (W-F)",  away:"TBD (3rd best)", venue:"Lumen Field, Seattle" },
  { id:"m079", round:"r32", date:"2026-06-29", time:"20:00", home:"TBD (W-G)",  away:"TBD (R-H)",      venue:"Arrowhead Stadium, Kansas City" },
  { id:"m080", round:"r32", date:"2026-06-29", time:"22:00", home:"TBD (W-H)",  away:"TBD (R-G)",      venue:"Levi's Stadium, Santa Clara" },
  { id:"m081", round:"r32", date:"2026-07-01", time:"12:00", home:"TBD (W-I)",  away:"TBD (3rd best)", venue:"Gillette Stadium, Foxborough" },
  { id:"m082", round:"r32", date:"2026-07-01", time:"16:00", home:"TBD (W-J)",  away:"TBD (3rd best)", venue:"BMO Field, Toronto" },
  { id:"m083", round:"r32", date:"2026-07-01", time:"20:00", home:"TBD (W-K)",  away:"TBD (R-L)",      venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m084", round:"r32", date:"2026-07-01", time:"12:00", home:"TBD (W-L)",  away:"TBD (3rd best)", venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m085", round:"r32", date:"2026-07-02", time:"12:00", home:"TBD (R-A)",  away:"TBD (3rd best)", venue:"BC Place, Vancouver" },
  { id:"m086", round:"r32", date:"2026-07-02", time:"16:00", home:"TBD (R-B)",  away:"TBD (3rd best)", venue:"Hard Rock Stadium, Miami" },
  { id:"m087", round:"r32", date:"2026-07-02", time:"20:00", home:"TBD (R-E)",  away:"TBD (R-F)",      venue:"Estadio Azteca, Mexico City" },
  { id:"m088", round:"r32", date:"2026-07-02", time:"22:00", home:"TBD (R-K)",  away:"TBD (R-J)",      venue:"Estadio Akron, Guadalajara" },

  // ════════════════════════════════════════════════════════════════════
  //  ROUND OF 16  (July 4 – July 5) — 8 matches
  // ════════════════════════════════════════════════════════════════════

  { id:"m089", round:"r16", date:"2026-07-04", time:"13:00", home:"TBD (W-M73)", away:"TBD (W-M74)", venue:"NRG Stadium, Houston" },
  { id:"m090", round:"r16", date:"2026-07-04", time:"17:00", home:"TBD (W-M75)", away:"TBD (W-M76)", venue:"Lincoln Financial Field, Philadelphia" },
  { id:"m091", round:"r16", date:"2026-07-04", time:"20:00", home:"TBD (W-M77)", away:"TBD (W-M78)", venue:"MetLife Stadium, East Rutherford" },
  { id:"m092", round:"r16", date:"2026-07-04", time:"22:00", home:"TBD (W-M79)", away:"TBD (W-M80)", venue:"AT&T Stadium, Arlington" },
  { id:"m093", round:"r16", date:"2026-07-05", time:"13:00", home:"TBD (W-M81)", away:"TBD (W-M82)", venue:"SoFi Stadium, Los Angeles" },
  { id:"m094", round:"r16", date:"2026-07-05", time:"17:00", home:"TBD (W-M83)", away:"TBD (W-M84)", venue:"Lumen Field, Seattle" },
  { id:"m095", round:"r16", date:"2026-07-05", time:"20:00", home:"TBD (W-M85)", away:"TBD (W-M86)", venue:"Mercedes-Benz Stadium, Atlanta" },
  { id:"m096", round:"r16", date:"2026-07-05", time:"22:00", home:"TBD (W-M87)", away:"TBD (W-M88)", venue:"Arrowhead Stadium, Kansas City" },

  // ════════════════════════════════════════════════════════════════════
  //  QUARTER-FINALS  (July 9 – July 10) — 4 matches
  // ════════════════════════════════════════════════════════════════════

  { id:"m097", round:"qf", date:"2026-07-09", time:"15:00", home:"TBD (W-M89)", away:"TBD (W-M90)", venue:"MetLife Stadium, East Rutherford" },
  { id:"m098", round:"qf", date:"2026-07-09", time:"19:00", home:"TBD (W-M91)", away:"TBD (W-M92)", venue:"AT&T Stadium, Arlington" },
  { id:"m099", round:"qf", date:"2026-07-10", time:"15:00", home:"TBD (W-M93)", away:"TBD (W-M94)", venue:"SoFi Stadium, Los Angeles" },
  { id:"m100", round:"qf", date:"2026-07-10", time:"19:00", home:"TBD (W-M95)", away:"TBD (W-M96)", venue:"NRG Stadium, Houston" },

  // ════════════════════════════════════════════════════════════════════
  //  SEMI-FINALS  (July 14 – July 15) — 2 matches
  // ════════════════════════════════════════════════════════════════════

  { id:"m101", round:"sf", date:"2026-07-14", time:"19:00", home:"TBD (W-M97)", away:"TBD (W-M98)", venue:"MetLife Stadium, East Rutherford" },
  { id:"m102", round:"sf", date:"2026-07-15", time:"19:00", home:"TBD (W-M99)", away:"TBD (W-M100)", venue:"AT&T Stadium, Arlington" },

  // ════════════════════════════════════════════════════════════════════
  //  THIRD PLACE  (July 18) — 1 match
  // ════════════════════════════════════════════════════════════════════

  { id:"m103", round:"3rd", date:"2026-07-18", time:"15:00", home:"TBD (L-M101)", away:"TBD (L-M102)", venue:"Hard Rock Stadium, Miami" },

  // ════════════════════════════════════════════════════════════════════
  //  FINAL  (July 19) — 1 match
  // ════════════════════════════════════════════════════════════════════

  { id:"m104", round:"final", date:"2026-07-19", time:"18:00", home:"TBD (W-M101)", away:"TBD (W-M102)", venue:"MetLife Stadium, East Rutherford" },

];

// ── Round metadata (points + display labels + colors) ─────────────────
// Sums to 435 total possible points (216+80+56+36+20+12+15)
export const ROUND_META = {
  group: { label: "Group Stage",    short: "GS",  points: 3,  color: "#4CAF50" },
  r32:   { label: "Round of 32",    short: "R32", points: 5,  color: "#4FC3F7" },
  r16:   { label: "Round of 16",    short: "R16", points: 7,  color: "#FFD54F" },
  qf:    { label: "Quarter-Finals", short: "QF",  points: 9,  color: "#FF9800" },
  sf:    { label: "Semi-Finals",    short: "SF",  points: 10, color: "#F06292" },
  "3rd": { label: "3rd Place",      short: "3P",  points: 12, color: "#FF7043" },
  final: { label: "Final",          short: "F",   points: 15, color: "#C9A84C" },
};

export const ROUND_ORDER = ["group","r32","r16","qf","sf","3rd","final"];

// Convenience map of round -> color (used by filter pills / badges)
export const ROUND_COLORS = Object.fromEntries(
  Object.entries(ROUND_META).map(([key, meta]) => [key, meta.color])
);

// Total points if every single pick were correct (216+80+56+36+20+12+15)
export const MAX_POSSIBLE = FIXTURES.reduce(
  (sum, f) => sum + (ROUND_META[f.round]?.points || 0), 0
);

// ── Group members lookup ─────────────────────────────────────────────
export const GROUPS = {
  A: ["Mexico",      "South Korea", "Czechia",    "South Africa"],
  B: ["Switzerland", "Canada",      "Qatar",      "Bosnia & Herzegovina"],
  C: ["Brazil",      "Morocco",     "Scotland",   "Haiti"],
  D: ["USA",         "Turkey",      "Australia",  "Paraguay"],
  E: ["Germany",     "Ecuador",     "Ivory Coast","Curaçao"],
  F: ["Netherlands", "Japan",       "Sweden",     "Tunisia"],
  G: ["Belgium",     "Iran",        "Egypt",      "New Zealand"],
  H: ["Spain",       "Uruguay",     "Saudi Arabia","Cape Verde"],
  I: ["France",      "Senegal",     "Norway",     "Iraq"],
  J: ["Argentina",   "Austria",     "Algeria",    "Jordan"],
  K: ["Portugal",    "Colombia",    "DR Congo",   "Uzbekistan"],
  L: ["England",     "Croatia",     "Panama",     "Ghana"],
};
