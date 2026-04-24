import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem("secuvion_pwa_dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 30 seconds on the site
      setTimeout(() => setShow(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("secuvion_pwa_dismissed", "1");
  };

  if (!show || installed) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: "rgba(17,24,39,0.95)", border: "1px solid rgba(99,102,241,0.3)",
      borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
      zIndex: 9998, backdropFilter: "blur(12px)", maxWidth: 420, width: "calc(100% - 32px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "pwaSlideUp 0.4s ease"
    }}>
      <style>{`@keyframes pwaSlideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Install VRIKAAN</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get instant access from your home screen</div>
      </div>
      <button onClick={handleInstall} style={{
        padding: "8px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
        borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap"
      }}>Install</button>
      <button onClick={dismiss} style={{
        background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer",
        padding: "0 4px", lineHeight: 1
      }}>&times;</button>
    </div>
  );
}
