// Dynamic OG image generator — runs on Vercel Edge Runtime
// Usage: /api/og?title=Article+Title&category=Tips&subtitle=Optional
// Returns a 1200x630 PNG optimized for social share previews (Twitter, LinkedIn, Facebook, Slack).

import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const COLORS = {
  bg: "#030712",
  white: "#f1f5f9",
  muted: "#94a3b8",
  mutedDark: "#64748b",
  accent: "#6366f1",
  cyan: "#14e3c5",
  purple: "#a78bfa",
  red: "#ef4444",
  blue: "#38bdf8",
  green: "#22c55e",
};

// Per-category accent — matches Blog.jsx categoryColors
const CATEGORY_ACCENT = {
  News: COLORS.blue,
  Tutorials: COLORS.cyan,
  Tips: COLORS.green,
  Threats: COLORS.red,
  Industry: COLORS.purple,
  Default: COLORS.accent,
};

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = (searchParams.get("title") || "AI-Powered Cyber Defense Platform").slice(0, 120);
    const category = searchParams.get("category") || "";
    const subtitle = (searchParams.get("subtitle") || "Enterprise-grade cybersecurity for everyone").slice(0, 90);

    const accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.Default;

    return new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: COLORS.bg,
            padding: "64px 72px",
            position: "relative",
            fontFamily: "system-ui, sans-serif",
          },
          children: [
            // Radial glow
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  top: -150,
                  left: -150,
                  width: 600,
                  height: 600,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
                  display: "flex",
                },
              },
            },
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  bottom: -200,
                  right: -200,
                  width: 700,
                  height: 700,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${COLORS.accent}20 0%, transparent 70%)`,
                  display: "flex",
                },
              },
            },
            // Top row: logo + category
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  zIndex: 1,
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", alignItems: "center", gap: 16 },
                      children: [
                        // Shield icon (inline SVG via emoji-like rendering not supported, using a styled box)
                        {
                          type: "div",
                          props: {
                            style: {
                              width: 56,
                              height: 56,
                              borderRadius: 14,
                              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.cyan} 100%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 32,
                              fontWeight: 800,
                              color: "#fff",
                            },
                            children: "S",
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: 32,
                              fontWeight: 800,
                              color: COLORS.white,
                              letterSpacing: "0.15em",
                            },
                            children: "SECUVION",
                          },
                        },
                      ],
                    },
                  },
                  category
                    ? {
                        type: "div",
                        props: {
                          style: {
                            padding: "10px 22px",
                            borderRadius: 100,
                            background: `${accent}20`,
                            border: `2px solid ${accent}`,
                            color: accent,
                            fontSize: 20,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            display: "flex",
                          },
                          children: category,
                        },
                      }
                    : { type: "div", props: { style: { display: "flex" } } },
                ],
              },
            },
            // Middle: title
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  zIndex: 1,
                  maxWidth: 1050,
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: title.length > 60 ? 58 : title.length > 40 ? 68 : 76,
                        fontWeight: 800,
                        color: COLORS.white,
                        lineHeight: 1.1,
                        letterSpacing: "-0.03em",
                        display: "flex",
                      },
                      children: title,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 26,
                        color: COLORS.muted,
                        lineHeight: 1.4,
                        display: "flex",
                      },
                      children: subtitle,
                    },
                  },
                ],
              },
            },
            // Bottom: URL + accent bar
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  zIndex: 1,
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 22,
                        color: COLORS.mutedDark,
                        fontWeight: 500,
                        display: "flex",
                      },
                      children: "secuvion.vercel.app",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        width: 240,
                        height: 8,
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${accent} 0%, ${COLORS.cyan} 100%)`,
                        display: "flex",
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      }
    );
  } catch (e) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
