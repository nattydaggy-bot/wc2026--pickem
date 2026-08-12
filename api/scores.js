export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
  const today = new Date();
  const pad = n => String(n).padStart(2, "0");
  const fmt = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const from = new Date(today - 4 * 86400000);
  const to = new Date(today + 4 * 86400000);
  const dates = req.query?.dates || `${fmt(from)}-${fmt(to)}`;
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${dates}`;
    const resp = await fetch(url);
    if (!resp.ok) return res.status(resp.status).json({ error: "ESPN API error" });
    return res.status(200).json(await resp.json());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}