import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("vrikaan_theme") || "dark";
    } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("vrikaan_theme", mode);
  }, [mode]);

  const toggleTheme = () => setMode(m => m === "dark" ? "light" : "dark");

  const theme = mode === "dark" ? {
    bg: "#060a14", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8",
    mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8",
    cyan: "#14b8a6", green: "#22c55e", red: "#ef4444",
    border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827",
  } : {
    bg: "#f8fafc", dark: "#e2e8f0", white: "#0f172a", muted: "#475569",
    mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8",
    cyan: "#0d9488", green: "#16a34a", red: "#dc2626",
    border: "rgba(15,23,42,0.08)", card: "rgba(241,245,249,0.8)", surface: "#e2e8f0",
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
