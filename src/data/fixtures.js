// src/data/fixtures.js
// Official FIFA World Cup 2026 schedule — all 104 matches
// Times in ET (Eastern Time, UTC-4). Source: worldcuppass.com / Fox Sports
// ★ = 1000th match in FIFA WC history (Tunisia vs Japan)

// -- Round metadata (used by scoring engine & UI) ----------------------
export const ROUND_META = {
  group: { label:"Group Stage",    short:"GS",  points:3,  color:"#3CAC3B" },
  r32:   { label:"Round of 32",    short:"R32", points:5,  color:"#2A398D" },
  r16:   { label:"Round of 16",    short:"R16", points:7,  color:"#C9A84C" },
  qf:    { label:"Quarter-Finals", short:"QF",  points:9,  color:"#E07A1F" },
  sf:    { label:"Semi-Finals",    short:"SF",  points:10, color:"#E61D25" },
  "3rd": { label:"3rd Place",      short:"3P",  points:12, color:"#8a8a8a" },
  final: { label:"Final",          short:"F",   points:15, color:"#C9A84C" },
};
export const ROUND_ORDER = ["group","r32","r16","qf","sf","3rd","final"];
export const ROUND_COLORS = Object.fromEntries(ROUND_ORDER.map(r => [r, ROUND_META[r].color]));
export const MAX_SCORE   = 435; // 72*3+16*5+8*7+4*9+2*10+1*12+1*15

// -- Group membership --------------------------------------------------
export const GROUPS = {
  A: ["Mexico","South Korea","Czechia","South Africa"],
  B: ["Switzerland","Canada","Qatar","Bosnia & Herzegovina"],
  C: ["Brazil","Morocco","Scotland","Haiti"],
  D: ["USA","Türkiye","Australia","Paraguay"],
  E: ["Germany","Ivory Coast","Ecuador","Curaçao"],
  F: ["Netherlands","Japan","Sweden","Tunisia"],
  G: ["Belgium","Iran","Egypt","New Zealand"],
  H: ["Spain","Saudi Arabia","Uruguay","Cabo Verde"],
  I: ["France","Senegal","Iraq","Norway"],
  J: ["Argentina","Algeria","Austria","Jordan"],
  K: ["Portugal","DR Congo","Uzbekistan","Colombia"],
  L: ["England","Croatia","Ghana","Panama"],
};

