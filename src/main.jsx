import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App.jsx";
import { installGlobalHandlers } from "./services/errorReporter";
import { initDatadog } from "./lib/datadog";
import "./i18n.js"; // initialize i18next before any component renders
import "./styles/fonts.css";
import "./index.css";
import "./styles/global.css";
import "./styles/animations.css";
import "./styles/responsive.css";

// One-time migration: secuvion_* → vrikaan_* (post-rebrand, runs once per browser)
(function migrateLocalStorage() {
  try {
    if (localStorage.getItem("vrikaan_migrated_v1")) return;
    const oldKeys = Object.keys(localStorage).filter((k) => k.startsWith("secuvion_") || k.startsWith("secuvion:"));
    oldKeys.forEach((oldKey) => {
      const newKey = oldKey.startsWith("secuvion:")
        ? oldKey.replace(/^secuvion:/, "vrikaan:")
        : oldKey.replace(/^secuvion_/, "vrikaan_");
      const value = localStorage.getItem(oldKey);
      if (value !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, value);
      }
      localStorage.removeItem(oldKey);
    });
    localStorage.setItem("vrikaan_migrated_v1", "1");
  } catch (e) { /* noop */ }
})();

// Ping streak counter on every app boot — only counts once per day
import("./services/gamificationService").then(({ pingActivity }) => {
  try { pingActivity(); } catch { /* noop */ }
}).catch(() => {});

inject();
injectSpeedInsights();
installGlobalHandlers();
initDatadog(); // no-op unless VITE_DD_* keys present + production

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Tell splash.js the app is mounted so it can hide immediately (no fixed 5s wait
// that was blocking clicks on first load). Double rAF = after first paint.
requestAnimationFrame(() => requestAnimationFrame(() => {
  window.dispatchEvent(new Event("vrikaan:ready"));
}));

// Stale-chunk recovery: after a new deploy, an already-open tab still references
// the OLD hashed chunk filenames. Navigating to a lazy route then 404s with
// "Failed to fetch dynamically imported module". Vite fires `vite:preloadError`
// — reload once (loop-guarded) to pull the fresh index.html + new chunks.
window.addEventListener("vite:preloadError", () => {
  const last = Number(sessionStorage.getItem("vrikaan_chunkReloadAt")) || 0;
  if (Date.now() - last > 10000) {
    sessionStorage.setItem("vrikaan_chunkReloadAt", String(Date.now()));
    window.location.reload();
  }
});

// PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Report Web Vitals to console in dev
if (import.meta.env.DEV) {
  import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
    onINP(console.log);
  }).catch(() => {});
}