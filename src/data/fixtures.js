// src/data/fixtures.js
export const FIXTURES = [
  // GROUP STAGE
  { id: "m001", round: "group", group: "A", date: "2026-06-11", time: "22:00",
    home: "Mexico", away: "Ecuador",  venue: "SoFi Stadium, Los Angeles" },
  { id: "m002", round: "group", group: "A", date: "2026-06-12", time: "01:00",
    home: "USA",    away: "Canada",   venue: "MetLife Stadium, New York" },
  // ... all 104 fixtures
];

// Round labels for display
export const ROUND_LABELS = {
  group:  { label: "Group Stage",   points: 3  },
  r32:    { label: "Round of 32",   points: 5  },
  r16:    { label: "Round of 16",   points: 7  },
  qf:     { label: "Quarter-Final", points: 10 },
  sf:     { label: "Semi-Final",    points: 12 },
  final:  { label: "Final",         points: 15 },
};