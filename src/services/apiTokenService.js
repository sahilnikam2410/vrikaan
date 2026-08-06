/**
 * API token management for Pro/Enterprise users.
 * Tokens stored in Firestore at /users/{uid}/apikeys/{keyId}.
 *
 * Token format: vrk_<32-char-base36>
 * Sent via Authorization: Bearer header to /api/* endpoints.
 *
 * The dispatcher in api/tools.js validates the token by reading
 * the Firestore doc directly (public REST API), checking that
 * doc.active === true and incrementing its lastUsedAt timestamp.
 */
import { collection, doc, getDocs, addDoc, deleteDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

function generateToken() {
  const buf = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `vrk_${hex}`;
}

export async function listTokens(uid) {
  if (!uid) return [];
  const snap = await getDocs(collection(db, "users", uid, "apikeys"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createToken(uid, label = "API Key") {
  if (!uid) throw new Error("Not signed in");
  const token = generateToken();
  // 1. Owner-only record with metadata
  const docRef = await addDoc(collection(db, "users", uid, "apikeys"), {
    token,
    label,
    active: true,
    createdAt: serverTimestamp(),
    lastUsedAt: null,
    callCount: 0,
  });
  // 2. Public-by-id-only mirror so server endpoints can validate without
  //    admin SDK. Doc ID == the secret token; rules block listing the
  //    collection but allow get on exact ID.
  //
  //    Deliberately carries no `plan` — the API resolves the caller's tier
  //    from /users/{uid} on every request, and firestore.rules rejects the
  //    field outright so a client can't re-introduce a self-granted tier.
  await setDoc(doc(db, "api_tokens", token), {
    uid,
    active: true,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, token, label };
}

export async function revokeToken(uid, keyId, token) {
  if (!uid || !keyId) return false;
  await updateDoc(doc(db, "users", uid, "apikeys", keyId), {
    active: false,
    revokedAt: serverTimestamp(),
  });
  if (token) {
    await updateDoc(doc(db, "api_tokens", token), { active: false }).catch(() => {});
  }
  return true;
}

export async function deleteToken(uid, keyId, token) {
  if (!uid || !keyId) return false;
  await deleteDoc(doc(db, "users", uid, "apikeys", keyId));
  if (token) {
    await deleteDoc(doc(db, "api_tokens", token)).catch(() => {});
  }
  return true;
}
