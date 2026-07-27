// api/fixtures.js — Vercel Serverless Function
// Fetches the full EPL 2026/27 season schedule from ESPN in 3-month batches
// and returns normalised fixtures for the Pick'em app.
// Cached by Vercel CDN for 1 hour; stale results served for up to 24 h.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  const ranges = [
    "20260801-20261031", // GW1-8ish
    "20261101-20270131", // GW9-22ish
    "20270201-20270531", // GW23-38
  ];

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
        const comp  = ev.competitions[0];
        const home  = comp.competitors.find(c => c.homeAway === "home");
        const away  = comp.competitors.find(c => c.homeAway === "away");
        const gw    = ev.week?.number ?? comp.week?.number ?? null;

        // Convert UTC kickoff to ET (America/New_York)
        const utcDate = new Date(ev.date);
        const dateStr = utcDate.toISOString().split("T")[0];
        const timeET  = utcDate.toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", hour12: false,
          timeZone: "America/New_York",
        });

        return {
          id:        ev.id,
          espnId:    ev.id,
          gw,
          round:     gw != null ? `gw${gw}` : "gw0",
          date:      dateStr,
          time:      timeET,
          home:      home?.team?.displayName || "TBD",
          away:      away?.team?.displayName || "TBD",
          homeLogo:  home?.team?.logo  || null,
          awayLogo:  away?.team?.logo  || null,
          homeColor: home?.team?.color ? `#${home.team.color}` : null,
          awayColor: away?.team?.color ? `#${away.team.color}` : null,
          homeShort: home?.team?.abbreviation || home?.team?.displayName?.slice(0, 3).toUpperCase() || "HOM",
          awayShort: away?.team?.abbreviation || away?.team?.displayName?.slice(0, 3).toUpperCase() || "AWY",
          venue:     comp.venue?.fullName || "",
        };
      })
      .sort((a, b) => {
        if ((a.gw ?? 0) !== (b.gw ?? 0)) return (a.gw ?? 0) - (b.gw ?? 0);
        return a.date.localeCompare(b.date);
      });

    return res.status(200).json({ fixtures, total: fixtures.length });
  } catch (err) {
    return res.status(500).json({ error: err.message, fixtures: [] });
  }
}
