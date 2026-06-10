const POINTS = { group: 3, r32: 5, r16: 7, qf: 10, sf: 12, final: 15 };

function calcScore(memberPicks = {}, fixtures, liveScores) {
  let score = 0;
  fixtures.forEach(match => {
    const pred = memberPicks[match.id];
    const live = liveScores?.[match.id];
    if (!pred || !live) return;
    const h = parseInt(live.homeScore), a = parseInt(live.awayScore);
    if (isNaN(h) || isNaN(a)) return;
    const actual = h > a ? "home" : h < a ? "away" : "draw";
    if (pred === actual) score += (POINTS[match.round] ?? 3);
  });
  return score;
}

export default function Leaderboard({ members, fixtures, liveScores }) {
  const rows = Object.entries(members)
    .map(([username, data]) => ({
      username,
      score: calcScore(data.picks, fixtures, liveScores),
      picks: Object.keys(data.picks || {}).length
    }))
    .sort((a, b) => b.score - a.score || b.picks - a.picks);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ padding: "1rem", maxWidth: 680, margin: "0 auto" }}>
      <h2 style={{ color: "#FFD700", marginBottom: "1.5rem" }}>🏆 Leaderboard</h2>

      {rows.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem",
          color: "#888", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
          No players yet — share your league code with friends!
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {rows.map((row, idx) => (
            <div key={row.username} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              background: idx === 0 ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${idx === 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 10, padding: "0.85rem 1rem"
            }}>
              <span style={{ fontSize: idx < 3 ? "1.2rem" : "0.9rem",
                color: "#aaa", minWidth: 28, textAlign: "center" }}>
                {medals[idx] ?? idx + 1}
              </span>
              <span style={{
                flex: 1, color: "white",
                fontWeight: idx === 0 ? "bold" : "normal", fontSize: "0.95rem"
              }}>
                {row.username}
              </span>
              <span style={{ color: "#888", fontSize: "0.8rem" }}>
                {row.picks}/104 picks
              </span>
              <span style={{
                color: "#4CAF50", fontWeight: "bold", fontSize: "1.1rem",
                minWidth: 45, textAlign: "right"
              }}>
                {row.score} <span style={{ fontSize: "0.7rem", color: "#888" }}>pts</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}