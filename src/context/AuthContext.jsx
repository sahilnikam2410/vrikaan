import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
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

const DEMO_USERS = [
  { id: 1, email: "admin@vrikaan.com", password: "admin123", name: "Sahil Nikam", role: "admin", avatar: null, plan: "enterprise" },
  { id: 2, email: "user@vrikaan.com", password: "user123", name: "Demo User", role: "user", avatar: null, plan: "pro" },
];

// Admin emails — these users get admin role automatically
const ADMIN_EMAILS = ["sahilnikam133@gmail.com", "sahilnikam1212@gmail.com", "admin@vrikaan.com"];

/**
 * Merge Firebase Auth user object with Firestore profile data.
 */
function mergeUserData(firebaseUser, profile) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || profile?.email || "",
    name: profile?.name || firebaseUser.displayName || "",
    displayName: firebaseUser.displayName || profile?.name || "",
    photoURL: firebaseUser.photoURL || profile?.avatar || null,
    phoneNumber: firebaseUser.phoneNumber || profile?.phoneNumber || null,
    role: profile?.role || "user",
    plan: profile?.plan || "free",
    avatar: profile?.avatar || firebaseUser.photoURL || null,
    provider: profile?.provider || firebaseUser.providerData?.[0]?.providerId || "email",
    createdAt: profile?.createdAt || null,
    updatedAt: profile?.updatedAt || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

          // Check subscription expiry — warn if within 3 days
          if (profile?.subscriptionExpiresAt && profile.plan !== "free") {
            const expires = profile.subscriptionExpiresAt?.toDate ? profile.subscriptionExpiresAt.toDate() : new Date(profile.subscriptionExpiresAt);
            const daysLeft = (expires - Date.now()) / 86400000;
            const lastWarning = localStorage.getItem(`secuvion_expiry_warned_${firebaseUser.uid}`);
            const today = new Date().toISOString().split("T")[0];
            if (daysLeft > 0 && daysLeft <= 3 && lastWarning !== today) {
              sendExpiryWarning(merged.name || merged.email, merged.email, profile.plan, expires);
              localStorage.setItem(`secuvion_expiry_warned_${firebaseUser.uid}`, today);
            }
          }

          // Send promo email 3 days after signup (once)
          if (profile?.createdAt && !localStorage.getItem(`secuvion_promo_sent_${firebaseUser.uid}`)) {
            const created = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
            const daysSinceSignup = (Date.now() - created) / 86400000;
            if (daysSinceSignup >= 3) {
              sendPromoEmail(merged.name || merged.email, merged.email);
              localStorage.setItem(`secuvion_promo_sent_${firebaseUser.uid}`, "true");
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

  const login = useCallback(async (email, password) => {
    const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (demoUser) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: credential.user };
      } catch (_firebaseError) {
        const session = { ...demoUser, uid: "demo_" + demoUser.id };
        delete session.password;
        setUser(session);
        return { success: true, user: session };
      }
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: credential.user };
    } catch (error) {
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

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message || "Google sign-in failed" };
    }
  }, []);

  const loginWithGithub = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message || "GitHub sign-in failed" };
    }
  }, []);

  const loginWithFacebook = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message || "Facebook sign-in failed" };
    }
  }, []);

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

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Password reset failed" };
    }
  }, []);

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
    updatePlan,
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
