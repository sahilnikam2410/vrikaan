import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App.jsx";
import "./index.css";
import "./styles/global.css";
import "./styles/animations.css";
import "./styles/responsive.css";

inject();
injectSpeedInsights();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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