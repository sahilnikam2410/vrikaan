import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हि", name: "हिन्दी" },
];

/**
 * Tiny EN/HI language switcher. Persists choice via i18next-browser-languagedetector
 * (localStorage key "vrikaan_lang").
 */
export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);
  const change = (code) => {
    if (code !== current) i18n.changeLanguage(code);
  };
  return (
    <div
      role="group"
      aria-label="Language"
      style={{ display: "inline-flex", gap: 2, padding: 2, borderRadius: 8, background: "rgba(15,23,42,0.5)", border: "1px solid rgba(148,163,184,0.1)" }}
    >
      {LANGS.map((l) => {
        const active = l.code === current;
        return (
          <button
            key={l.code}
            onClick={() => change(l.code)}
            title={l.name}
            aria-pressed={active}
            style={{
              padding: compact ? "2px 8px" : "4px 10px",
              fontSize: 12, fontWeight: 600,
              borderRadius: 6, border: "none",
              background: active ? "linear-gradient(135deg, #6366f1, #14e3c5)" : "transparent",
              color: active ? "#fff" : "#94a3b8",
              cursor: "pointer", fontFamily: "'Hanken Grotesk', sans-serif",
              transition: "background 0.15s, color 0.15s",
            }}
          >{l.label}</button>
        );
      })}
    </div>
  );
}
