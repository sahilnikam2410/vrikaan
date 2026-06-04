import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  // Dark-only. Light mode was half-broken (site is hardcoded dark inline, only
  // var-consumers flipped) — removed. mode is fixed "dark"; toggle is a no-op.
  const mode = "dark";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    try { localStorage.setItem("vrikaan_theme", "dark"); } catch { /* ignore */ }
  }, []);

  const toggleTheme = () => {};

  const theme = {
    bg: "#060a14", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8",
    mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8",
    cyan: "#14b8a6", green: "#22c55e", red: "#ef4444",
    border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827",
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
