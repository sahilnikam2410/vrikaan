import { useState } from "react";

// ── Lazy-loaded YouTube facade ───────────────────────────────────────
// Shows YouTube's own thumbnail + a play button; only injects the heavy
// iframe on click (no perf cost on page load, no third-party JS until
// the user opts in). Set VIDEO_ID to your uploaded ad's YouTube id.
//   e.g. https://youtu.be/AbC123xyz  →  VIDEO_ID = "AbC123xyz"
// While VIDEO_ID is empty, the component renders nothing (safe to ship).
const VIDEO_ID = "9QPN6pFOnVU"; // VRIKAAN cinematic trailer

const T = { cyan: "#14b8a6", border: "rgba(148,163,184,0.12)" };

export default function HeroVideo() {
  const [playing, setPlaying] = useState(false);
  if (!VIDEO_ID) return null;

  const thumb = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto 40px" }}>
      <div
        style={{
          position: "relative", width: "100%", aspectRatio: "16 / 9",
          borderRadius: 20, overflow: "hidden", border: `1px solid ${T.border}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45), 0 0 40px rgba(20,184,166,0.06)",
          background: "#060a14",
        }}
      >
        {playing ? (
          <iframe
            title="VRIKAAN — AI scambaiter demo"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerated-display; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label="Play VRIKAAN demo video"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              border: 0, cursor: "pointer", padding: 0,
              background: `linear-gradient(rgba(6,10,20,0.25), rgba(6,10,20,0.45)), url(${thumb}) center/cover`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span
              style={{
                width: 84, height: 84, borderRadius: "50%",
                background: "rgba(20,184,166,0.92)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 12px 40px rgba(20,184,166,0.45)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#042f2a" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
