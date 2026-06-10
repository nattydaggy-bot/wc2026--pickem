// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── League helpers ────────────────────────────────────────────────

export async function createLeague(leagueCode, adminUsername) {
  const ref = doc(db, "leagues", leagueCode);
  const existing = await getDoc(ref);
  if (existing.exists()) return { error: "League code already taken. Choose another." };
  await setDoc(ref, {
    createdBy: adminUsername,
    createdAt: serverTimestamp(),
  });
  return { success: true };
}

export async function leagueExists(leagueCode) {
  const snap = await getDoc(doc(db, "leagues", leagueCode));
  return snap.exists();
}

// ─── Picks helpers ─────────────────────────────────────────────────

export async function savePicks(leagueCode, username, picks) {
  const ref = doc(db, "leagues", leagueCode, "members", username);
  await setDoc(ref, { picks, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getPicks(leagueCode, username) {
  const snap = await getDoc(doc(db, "leagues", leagueCode, "members", username));
  return snap.exists() ? snap.data().picks : {};
}

export function subscribeToLeague(leagueCode, callback) {
  const ref = collection(db, "leagues", leagueCode, "members");
  return onSnapshot(ref, (snapshot) => {
    const members = {};
    snapshot.forEach((d) => { members[d.id] = d.data(); });
    callback(members);
  });
}