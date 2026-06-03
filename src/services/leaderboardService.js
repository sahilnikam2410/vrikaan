// Academy leaderboard — Firestore-backed cross-user ranking.
// Doc per user at leaderboard/{uid}: { name, xp, level, bestMock, updatedAt }.
// Public read (signed-in), owner-only write (enforced by firestore.rules).
import { db } from "../firebase/config";
import {
  doc, setDoc, collection, query, orderBy, limit, getDocs,
} from "firebase/firestore";

/**
 * Upsert the current user's leaderboard entry.
 * Call after academy activity / finishing a mock test.
 */
export async function submitScore(uid, { name, xp, level, bestMock }) {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, "leaderboard", uid),
      {
        name: (name || "Learner").slice(0, 40),
        xp: Math.max(0, Math.round(xp || 0)),
        level: Math.max(1, Math.round(level || 1)),
        bestMock: Math.max(0, Math.round(bestMock || 0)),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    // Non-fatal — leaderboard is a nicety, never block the learner.
    console.warn("submitScore failed:", e?.message);
  }
}

/** Top N learners by XP (desc). Returns [{ uid, name, xp, level, bestMock }]. */
export async function getTopScores(n = 50) {
  try {
    const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (e) {
    console.warn("getTopScores failed:", e?.message);
    return [];
  }
}
