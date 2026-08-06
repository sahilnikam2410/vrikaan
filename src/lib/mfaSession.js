/**
 * Client-side record of which sign-in session has cleared TOTP.
 *
 * This is a UX gate only — it decides whether to show the code prompt. The
 * enforcement lives on the server (api/tools.js checks the verified auth_times
 * stored on the user's mfa record), because anything kept in the browser can
 * be edited by whoever owns the browser.
 *
 * Keyed by `auth_time` from the Firebase ID token — the moment the user signed
 * in. It survives token refreshes but changes on every fresh sign-in, so a new
 * browser, an incognito window, or a re-login all require the code again.
 */
const KEY = "vrikaan_mfa_ok";

export function markMfaVerified(authTime) {
  if (!authTime) return;
  try { localStorage.setItem(KEY, String(authTime)); } catch { /* private mode */ }
}

export function isMfaVerified(authTime) {
  if (!authTime) return false;
  try { return localStorage.getItem(KEY) === String(authTime); } catch { return false; }
}

export function clearMfaVerified() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}

/** True when the account has 2FA on and this session hasn't satisfied it yet. */
export function mfaPending(user) {
  return !!user?.mfaEnabled && !isMfaVerified(user?.authTime);
}
