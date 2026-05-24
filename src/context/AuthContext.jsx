import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { auth, googleProvider, githubProvider, facebookProvider } from "../firebase/config";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile as firestoreUpdateProfile,
  updateUserPlan,
} from "../services/userService";
import { sendWelcomeEmail, sendExpiryWarning, sendPromoEmail } from "../services/emailService";
import { setUser as setReporterUser } from "../services/errorReporter";

const AuthContext = createContext(null);

// Dev-only test accounts. Empty array in production builds so credentials
// can't be reverse-engineered from the JS bundle.
const DEMO_USERS = import.meta.env.DEV ? [
  { id: 1, email: "admin@vrikaan.com", password: "admin123", name: "Sahil Nikam", role: "admin", avatar: null, plan: "enterprise" },
  { id: 2, email: "user@vrikaan.com", password: "user123", name: "Demo User", role: "user", avatar: null, plan: "pro" },
] : [];

// Admin emails — these users get admin role automatically
const ADMIN_EMAILS = ["sahilnikam133@gmail.com", "sahilnikam1212@gmail.com", "khushiraygade76666@gmail.com", "founder.vrikaan@gmail.com", "cofounder.vrikaan@gmail.com"];

/**
 * Merge Firebase Auth user object with Firestore profile data.
 */
