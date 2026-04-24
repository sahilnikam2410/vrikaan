import { Component } from "react";
import { Link } from "react-router-dom";
import { captureException } from "../services/errorReporter";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.6)", white: "#f1f5f9",
  muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444",
  border: "rgba(148,163,184,0.08)",
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[VRIKAAN] Uncaught error:", error, errorInfo);
    captureException(error, {
      tags: { source: "react.errorBoundary" },
      extra: { componentStack: errorInfo?.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: T.bg, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 24,
        }}>
          <div style={{ textAlign: "center", maxWidth: 520 }}>
            {/* Shield icon */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28, fontWeight: 700, color: T.white,
              margin: "0 0 12px", letterSpacing: "-0.02em",
            }}>
              Something went wrong
            </h1>

            <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, margin: "0 0 8px" }}>
              An unexpected error occurred. Our systems have been notified.
            </p>

            <div style={{
              margin: "20px auto", padding: "12px 16px", maxWidth: 400,
              background: "rgba(239,68,68,0.06)", borderRadius: 10,
              border: "1px solid rgba(239,68,68,0.12)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, color: T.red, textAlign: "left",
              wordBreak: "break-word", lineHeight: 1.6,
            }}>
              {this.state.error?.message || "Unknown error"}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                style={{
                  padding: "13px 28px", borderRadius: 10, border: "none",
                  background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                }}
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "13px 28px", borderRadius: 10,
                  background: "transparent", border: `1px solid ${T.border}`,
                  color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
