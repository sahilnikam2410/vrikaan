/**
 * i18n bootstrap.
 *
 * Two locales now (en + hi). Add more by:
 *   1. dropping a `src/locales/<code>.json` with the same key shape
 *   2. importing it below and adding to `resources`
 *
 * Strings are flat-grouped by surface (nav, footer, hero, login, signup,
 * pricing) so a translator can work one section at a time. Keys NOT yet
 * translated fall back to the `en` value automatically.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import mr from "./locales/mr.json";
import bn from "./locales/bn.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      mr: { translation: mr },
      bn: { translation: bn },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "ta", "te", "mr", "bn"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "vrikaan_lang",
    },
    interpolation: { escapeValue: false }, // React already escapes
  });

export default i18n;
