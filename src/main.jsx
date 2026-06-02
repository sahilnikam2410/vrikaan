import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App.jsx";
import { installGlobalHandlers } from "./services/errorReporter";
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