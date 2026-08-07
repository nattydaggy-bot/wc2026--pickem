// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, setDoc, getDoc,
  collection, onSnapshot, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── League ─────────────────────────────────────────────────────────
export async function createLeague(leagueCode, username, teamName) {
  const ref = doc(db, "leagues", leagueCode);
  if ((await getDoc(ref)).exists()) return { error: "League code already taken. Try another." };
  await setDoc(ref, { createdBy: username, createdAt: serverTimestamp() });
  await setDoc(doc(db, "leagues", leagueCode, "members", username), {
    teamName: teamName || username, picks: {}, banker: {}, updatedAt: serverTimestamp(),
  });
  return { success: true };
}

export async function leagueExists(leagueCode) {
  return (await getDoc(doc(db, "leagues", leagueCode))).exists();
}

// ─── Members ─────────────────────────────────────────────────────────
export async function getMember(leagueCode, username) {
  const snap = await getDoc(doc(db, "leagues", leagueCode, "members", username));
  return snap.exists() ? snap.data() : null;
}

export async function joinLeague(leagueCode, username, teamName) {
  const existing = await getMember(leagueCode, username);
  if (existing) return { error: "Username already taken in this league. Choose another." };
  await setDoc(doc(db, "leagues", leagueCode, "members", username), {
    teamName: teamName || username, picks: {}, banker: {}, updatedAt: serverTimestamp(),
  });
  return { success: true };
}

// ─── Picks ───────────────────────────────────────────────────────────
export async function savePicks(leagueCode, username, picks, teamName, banker = {}) {
  const data = { picks, banker, updatedAt: serverTimestamp() };
  if (teamName) data.teamName = teamName;
  await setDoc(doc(db, "leagues", leagueCode, "members", username), data, { merge: true });
}

// ─── Real-time subscription ──────────────────────────────────────────
export function subscribeToLeague(leagueCode, callback) {
  return onSnapshot(collection(db, "leagues", leagueCode, "members"), snap => {
    const members = {};
    snap.forEach(d => { members[d.id] = d.data(); });
    callback(members);
  });
}