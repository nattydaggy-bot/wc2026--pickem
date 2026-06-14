// api/scores.js  — Vercel Serverless Function
// Proxies ESPN's World Cup scoreboard so the browser never hits ESPN
// directly (avoids CORS) and so we can pull results for the WHOLE
// tournament date range at once (needed to retro-score earlier matches).
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  // Default range = entire WC2026 tournament (June 11 - July 19, 2026).
  // Can be overridden with ?dates=YYYYMMDD-YYYYMMDD if ever needed.
  const dates = (req.query && req.query.dates) || "20260611-20260719";

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dates}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "ESPN API error", status: response.status });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
