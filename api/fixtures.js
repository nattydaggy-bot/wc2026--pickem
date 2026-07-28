// api/fixtures.js — Vercel Serverless Function
// Fetches the full EPL 2026/27 season schedule from ESPN.
// Falls back to date-based GW inference if ESPN doesn't provide week numbers.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  // EPL 2026/27 season: mid-Aug 2026 → mid-May 2027
  const ranges = [
    "20260801-20261031",
    "20261101-20270131",
    "20270201-20270531",
  ];

  // Season start for date-based GW inference fallback
  const SEASON_START = new Date("2026-08-14T00:00:00Z");
  // Approximate: 9 weeks = GW1-9, then 1-week break every ~9 weeks (international windows)
  // Simple: each GW occupies 7 days from season start, skipping known break windows
  const BREAK_DATES = [
    "2026-09-04", "2026-09-05", "2026-09-06", // Intl break 1
    "2026-10-09", "2026-10-10", "2026-10-11", // Intl break 2
    "2026-11-13", "2026-11-14", "2026-11-15", // Intl break 3
    "2026-12-26", "2026-12-27", "2026-12-28", // Christmas period (no break but busy)
    "2027-01-30", "2027-01-31", "2027-02-01", // Intl break 4
    "2027-03-26", "2027-03-27", "2027-03-28", // Intl break 5
  ];
  const breakSet = new Set(BREAK_DATES);

  function inferGW(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T12:00:00Z");
    const daysDiff = Math.floor((d - SEASON_START) / 86400000);
    if (daysDiff < 0 || daysDiff > 280) return null; // outside season
    // Count non-break weeks elapsed
    let gw = 1;
    let currentWeekStart = new Date(SEASON_START);
    for (let w = 0; w < 40; w++) {
      const weekEnd = new Date(currentWeekStart.getTime() + 7 * 86400000);
      if (d >= currentWeekStart && d < weekEnd) return gw;
      currentWeekStart = weekEnd;
      // Skip break periods (advance currentWeekStart past the break without incrementing GW)
      const wd = currentWeekStart.toISOString().split("T")[0];
      if (!breakSet.has(wd)) gw++;
    }
    return null;
  }

  try {
    const responses = await Promise.all(
      ranges.map(r =>
        fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${r}&limit=200`
        ).then(x => x.json()).catch(() => ({ events: [] }))
      )
    );

    const allEvents = responses.flatMap(d => d.events || []);

    const fixtures = allEvents
      .filter(ev => ev.competitions?.[0]?.competitors?.length >= 2)
      .map(ev => {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");

        // Try multiple ESPN field paths for week/gameweek number
        const gwFromEspn =
          ev.week?.number ??
          comp.week?.number ??
          ev.season?.type?.week?.number ??
          null;

        const utcDate = new Date(ev.date);
        const dateStr = utcDate.toISOString().split("T")[0];
        const timeET  = utcDate.toLocaleTimeString("en-US", {
          hour:"2-digit", minute:"2-digit", hour12:false,
          timeZone:"America/New_York",
        });

        // Use ESPN's GW if available, otherwise infer from date
        const gw = gwFromEspn ?? inferGW(dateStr);

        return {
          id:        ev.id,
          espnId:    ev.id,
          gw,
          round:     gw != null ? `gw${gw}` : "ungrouped",
          date:      dateStr,
          time:      timeET,
          home:      home?.team?.displayName || "TBD",
          away:      away?.team?.displayName || "TBD",
          homeLogo:  home?.team?.logo  || null,
          awayLogo:  away?.team?.logo  || null,
          homeColor: home?.team?.color ? `#${home.team.color}` : null,
          awayColor: away?.team?.color ? `#${away.team.color}` : null,
          homeShort: home?.team?.abbreviation || home?.team?.displayName?.slice(0,3).toUpperCase() || "HOM",
          awayShort: away?.team?.abbreviation || away?.team?.displayName?.slice(0,3).toUpperCase() || "AWY",
          venue:     comp.venue?.fullName || "",
        };
      })
      .sort((a, b) => {
        if ((a.gw??99) !== (b.gw??99)) return (a.gw??99) - (b.gw??99);
        return a.date.localeCompare(b.date);
      });

    // Normalize GW numbers: if ESPN starts from 2 (Community Shield = GW1),
    // shift everything down so the first league gameweek is always GW1.
    const gwNums = fixtures.map(f => f.gw).filter(g => g != null && g > 0);
    if (gwNums.length > 0) {
      const minGw  = Math.min(...gwNums);
      const offset = minGw - 1; // e.g. if minGw=2, offset=1
      if (offset > 0) {
        fixtures = fixtures.map(f => f.gw != null
          ? { ...f, gw: f.gw - offset, round: `gw${f.gw - offset}` }
          : f
        );
      }
    }

    return res.status(200).json({ fixtures, total: fixtures.length });
  } catch (err) {
    return res.status(500).json({ error: err.message, fixtures: [] });
  }
}
