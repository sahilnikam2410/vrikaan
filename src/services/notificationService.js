/**
 * Client-side notifications service.
 * Persists to localStorage per-user. Subscribers are notified when
 * notifications change so the bell / toast UIs can re-render.
 *
 * Notification shape:
 *   { id, msg, time, color, icon, read, toast?: boolean }
 */

const STORAGE_KEY = (uid) => `secuvion_notifications_${uid || "guest"}`;
const MAX_STORED = 50;
const listeners = new Set();

function now() {
  return new Date().toISOString();
}

function readAll(uid) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(uid)) || "[]");
  } catch {
    return [];
  }
}

function writeAll(uid, arr) {
  try {
    localStorage.setItem(STORAGE_KEY(uid), JSON.stringify(arr.slice(0, MAX_STORED)));
  } catch { /* storage full */ }
}

function emit() {
  listeners.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
}

function relTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Add a notification. `opts`: { msg, color, icon, toast }.
 * `toast: true` flags it for transient toast display (bell also gets it).
 */
export function addNotification(uid, opts) {
  const { msg, color = "#6366f1", icon = "✦", toast = false } = opts || {};
  if (!msg) return null;
  const n = {
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    msg,
    time: now(),
    color,
    icon,
    read: false,
    toast,
  };
  const list = readAll(uid);
  list.unshift(n);
  writeAll(uid, list);
  emit();
  return n;
}

/**
 * List notifications for a user, with `time` formatted as relative.
 */
export function listNotifications(uid) {
  return readAll(uid).map((n) => ({ ...n, time: relTime(n.time) }));
}

export function markAllRead(uid) {
  const list = readAll(uid).map((n) => ({ ...n, read: true }));
  writeAll(uid, list);
  emit();
}

export function markRead(uid, id) {
  const list = readAll(uid).map((n) => (n.id === id ? { ...n, read: true } : n));
  writeAll(uid, list);
  emit();
}

export function dismissNotification(uid, id) {
  const list = readAll(uid).filter((n) => n.id !== id);
  writeAll(uid, list);
  emit();
}

export function clearAll(uid) {
  writeAll(uid, []);
  emit();
}

/**
 * Subscribe to changes. Returns unsubscribe fn.
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Seed a welcome notification for first-time visitors.
 */
export function seedWelcome(uid) {
  if (readAll(uid).length > 0) return;
  addNotification(uid, {
    msg: "Welcome to VRIKAAN! Run your first scan to get started.",
    color: "#6366f1",
    icon: "★",
  });
}