// ======================================================================
// ALL 104 FIXTURES — times in ET, venues in short form
// ======================================================================
export const FIXTURES = [

  // ---- GROUP STAGE: MATCHDAY 1 (June 11-17) -------------------------

  // Group A
  { id:"m001", round:"group", group:"A", date:"2026-06-11", time:"15:00",
    home:"Mexico",       away:"South Africa",    venue:"Mexico City Stadium" },
  { id:"m002", round:"group", group:"A", date:"2026-06-11", time:"22:00",
    home:"South Korea",  away:"Czechia",          venue:"Guadalajara Stadium" },

  // Group B
  { id:"m007", round:"group", group:"B", date:"2026-06-12", time:"15:00",
    home:"Canada",       away:"Bosnia & Herzegovina", venue:"Toronto Stadium (BMO Field)" },

  // Group D
  { id:"m019", round:"group", group:"D", date:"2026-06-12", time:"21:00",
    home:"USA",          away:"Paraguay",         venue:"Los Angeles Stadium (SoFi)" },

  // Group B
  { id:"m008", round:"group", group:"B", date:"2026-06-13", time:"15:00",
    home:"Qatar",        away:"Switzerland",      venue:"San Francisco Bay Area Stadium (Levi's)" },

  // Group C
  { id:"m013", round:"group", group:"C", date:"2026-06-13", time:"18:00",
    home:"Brazil",       away:"Morocco",          venue:"New York New Jersey Stadium (MetLife)" },
  { id:"m014", round:"group", group:"C", date:"2026-06-13", time:"21:00",
    home:"Haiti",        away:"Scotland",         venue:"Boston Stadium (Gillette)" },

  // Group D — midnight ET = 00:00 start of Jun 14
  { id:"m020", round:"group", group:"D", date:"2026-06-14", time:"00:00",
    home:"Australia",    away:"Türkiye",          venue:"BC Place, Vancouver" },

  // Group E
  { id:"m025", round:"group", group:"E", date:"2026-06-14", time:"13:00",
    home:"Germany",      away:"Curaçao",          venue:"Houston Stadium (NRG)" },

  // Group F
  { id:"m031", round:"group", group:"F", date:"2026-06-14", time:"16:00",
    home:"Netherlands",  away:"Japan",            venue:"Dallas Stadium (AT&T)" },

  // Group E
  { id:"m026", round:"group", group:"E", date:"2026-06-14", time:"19:00",
    home:"Ivory Coast",  away:"Ecuador",          venue:"Philadelphia Stadium (Lincoln Financial)" },

  // Group F
  { id:"m032", round:"group", group:"F", date:"2026-06-14", time:"22:00",
    home:"Sweden",       away:"Tunisia",          venue:"Monterrey Stadium (Estadio BBVA)" },

  // Group H
  { id:"m043", round:"group", group:"H", date:"2026-06-15", time:"12:00",
    home:"Spain",        away:"Cabo Verde",       venue:"Atlanta Stadium (Mercedes-Benz)" },

  // Group G
  { id:"m037", round:"group", group:"G", date:"2026-06-15", time:"15:00",
    home:"Belgium",      away:"Egypt",            venue:"Seattle Stadium (Lumen Field)" },

  // Group H
  { id:"m044", round:"group", group:"H", date:"2026-06-15", time:"18:00",
    home:"Saudi Arabia", away:"Uruguay",          venue:"Miami Stadium (Hard Rock)" },

  // Group G
  { id:"m038", round:"group", group:"G", date:"2026-06-15", time:"21:00",
    home:"Iran",         away:"New Zealand",      venue:"Los Angeles Stadium (SoFi)" },

  // Group I
  { id:"m049", round:"group", group:"I", date:"2026-06-16", time:"15:00",
    home:"France",       away:"Senegal",          venue:"New York New Jersey Stadium (MetLife)" },
  { id:"m050", round:"group", group:"I", date:"2026-06-16", time:"18:00",
    home:"Iraq",         away:"Norway",           venue:"Boston Stadium (Gillette)" },

  // Group J
  { id:"m055", round:"group", group:"J", date:"2026-06-16", time:"21:00",
    home:"Argentina",    away:"Algeria",          venue:"Kansas City Stadium (Arrowhead)" },

  // Group J — midnight ET
  { id:"m056", round:"group", group:"J", date:"2026-06-17", time:"00:00",
    home:"Austria",      away:"Jordan",           venue:"San Francisco Bay Area Stadium (Levi's)" },

  // Group K
  { id:"m061", round:"group", group:"K", date:"2026-06-17", time:"13:00",
    home:"Portugal",     away:"DR Congo",         venue:"Houston Stadium (NRG)" },

  // Group L
  { id:"m067", round:"group", group:"L", date:"2026-06-17", time:"16:00",
    home:"England",      away:"Croatia",          venue:"Dallas Stadium (AT&T)" },
  { id:"m068", round:"group", group:"L", date:"2026-06-17", time:"19:00",
    home:"Ghana",        away:"Panama",           venue:"Toronto Stadium (BMO Field)" },

  // Group K
  { id:"m062", round:"group", group:"K", date:"2026-06-17", time:"22:00",
    home:"Uzbekistan",   away:"Colombia",         venue:"Mexico City Stadium (Estadio Azteca)" },

  // ---- GROUP STAGE: MATCHDAY 2 (June 18-23) -------------------------

  // Group A
  { id:"m003", round:"group", group:"A", date:"2026-06-18", time:"12:00",
    home:"Czechia",      away:"South Africa",    venue:"Atlanta Stadium (Mercedes-Benz)" },

  // Group B
  { id:"m009", round:"group", group:"B", date:"2026-06-18", time:"15:00",
    home:"Switzerland",  away:"Bosnia & Herzegovina", venue:"Los Angeles Stadium (SoFi)" },
  { id:"m010", round:"group", group:"B", date:"2026-06-18", time:"18:00",
    home:"Canada",       away:"Qatar",            venue:"BC Place, Vancouver" },

  // Group A
  { id:"m004", round:"group", group:"A", date:"2026-06-18", time:"21:00",
    home:"Mexico",       away:"South Korea",      venue:"Guadalajara Stadium (Estadio Akron)" },

  // Group D — midnight ET
  { id:"m022", round:"group", group:"D", date:"2026-06-19", time:"00:00",
    home:"Türkiye",      away:"Paraguay",         venue:"San Francisco Bay Area Stadium (Levi's)" },
  { id:"m021", round:"group", group:"D", date:"2026-06-19", time:"15:00",
    home:"USA",          away:"Australia",        venue:"Seattle Stadium (Lumen Field)" },

  // Group C
  { id:"m015", round:"group", group:"C", date:"2026-06-19", time:"18:00",
    home:"Scotland",     away:"Morocco",          venue:"Boston Stadium (Gillette)" },
  { id:"m016", round:"group", group:"C", date:"2026-06-19", time:"20:30",
    home:"Brazil",       away:"Haiti",            venue:"Philadelphia Stadium (Lincoln Financial)" },

  // Group F
  { id:"m033", round:"group", group:"F", date:"2026-06-20", time:"13:00",
    home:"Netherlands",  away:"Sweden",           venue:"Houston Stadium (NRG)" },

  // Group E
  { id:"m027", round:"group", group:"E", date:"2026-06-20", time:"16:00",
    home:"Germany",      away:"Ivory Coast",      venue:"Toronto Stadium (BMO Field)" },
  { id:"m028", round:"group", group:"E", date:"2026-06-20", time:"20:00",
    home:"Ecuador",      away:"Curaçao",          venue:"Kansas City Stadium (Arrowhead)" },

  // Group F — midnight ET (1000th WC match)
  { id:"m034", round:"group", group:"F", date:"2026-06-21", time:"00:00",
    home:"Tunisia",      away:"Japan",            venue:"Monterrey Stadium (Estadio BBVA)" },

  // Group H
  { id:"m045", round:"group", group:"H", date:"2026-06-21", time:"12:00",
    home:"Spain",        away:"Saudi Arabia",     venue:"Atlanta Stadium (Mercedes-Benz)" },

  // Group G
  { id:"m039", round:"group", group:"G", date:"2026-06-21", time:"15:00",
    home:"Belgium",      away:"Iran",             venue:"Los Angeles Stadium (SoFi)" },

  // Group H
  { id:"m046", round:"group", group:"H", date:"2026-06-21", time:"18:00",
    home:"Uruguay",      away:"Cabo Verde",       venue:"Miami Stadium (Hard Rock)" },

  // Group G
  { id:"m040", round:"group", group:"G", date:"2026-06-21", time:"21:00",
    home:"New Zealand",  away:"Egypt",            venue:"BC Place, Vancouver" },

  // Group J
  { id:"m057", round:"group", group:"J", date:"2026-06-22", time:"13:00",
    home:"Argentina",    away:"Austria",          venue:"Dallas Stadium (AT&T)" },

  // Group I
  { id:"m051", round:"group", group:"I", date:"2026-06-22", time:"17:00",
    home:"France",       away:"Iraq",             venue:"Philadelphia Stadium (Lincoln Financial)" },
  { id:"m052", round:"group", group:"I", date:"2026-06-22", time:"20:00",
    home:"Norway",       away:"Senegal",          venue:"New York New Jersey Stadium (MetLife)" },

  // Group J
  { id:"m058", round:"group", group:"J", date:"2026-06-22", time:"23:00",
    home:"Jordan",       away:"Algeria",          venue:"San Francisco Bay Area Stadium (Levi's)" },

  // Group K
  { id:"m063", round:"group", group:"K", date:"2026-06-23", time:"13:00",
    home:"Portugal",     away:"Uzbekistan",       venue:"Houston Stadium (NRG)" },

  // Group L
  { id:"m069", round:"group", group:"L", date:"2026-06-23", time:"16:00",
    home:"England",      away:"Ghana",            venue:"Boston Stadium (Gillette)" },
  { id:"m070", round:"group", group:"L", date:"2026-06-23", time:"19:00",
    home:"Panama",       away:"Croatia",          venue:"Toronto Stadium (BMO Field)" },

  // Group K
  { id:"m064", round:"group", group:"K", date:"2026-06-23", time:"22:00",
    home:"Colombia",     away:"DR Congo",         venue:"Guadalajara Stadium (Estadio Akron)" },

  // ---- GROUP STAGE: MATCHDAY 3 (June 24-27, simultaneous pairs) -----

  // Group B (simultaneous)
  { id:"m011", round:"group", group:"B", date:"2026-06-24", time:"15:00",
    home:"Switzerland",  away:"Canada",           venue:"BC Place, Vancouver" },
  { id:"m012", round:"group", group:"B", date:"2026-06-24", time:"15:00",
    home:"Bosnia & Herzegovina", away:"Qatar",    venue:"Seattle Stadium (Lumen Field)" },

  // Group C (simultaneous)
  { id:"m017", round:"group", group:"C", date:"2026-06-24", time:"18:00",
    home:"Scotland",     away:"Brazil",           venue:"Miami Stadium (Hard Rock)" },
  { id:"m018", round:"group", group:"C", date:"2026-06-24", time:"18:00",
    home:"Morocco",      away:"Haiti",            venue:"Atlanta Stadium (Mercedes-Benz)" },

  // Group A (simultaneous)
  { id:"m005", round:"group", group:"A", date:"2026-06-24", time:"21:00",
    home:"Czechia",      away:"Mexico",           venue:"Mexico City Stadium (Estadio Azteca)" },
  { id:"m006", round:"group", group:"A", date:"2026-06-24", time:"21:00",
    home:"South Africa", away:"South Korea",      venue:"Monterrey Stadium (Estadio BBVA)" },

  // Group E (simultaneous)
  { id:"m030", round:"group", group:"E", date:"2026-06-25", time:"16:00",
    home:"Curaçao",      away:"Ivory Coast",      venue:"Philadelphia Stadium (Lincoln Financial)" },
  { id:"m029", round:"group", group:"E", date:"2026-06-25", time:"16:00",
    home:"Ecuador",      away:"Germany",          venue:"New York New Jersey Stadium (MetLife)" },

  // Group F (simultaneous)
  { id:"m036", round:"group", group:"F", date:"2026-06-25", time:"19:00",
    home:"Japan",        away:"Sweden",           venue:"Dallas Stadium (AT&T)" },
  { id:"m035", round:"group", group:"F", date:"2026-06-25", time:"19:00",
    home:"Tunisia",      away:"Netherlands",      venue:"Kansas City Stadium (Arrowhead)" },

  // Group D (simultaneous)
  { id:"m023", round:"group", group:"D", date:"2026-06-25", time:"22:00",
    home:"Türkiye",      away:"USA",              venue:"Los Angeles Stadium (SoFi)" },
  { id:"m024", round:"group", group:"D", date:"2026-06-25", time:"22:00",
    home:"Paraguay",     away:"Australia",        venue:"San Francisco Bay Area Stadium (Levi's)" },

  // Group I (simultaneous)
  { id:"m053", round:"group", group:"I", date:"2026-06-26", time:"15:00",
    home:"Norway",       away:"France",           venue:"Boston Stadium (Gillette)" },
  { id:"m054", round:"group", group:"I", date:"2026-06-26", time:"15:00",
    home:"Senegal",      away:"Iraq",             venue:"Toronto Stadium (BMO Field)" },

  // Group H (simultaneous)
  { id:"m048", round:"group", group:"H", date:"2026-06-26", time:"20:00",
    home:"Cabo Verde",   away:"Saudi Arabia",     venue:"Houston Stadium (NRG)" },
  { id:"m047", round:"group", group:"H", date:"2026-06-26", time:"20:00",
    home:"Uruguay",      away:"Spain",            venue:"Guadalajara Stadium (Estadio Akron)" },

  // Group G (simultaneous)
  { id:"m042", round:"group", group:"G", date:"2026-06-26", time:"23:00",
    home:"Egypt",        away:"Iran",             venue:"Seattle Stadium (Lumen Field)" },
  { id:"m041", round:"group", group:"G", date:"2026-06-26", time:"23:00",
    home:"New Zealand",  away:"Belgium",          venue:"BC Place, Vancouver" },

  // Group L (simultaneous)
  { id:"m071", round:"group", group:"L", date:"2026-06-27", time:"17:00",
    home:"Panama",       away:"England",          venue:"New York New Jersey Stadium (MetLife)" },
  { id:"m072", round:"group", group:"L", date:"2026-06-27", time:"17:00",
    home:"Croatia",      away:"Ghana",            venue:"Philadelphia Stadium (Lincoln Financial)" },

  // Group K (simultaneous)
  { id:"m065", round:"group", group:"K", date:"2026-06-27", time:"19:30",
    home:"Colombia",     away:"Portugal",         venue:"Miami Stadium (Hard Rock)" },
  { id:"m066", round:"group", group:"K", date:"2026-06-27", time:"19:30",
    home:"DR Congo",     away:"Uzbekistan",       venue:"Atlanta Stadium (Mercedes-Benz)" },

  // Group J (simultaneous)
  { id:"m060", round:"group", group:"J", date:"2026-06-27", time:"22:00",
    home:"Algeria",      away:"Austria",          venue:"Kansas City Stadium (Arrowhead)" },
  { id:"m059", round:"group", group:"J", date:"2026-06-27", time:"22:00",
    home:"Jordan",       away:"Argentina",        venue:"Dallas Stadium (AT&T)" },

  // ======================================================================
  // ROUND OF 32 — June 28 – July 2 (16 matches, TBD teams)
  // No draw: knockout rules apply
  // ======================================================================
  { id:"m073", round:"r32", date:"2026-06-28", time:"12:00", home:"TBD 1A", away:"TBD 3BCDEF",  venue:"Los Angeles Stadium (SoFi)" },
  { id:"m074", round:"r32", date:"2026-06-28", time:"15:00", home:"TBD 1B", away:"TBD 3ACDEG",  venue:"Atlanta Stadium (Mercedes-Benz)" },
  { id:"m075", round:"r32", date:"2026-06-28", time:"19:00", home:"TBD 1C", away:"TBD 2D",       venue:"Toronto Stadium (BMO Field)" },
  { id:"m076", round:"r32", date:"2026-06-28", time:"22:00", home:"TBD 1D", away:"TBD 2C",       venue:"Seattle Stadium (Lumen Field)" },
  { id:"m077", round:"r32", date:"2026-06-29", time:"12:00", home:"TBD 1E", away:"TBD 3ABCFG",  venue:"Houston Stadium (NRG)" },
  { id:"m078", round:"r32", date:"2026-06-29", time:"15:00", home:"TBD 1F", away:"TBD 3ABEGH",  venue:"Dallas Stadium (AT&T)" },
  { id:"m079", round:"r32", date:"2026-06-29", time:"19:00", home:"TBD 1G", away:"TBD 2H",       venue:"Boston Stadium (Gillette)" },
  { id:"m080", round:"r32", date:"2026-06-29", time:"22:00", home:"TBD 1H", away:"TBD 2G",       venue:"Miami Stadium (Hard Rock)" },
  { id:"m081", round:"r32", date:"2026-06-30", time:"12:00", home:"TBD 1I", away:"TBD 3CDFGH",  venue:"New York New Jersey Stadium (MetLife)" },
  { id:"m082", round:"r32", date:"2026-06-30", time:"15:00", home:"TBD 1J", away:"TBD 3ABCIJ",  venue:"Philadelphia Stadium (Lincoln Financial)" },
  { id:"m083", round:"r32", date:"2026-06-30", time:"19:00", home:"TBD 1K", away:"TBD 2L",       venue:"Kansas City Stadium (Arrowhead)" },
  { id:"m084", round:"r32", date:"2026-07-01", time:"12:00", home:"TBD 1L", away:"TBD 3EHIJK",  venue:"Atlanta Stadium (Mercedes-Benz)" },
  { id:"m085", round:"r32", date:"2026-07-01", time:"15:00", home:"TBD 2A", away:"TBD 3ABIJK",  venue:"Mexico City Stadium (Estadio Azteca)" },
  { id:"m086", round:"r32", date:"2026-07-01", time:"19:00", home:"TBD 2B", away:"TBD 3EFGIJ",  venue:"Guadalajara Stadium (Estadio Akron)" },
  { id:"m087", round:"r32", date:"2026-07-02", time:"12:00", home:"TBD 2E", away:"TBD 2F",       venue:"San Francisco Bay Area Stadium (Levi's)" },
  { id:"m088", round:"r32", date:"2026-07-02", time:"15:00", home:"TBD 2K", away:"TBD 2J",       venue:"Vancouver BC Place" },

  // ======================================================================
  // ROUND OF 16 — July 4–5 (8 matches, TBD)
  // ======================================================================
  { id:"m089", round:"r16", date:"2026-07-04", time:"13:00", home:"TBD W73", away:"TBD W74",   venue:"Houston Stadium (NRG)" },
  { id:"m090", round:"r16", date:"2026-07-04", time:"17:00", home:"TBD W75", away:"TBD W76",   venue:"Philadelphia Stadium (Lincoln Financial)" },
  { id:"m091", round:"r16", date:"2026-07-04", time:"20:00", home:"TBD W77", away:"TBD W78",   venue:"Seattle Stadium (Lumen Field)" },
  { id:"m092", round:"r16", date:"2026-07-04", time:"23:00", home:"TBD W79", away:"TBD W80",   venue:"Toronto Stadium (BMO Field)" },
  { id:"m093", round:"r16", date:"2026-07-05", time:"13:00", home:"TBD W81", away:"TBD W82",   venue:"Kansas City Stadium (Arrowhead)" },
  { id:"m094", round:"r16", date:"2026-07-05", time:"16:00", home:"TBD W83", away:"TBD W84",   venue:"New York New Jersey Stadium (MetLife)" },
  { id:"m095", round:"r16", date:"2026-07-05", time:"19:00", home:"TBD W85", away:"TBD W86",   venue:"Atlanta Stadium (Mercedes-Benz)" },
  { id:"m096", round:"r16", date:"2026-07-05", time:"22:00", home:"TBD W87", away:"TBD W88",   venue:"Los Angeles Stadium (SoFi)" },

  // ======================================================================
  // QUARTER-FINALS — July 9–10 (4 matches)
  // ======================================================================
  { id:"m097", round:"qf",    date:"2026-07-09", time:"15:00", home:"TBD W89", away:"TBD W90",  venue:"Dallas Stadium (AT&T)" },
  { id:"m098", round:"qf",    date:"2026-07-09", time:"19:00", home:"TBD W91", away:"TBD W92",  venue:"Miami Stadium (Hard Rock)" },
  { id:"m099", round:"qf",    date:"2026-07-10", time:"15:00", home:"TBD W93", away:"TBD W94",  venue:"Boston Stadium (Gillette)" },
  { id:"m100", round:"qf",    date:"2026-07-10", time:"19:00", home:"TBD W95", away:"TBD W96",  venue:"Kansas City Stadium (Arrowhead)" },

  // ======================================================================
  // SEMI-FINALS — July 14–15 (2 matches)
  // ======================================================================
  { id:"m101", round:"sf",    date:"2026-07-14", time:"19:00", home:"TBD W97",  away:"TBD W98",  venue:"Atlanta Stadium (Mercedes-Benz)" },
  { id:"m102", round:"sf",    date:"2026-07-15", time:"19:00", home:"TBD W99",  away:"TBD W100", venue:"Los Angeles Stadium (SoFi)" },

  // ======================================================================
  // THIRD-PLACE PLAY-OFF — July 18
  // ======================================================================
  { id:"m103", round:"3rd",   date:"2026-07-18", time:"15:00", home:"TBD L101", away:"TBD L102", venue:"Miami Stadium (Hard Rock)" },

  // ======================================================================
  // FINAL — July 19 (3:00 PM ET, MetLife Stadium)
  // ======================================================================
  { id:"m104", round:"final", date:"2026-07-19", time:"15:00", home:"TBD W101", away:"TBD W102", venue:"New York New Jersey Stadium (MetLife)" },
];
