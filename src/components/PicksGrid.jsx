const ROUND_ORDER = ["group","r32","r16","qf","sf","final"];
const ROUND_LABELS = {
  group: "⚽ Group Stage (3 pts)",
  r32:   "🔵 Round of 32 (5 pts)",
  r16:   "🟡 Round of 16 (7 pts)",
  qf:    "🟠 Quarter-Finals (10 pts)",
  sf:    "🔴 Semi-Finals (12 pts)",
  final: "🏆 Final (15 pts)"
};

export default function PicksGrid({ fixtures, picks, liveScores, onPick }) {
  const byRound = ROUND_ORDER
    .map(r => ({ round: r, label: ROUND_LABELS[r], matches: fixtures.filter(f => f.round === r) }))
    .filter(r => r.matches.length > 0);

  return (
    <div style={{ padding: "1rem", maxWidth: 860, margin: "0 auto" }}>
      {byRound.map(({ round, label, matches }) => (
        <div key={round} style={{ marginBottom: "2.5rem" }}>
          <h2 style={{
            color: "#FFD700", fontSize: "1rem",
            borderBottom: "1px solid rgba(255,215,0,0.25)",
            paddingBottom: "0.5rem", marginBottom: "1rem"
          }}>{label}</h2>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                pick={picks?.[match.id]}
                liveScore={liveScores?.[match.id]}
                onPick={(pred) => onPick(match.id, pred)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchCard({ match, pick, liveScore, onPick }) {
  const isLive = liveScore?.status && !liveScore.status.includes("FT");
  const isFinal = liveScore?.status?.includes("FT");

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${pick ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 10, padding: "0.85rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <span style={{ color: "#888", fontSize: "0.75rem" }}>
          {match.date} {match.time && `· ${match.time}`}
          {match.group && ` · Group ${match.group}`}
        </span>
        {(isLive || isFinal) && (
          <span style={{ fontSize: "0.75rem", fontWeight: "bold",
            color: isLive ? "#4CAF50" : "#aaa" }}>
            {isLive ? `🔴 ${liveScore.homeScore}–${liveScore.awayScore}` : `FT ${liveScore.homeScore}–${liveScore.awayScore}`}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {[
          { value: "home", label: match.home || "Home" },
          { value: "draw", label: "Draw" },
          { value: "away", label: match.away || "Away" }
        ].map(opt => (
          <button key={opt.value} onClick={() => onPick(opt.value)} style={{
            flex: 1, padding: "0.5rem 0.2rem", borderRadius: 6,
            border: `1px solid ${pick === opt.value ? "#FFD700" : "rgba(255,255,255,0.12)"}`,
            background: pick === opt.value ? "#FFD700" : "rgba(255,255,255,0.04)",
            color: pick === opt.value ? "#000" : "#ddd",
            fontWeight: pick === opt.value ? "bold" : "normal",
            cursor: "pointer", fontSize: "0.78rem",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}