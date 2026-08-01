// api/fixtures.js — Vercel Serverless Function
// Fetches EPL 2026/27 schedule from ESPN using multiple strategies.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const SEASON_START = new Date("2026-08-14T00:00:00Z");

  function inferGW(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T12:00:00Z");
    const days = Math.floor((d - SEASON_START) / 86400000);
    if (days < 0 || days > 290) return null;
    return Math.ceil((days + 1) / 7);
  }

  function transform(events) {
    return events
      .filter(ev => ev.competitions?.[0]?.competitors?.length >= 2)
      .map(ev => {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");
        const gwEspn = ev.week?.number ?? comp.week?.number ?? null;
        const utcDate = new Date(ev.date);
        const dateStr = utcDate.toISOString().split("T")[0];
        const timeET  = utcDate.toLocaleTimeString("en-US", {
          hour:"2-digit", minute:"2-digit", hour12:false,
          timeZone:"America/New_York",
        });
        const gw = gwEspn ?? inferGW(dateStr);
        return {
          id: ev.id, espnId: ev.id, gw,
          round: gw != null ? `gw${gw}` : "ungrouped",
          date: dateStr, time: timeET,
          home: home?.team?.displayName || "TBD",
          away: away?.team?.displayName || "TBD",
          homeLogo:  home?.team?.logo  || null,
          awayLogo:  away?.team?.logo  || null,
          homeColor: home?.team?.color ? `#${home.team.color}` : null,
          awayColor: away?.team?.color ? `#${away.team.color}` : null,
          homeShort: home?.team?.abbreviation || home?.team?.displayName?.slice(0,3).toUpperCase() || "HOM",
          awayShort: away?.team?.abbreviation || away?.team?.displayName?.slice(0,3).toUpperCase() || "AWY",
          venue: comp.venue?.fullName || "",
          utcDate: ev.date || null,
        };
      });
  }

  async function fetchRange(range) {
    try {
      const r = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${range}&limit=200`
      );
      const d = await r.json();
      return d.events || [];
    } catch { return []; }
  }

  try {
    // Strategy 1: full season in monthly chunks
    const ranges = ["20260801-20261031","20261101-20270131","20270201-20270531"];
    const allMonthly = (await Promise.all(ranges.map(fetchRange))).flat();

    // Strategy 2: season-year param (ESPN uses the end year)
    let allSeason = [];
    try {
      const r2 = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?year=2027&seasontype=2&limit=400"
      );
      const d2 = await r2.json();
      allSeason = d2.events || [];
    } catch {}

    // Merge & deduplicate by event ID
    const seen = new Set();
    const allEvents = [...allMonthly, ...allSeason].filter(ev => {
      if (seen.has(ev.id)) return false;
      seen.add(ev.id); return true;
    });

    let fixtures = transform(allEvents).sort((a,b) => {
      if ((a.gw??99) !== (b.gw??99)) return (a.gw??99) - (b.gw??99);
      return a.date.localeCompare(b.date);
    });

    // Normalize: make smallest GW = 1
    const gwNums = fixtures.map(f => f.gw).filter(g => g != null && g > 0);
    if (gwNums.length > 0) {
      const offset = Math.min(...gwNums) - 1;
      if (offset > 0) {
        fixtures = fixtures.map(f =>
          f.gw != null ? { ...f, gw: f.gw - offset, round: `gw${f.gw - offset}` } : f
        );
      }
    }

    return res.status(200).json({ fixtures, total: fixtures.length });
  } catch (err) {
    return res.status(500).json({ error: err.message, fixtures: [] });
  }
}