function mergeUserData(firebaseUser, profile) {
  // Trial → expired? auto-downgrade local view (Firestore reconciles on next write)
  let plan = profile?.plan || "free";
  const trialExpires = profile?.trialExpiresAt?.toDate ? profile.trialExpiresAt.toDate() : (profile?.trialExpiresAt ? new Date(profile.trialExpiresAt) : null);
  const trialActive = !!(trialExpires && trialExpires.getTime() > Date.now());
  if (profile?.onTrial && !trialActive) plan = "free"; // expired
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || profile?.email || "",
    name: profile?.name || firebaseUser.displayName || "",
    displayName: firebaseUser.displayName || profile?.name || "",
    photoURL: firebaseUser.photoURL || profile?.avatar || null,
    phoneNumber: firebaseUser.phoneNumber || profile?.phoneNumber || null,
    role: profile?.role || "user",
    plan,
    avatar: profile?.avatar || firebaseUser.photoURL || null,
    provider: profile?.provider || firebaseUser.providerData?.[0]?.providerId || "email",
    createdAt: profile?.createdAt || null,
    updatedAt: profile?.updatedAt || null,
    onTrial: !!profile?.onTrial && trialActive,
    trialExpiresAt: trialExpires,
    trialPlan: profile?.trialPlan || null,
    currentFamilyId: profile?.currentFamilyId || null,
    familyRole: profile?.familyRole || null,
    emailVerified: !!firebaseUser.emailVerified,
    providerData: firebaseUser.providerData || [],
    mfaEnabled: !!profile?.mfa?.enabled,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Drain pending redirect-based social-login result on app load. Fires
  // once after browser navigates back from Google/Github/Facebook OAuth
  // page. onAuthStateChanged also fires after this, so we don't need to
  // setUser here — just surface errors.
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      if (err?.code && err.code !== "auth/no-auth-event") {
        console.warn("getRedirectResult error:", err.code, err.message);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let profile = await getUserProfile(firebaseUser.uid);

          if (!profile) {
            const providerName = firebaseUser.providerData?.[0]?.providerId || "email";
            const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase());
            try {
              await createUserProfile(firebaseUser.uid, {
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
                email: firebaseUser.email || "",
                role: isAdminEmail ? "admin" : "user",
                plan: isAdminEmail ? "enterprise" : "free",
                avatar: firebaseUser.photoURL || null,
                phoneNumber: firebaseUser.phoneNumber || null,
                provider: providerName,
              });
              profile = await getUserProfile(firebaseUser.uid);
            } catch (createErr) {
              console.error("Failed to create user profile in Firestore:", createErr.code, createErr.message);
            }
          }

          // Auto-upgrade admin emails to admin role
          if (profile && ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase()) && profile.role !== "admin") {
            try {
              await firestoreUpdateProfile(firebaseUser.uid, { role: "admin", plan: "enterprise" });
              profile.role = "admin";
              profile.plan = "enterprise";
            } catch {}
          }

          const merged = mergeUserData(firebaseUser, profile);
          setUser(merged);
          setReporterUser(merged);

          // Check subscription expiry — warn if within 3 days.
          // Normalise Firestore Timestamp / Date / ISO-string / millis to a
          // real Date — previous Object - number arithmetic produced NaN and
          // the warning never fired.
          if (profile?.subscriptionExpiresAt && profile.plan !== "free") {
            const raw = profile.subscriptionExpiresAt;
            const expires = raw?.toMillis ? new Date(raw.toMillis())
              : raw?.toDate ? raw.toDate()
              : raw instanceof Date ? raw
              : new Date(raw);
            const expiresMs = expires.getTime();
            const daysLeft = isFinite(expiresMs) ? (expiresMs - Date.now()) / 86400000 : NaN;
            const lastWarning = localStorage.getItem(`vrikaan_expiry_warned_${firebaseUser.uid}`);
            const today = new Date().toISOString().split("T")[0];
            if (isFinite(daysLeft) && daysLeft > 0 && daysLeft <= 3 && lastWarning !== today) {
              sendExpiryWarning(merged.name || merged.email, merged.email, profile.plan, expires);
              localStorage.setItem(`vrikaan_expiry_warned_${firebaseUser.uid}`, today);
            }
          }

          // Send promo email 3 days after signup (once)
          if (profile?.createdAt && !localStorage.getItem(`vrikaan_promo_sent_${firebaseUser.uid}`)) {
            const created = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
            const daysSinceSignup = (Date.now() - created) / 86400000;
            if (daysSinceSignup >= 3) {
              sendPromoEmail(merged.name || merged.email, merged.email);
              localStorage.setItem(`vrikaan_promo_sent_${firebaseUser.uid}`, "true");
            }
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          const fallback = mergeUserData(firebaseUser, null);
          setUser(fallback);
        }
      } else {
        setUser(null);
        setReporterUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Client-side login rate limit — 5 fails per 15 min per browser per email.
  // Server-side equivalent on Firebase Auth would require Cloud Functions.
  const RL_KEY = (email) => `vrikaan_login_rl_${(email || "").toLowerCase()}`;
  const RL_MAX = 5;
  const RL_WINDOW_MS = 15 * 60 * 1000;

  const checkLoginRateLimit = (email) => {
    try {
      const raw = localStorage.getItem(RL_KEY(email));
      const list = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      const recent = list.filter((t) => now - t < RL_WINDOW_MS);
      if (recent.length >= RL_MAX) {
        const wait = Math.ceil((RL_WINDOW_MS - (now - recent[0])) / 60000);
        return { ok: false, wait };
      }
      return { ok: true, recent };
    } catch {
      return { ok: true, recent: [] };
    }
  };

  const recordLoginFail = (email) => {
    try {
      const raw = localStorage.getItem(RL_KEY(email));
      const list = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      const recent = list.filter((t) => now - t < RL_WINDOW_MS);
      recent.push(now);
      localStorage.setItem(RL_KEY(email), JSON.stringify(recent));
    } catch { /* storage full */ }
  };

  const clearLoginFails = (email) => {
    try { localStorage.removeItem(RL_KEY(email)); } catch { /* noop */ }
  };

  const login = useCallback(async (email, password) => {
    // Rate-limit gate
    const gate = checkLoginRateLimit(email);
    if (!gate.ok) {
      return { success: false, error: `Too many failed attempts. Try again in ${gate.wait} minutes.` };
    }

    const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (demoUser) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        clearLoginFails(email);
        return { success: true, user: credential.user };
      } catch (_firebaseError) {
        const session = { ...demoUser, uid: "demo_" + demoUser.id };
        delete session.password;
        setUser(session);
        clearLoginFails(email);
        return { success: true, user: session };
      }
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      clearLoginFails(email);
      return { success: true, user: credential.user };
    } catch (error) {
      recordLoginFail(email);
      return { success: false, error: error.message || "Invalid email or password" };
    }
  }, []);

  const signup = useCallback(async (data) => {
    try {
      const existing = DEMO_USERS.find((u) => u.email === data.email);
      if (existing) {
        return { success: false, error: "Email already registered" };
      }

      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = credential.user;
      const fullName = data.firstName + (data.lastName ? " " + data.lastName : "");

      await firebaseUpdateProfile(firebaseUser, {
        displayName: fullName,
      });

      await createUserProfile(firebaseUser.uid, {
        name: fullName,
        email: data.email,
        role: "user",
        plan: "free",
        avatar: null,
        phoneNumber: null,
        provider: "email",
      });

      const profile = await getUserProfile(firebaseUser.uid);
      const merged = mergeUserData(firebaseUser, profile);
      setUser(merged);

      sendWelcomeEmail(fullName, data.email);

      return { success: true, user: merged };
    } catch (error) {
      return { success: false, error: error.message || "Signup failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  }, []);

  // Popup auth fails on: mobile Safari (always), popup-blocker browsers,
  // 3rd-party-cookie-disabled browsers, accidental popup close. Catch
  // those classes of errors and silently fall back to redirect-based auth.
  // Result lands via getRedirectResult on next AuthContext mount.
  const POPUP_FALLBACK_CODES = new Set([
    "auth/popup-closed-by-user",
    "auth/popup-blocked",
    "auth/cancelled-popup-request",
    "auth/operation-not-supported-in-this-environment",
  ]);

  const _socialLogin = async (provider, label) => {
    try {
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      if (POPUP_FALLBACK_CODES.has(error.code)) {
        try {
          await signInWithRedirect(auth, provider);
          // Browser will navigate away — return success placeholder
          return { success: true, redirecting: true };
        } catch (redirErr) {
          return { success: false, error: redirErr.message || `${label} sign-in failed (redirect)` };
        }
      }
      return { success: false, error: error.message || `${label} sign-in failed` };
    }
  };

  const loginWithGoogle = useCallback(() => _socialLogin(googleProvider, "Google"), []);
  const loginWithGithub = useCallback(() => _socialLogin(githubProvider, "GitHub"), []);
  const loginWithFacebook = useCallback(() => _socialLogin(facebookProvider, "Facebook"), []);

  const loginWithPhone = useCallback(async (phoneNumber, recaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return { success: true, confirmationResult };
    } catch (error) {
      return { success: false, error: error.message || "Phone sign-in failed" };
    }
  }, []);

  const verifyPhoneCode = useCallback(async (confirmationResult, code) => {
    try {
      const result = await confirmationResult.confirm(code);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message || "Invalid verification code" };
    }
  }, []);

  const sendVerifyEmail = useCallback(async () => {
    if (!auth.currentUser) return { success: false, error: "Not signed in" };
    try {
      await sendEmailVerification(auth.currentUser, { url: window.location.origin + "/dashboard" });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Could not send verification email" };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Password reset failed" };
    }
  }, []);

  // Magic-link / passwordless email sign-in.
  // Sends a one-tap link to the user's email. The link returns to /login
  // where completeMagicLink() finishes the sign-in.
  const sendMagicLink = useCallback(async (email) => {
    try {
      const url = `${window.location.origin}/login?magic=1`;
      await sendSignInLinkToEmail(auth, email, {
        url,
        handleCodeInApp: true,
      });
      // Stash for completion step (Firebase recommended pattern)
      window.localStorage.setItem("magicLinkEmail", email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Could not send sign-in link" };
    }
  }, []);

  // Called on the /login page when the user clicks the magic link.
  // Reads the email from localStorage; if missing (different device) it
  // returns { needsEmail: true } so the UI can prompt for it.
  const completeMagicLink = useCallback(async (emailOverride) => {
    try {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        return { success: false, error: "Not a magic link URL" };
      }
      let email = emailOverride || window.localStorage.getItem("magicLinkEmail");
      if (!email) return { success: false, needsEmail: true };
      const credential = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem("magicLinkEmail");
      return { success: true, user: credential.user };
    } catch (error) {
      return { success: false, error: error.message || "Magic link sign-in failed" };
    }
  }, []);

  // Start a 7-day trial of the requested plan. No card needed. Firestore tracks
  // onTrial=true + trialExpiresAt so the next login auto-reverts when the
  // window closes.
  const startTrial = useCallback(async (trialPlan = "pro") => {
    if (!user || !user.uid) return { success: false, error: "Not signed in" };
    if (user.onTrial || (user.plan && user.plan !== "free")) {
      return { success: false, error: "Trial already used or paid plan active" };
    }
    if (String(user.uid).startsWith("demo_")) {
      const expires = new Date(Date.now() + 7 * 86400000);
      setUser((prev) => ({ ...prev, plan: trialPlan, onTrial: true, trialExpiresAt: expires, trialPlan }));
      return { success: true };
    }
    try {
      const expires = new Date(Date.now() + 7 * 86400000);
      const { Timestamp } = await import("firebase/firestore");
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("../firebase/config");
      await updateDoc(doc(db, "users", user.uid), {
        plan: trialPlan,
        onTrial: true,
        trialPlan,
        trialStartedAt: serverTimestamp(),
        trialExpiresAt: Timestamp.fromDate(expires),
        updatedAt: serverTimestamp(),
      });
      setUser((prev) => ({ ...prev, plan: trialPlan, onTrial: true, trialExpiresAt: expires, trialPlan }));
      return { success: true, expiresAt: expires };
    } catch (error) {
      return { success: false, error: error.message || "Could not start trial" };
    }
  }, [user]);

  const updatePlan = useCallback(async (plan) => {
    if (!user || !user.uid) return;

    if (String(user.uid).startsWith("demo_")) {
      setUser((prev) => ({ ...prev, plan }));
      return;
    }

    try {
      await updateUserPlan(user.uid, plan);
      setUser((prev) => ({ ...prev, plan }));
    } catch (error) {
      console.error("Failed to update plan:", error);
    }
  }, [user]);

  const updateProfile = useCallback(async (data) => {
    if (!user || !user.uid) return;

    if (String(user.uid).startsWith("demo_")) {
      setUser((prev) => ({ ...prev, ...data }));
      return;
    }

    try {
      await firestoreUpdateProfile(user.uid, data);

      if (data.name || data.photoURL) {
        const profileUpdate = {};
        if (data.name) profileUpdate.displayName = data.name;
        if (data.photoURL) profileUpdate.photoURL = data.photoURL;
        if (auth.currentUser) {
          await firebaseUpdateProfile(auth.currentUser, profileUpdate);
        }
      }

      setUser((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }, [user]);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithGithub,
    loginWithFacebook,
    loginWithPhone,
    verifyPhoneCode,
    resetPassword,
    sendMagicLink,
    completeMagicLink,
    sendVerifyEmail,
    updatePlan,
    startTrial,
    updateProfile,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
