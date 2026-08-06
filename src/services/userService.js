import { db } from "../firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Create a new user profile in the Firestore `users` collection.
 * @param {string} uid - Firebase Auth user ID
 * @param {object} data - Profile fields (name, email, role, plan, etc.)
 */
export async function createUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    name: data.name || "",
    email: data.email || "",
    role: data.role || "user",
    plan: data.plan || "free",
    avatar: data.avatar || null,
    phoneNumber: data.phoneNumber || null,
    provider: data.provider || "email",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieve a user profile from Firestore.
 * @param {string} uid - Firebase Auth user ID
 * @returns {object|null} The user profile data, or null if not found
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return { uid, ...snapshot.data() };
  }
  return null;
}

/**
 * Update specific fields on a user profile.
 * @param {string} uid - Firebase Auth user ID
 * @param {object} data - Fields to update
 */
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update the subscription plan for a user.
 * @param {string} uid - Firebase Auth user ID
 * @param {string} plan - The new plan name (free, pro, enterprise)
 */
export async function updateUserPlan(uid, plan) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    plan,
    updatedAt: serverTimestamp(),
  });
}

// savePaymentRecord was removed: `users/{uid}/payments` is written server-side
// by the Cashfree grant transaction and is read-only to clients, so a
// client-side writer can only fail (and previously allowed hand-authored
// billing history).

/**
 * Retrieve all payment records for a user, ordered by creation date descending.
 * @param {string} uid - Firebase Auth user ID
 * @returns {Array} Array of payment objects
 */
export async function getUserPayments(uid) {
  const paymentsRef = collection(db, "users", uid, "payments");
  const q = query(paymentsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const payments = [];
  snapshot.forEach((docSnap) => {
    payments.push({ id: docSnap.id, ...docSnap.data() });
  });
  return payments;
}
