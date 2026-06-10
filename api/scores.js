// api/scores.js  — Vercel Serverless Function
export default async function handler(req, res) {
  // Allow CORS from your own domain
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const espnUrl =
      "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

    const response = await fetch(espnUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: "ESPN API error" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}