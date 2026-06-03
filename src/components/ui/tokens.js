// VRIKAAN UI kit — design tokens. One source of truth for the shared
// components so every page shares spacing, radius, depth and colour.
export const tokens = {
  color: {
    bg: "#060a14",
    surface: "#0b1220",
    surfaceHover: "#0e1626",
    border: "rgba(148,163,184,0.12)",
    borderStrong: "rgba(148,163,184,0.22)",
    text: "#f1f5f9",
    muted: "#94a3b8",
    dim: "#64748b",
    cyan: "#14b8a6",
    cyanSoft: "#0d9488",
    accent: "#6366f1",
    green: "#22c55e",
    gold: "#fbbf24",
    red: "#ef4444",
    orange: "#ff7a45",
    purple: "#a78bfa",
    onAccent: "#04110e",
  },
  // 8px rhythm
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 64 },
  radius: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 },
  font: {
    sans: "'Vrikaan Sans', -apple-system, sans-serif",
    serif: "'Vrikaan Serif', Georgia, serif",
    mono: "'Vrikaan Mono', monospace",
  },
};

// Hex + alpha helper: alpha("#14b8a6", 0.12) -> "rgba(20,184,166,0.12)"
export function alpha(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export const T = tokens.color;
