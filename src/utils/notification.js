// src/utils/notification.js
// Push notification utilities

export function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
  return Notification.permission === "granted";
}

export function sendNotification(title, body, options = {}) {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const notification = new Notification(title, {
      body,
      icon: "/logo.svg",
      tag: "epl-pickem",
      ...options,
    });
    return true;
  } catch (error) {
    console.error("Notification error:", error);
    return false;
  }
}

export function checkDeadlineReminder(fixtures, picks, results) {
  const allGws = [...new Set(fixtures.map(f => f.gw).filter(g => g != null))].sort((a, b) => a - b);

  for (const gw of allGws) {
    const gwFixtures = fixtures.filter(f => f.gw === gw);
    const hasLive = gwFixtures.some(f => results[f.id]?.state === "in");
    const allCompleted = gwFixtures.every(f => results[f.id]?.completed);

    if (hasLive || allCompleted) continue;

    const earliest = gwFixtures.reduce((earliest, f) => {
      if (!f.utcDate) return earliest;
      const d = new Date(f.utcDate);
      return d < earliest ? d : earliest;
    }, new Date(gwFixtures[0]?.utcDate || Date.now() + 86400000));

    const now = new Date();
    const diff = earliest - now;

    if (diff > 0 && diff < 3600000 && diff > 300000) {
      const madePicks = gwFixtures.filter(f => picks[f.id]).length;
      if (madePicks < gwFixtures.length) {
        return {
          gw,
          deadline: earliest,
          madePicks,
          totalPicks: gwFixtures.length,
          shouldNotify: true,
        };
      }
    }
  }
  return { shouldNotify: false };
}