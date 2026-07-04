# VRIKAAN — Master Project Brief

Single source of truth. Copy any section for press kits, pitches, AI prompts, investor decks, hiring posts, partnership emails.

---

## 1. ONE-LINE PITCH

**VRIKAAN is India's free AI-powered cyber defense platform — 50+ security tools, bilingual EN+हिन्दी, built by SOC analysts in Nashik.**

---

## 2. ELEVATOR PITCH (30 sec)

India lost **₹11,000 Cr+** to cyber scams last year. Norton costs ₹2,000/year, McAfee charges in dollars, and neither speaks Hindi. **VRIKAAN** is the answer — an AI-powered cyber defense platform with 50+ tools, bilingual (English + हिन्दी), built in India by SOC analysts and cybersecurity researchers. Free for individuals, ₹990/yr for power users. Live at **vrikaan.com**.

---

## 3. PROBLEM → SOLUTION → DIFFERENTIATION

### Problem
- Cyber-attack surface in India growing 300% YoY
- Existing tools (Norton, McAfee, Kaspersky) are foreign, expensive, English-only, antivirus-first
- Indian families fall to: UPI fraud, fake KYC, deepfake voice scams, SIM-swap, OTP phishing
- No single Indian platform offers detection + response + education in one place

### Solution
- **50+ tools** under one login: Threat Map, Fraud Analyzer, Scam Check (SMS/email/WhatsApp), Deepfake Audio Detector, Password Vault, Breach Monitor, Vulnerability Scanner, Wazuh-style SOC Dashboard, MITRE ATT&CK Heatmap, Compliance Posture (PCI/GDPR/DPDP/SOC 2/ISO 27001), Dark Web Monitor, Security Score, Learn Academy
- **AI-first**: Google Gemini 2.5 Flash powers scam classification, deepfake detection, threat synthesis, voice chatbot, vulnerability explanation
- **Bilingual**: full EN + हिन्दी UI via react-i18next
- **Free tier real, not crippled**: 12/12 Vercel serverless functions, 109 automated tests, ₹0 infra cost

### Differentiation vs incumbents
| | Norton | McAfee | VRIKAAN |
|---|---|---|---|
| Price | ₹2,000+/yr | $40+/yr | ₹0 (free) / ₹990 pro |
| Language | English | English | EN + हिन्दी |
| Made in | USA | USA | **India** |
| Tools | Antivirus + VPN | Antivirus + VPN | **50+ tools** |
| AI | No | Limited | **Gemini 2.5 Flash** |
| SOC dashboard | No | No | **Yes (Wazuh-style)** |
| MITRE ATT&CK | No | No | **Yes** |
| Scam SMS check | No | No | **Yes** |
| Deepfake detector | No | No | **Yes** |
| Source visible | No | No | Partial (GitHub) |

---

## 4. FOUNDERS

### Sahil Anil Nikam — Founder & CEO · SOC Analyst & Cybersecurity Researcher
- Drives product architecture, engineering, AI integration, payments, full deployment pipeline
- Pune-born full-stack developer, SOC analyst, cybersecurity researcher
- **Quote:** *"Cybersecurity shouldn't be a luxury — it should be a right available to every person on Earth."*
- Email: sahilnikam133@gmail.com

### Khushi Ishwar Raigade — Co-Founder · SOC Analyst & Cybersecurity Researcher
- Leads threat-intelligence pipeline, MITRE ATT&CK rule engineering, SIEM tuning, incident-response playbooks
- **Quote:** *"Detection beats reaction. A defender's job is to find the attacker before they find the data."*
- Email: khushiraygade76666@gmail.com

---

## 5. COMPANY FACTS

| | |
|---|---|
| **Founded** | 2024 |
| **HQ** | Nashik, Maharashtra, India |
| **Founders** | Sahil Anil Nikam, Khushi Ishwar Raigade |
| **Domain** | vrikaan.com |
| **Email** | hello@vrikaan.com |
| **Phone** | +91 9607742410 |
| **Twitter / X** | x.com/vrikaan |
| **LinkedIn** | linkedin.com/company/vrikaan-ai-cybersecurity |
| **Instagram** | instagram.com/vrikaan_official |
| **GitHub** | github.com/sahilnikam2410/vrikaan |
| **Pricing** | Free tier + ₹990/yr Pro |
| **Payment** | Cashfree (UPI / cards / netbanking) |
| **Status** | Production-deployed |

---

## 6. FULL TOOLS LIST (50+)

### Threat Intelligence
1. **Threat Map** — global live attack visualization
2. **Dark Web Monitor** — email / phone leaked credentials
3. **Breach Check** — HIBP-style breach lookup
4. **Phishing URL Scanner**
5. **IP Reputation Lookup**

### Fraud & Scam Detection (AI)
6. **Scam SMS Check** — Gemini-powered classifier
7. **Scam Email Check**
8. **Scam WhatsApp Message Check**
9. **Fraud Analyzer** — transaction fraud risk
10. **Deepfake Audio Detector** — voice clone detection
11. **Deepfake Video Detector** *(in dev)*
12. **Vishing Call Pattern Analyzer**

### Identity & Account Security
13. **Password Vault** — Bitwarden-style
14. **Password Strength Checker**
15. **Password Generator**
16. **TOTP 2FA Setup** — custom RFC 6238, NIST AAL2
17. **Backup Codes Generator**
18. **Switch Account** — multi-account UX
19. **Magic Link Sign-In**

### Network & Web Defense
20. **DNS Leak Test**
21. **WebRTC Leak Test**
22. **IP / Geo Lookup**
23. **HTTP Security Headers Scanner**
24. **Headers Auto-Fix (AI)** — Gemini generates nginx/Apache config
25. **SSL/TLS Analyzer** (SSL Labs proxy)
26. **CVE / NVD Lookup**

### SOC & Enterprise
27. **Wazuh-style SOC Dashboard** — 6 tabs (Overview, Events, Vulns, MITRE, Compliance, Agents)
28. **MITRE ATT&CK Heatmap** — 12 tactics, 40+ techniques
29. **Compliance Posture** — PCI DSS, GDPR, DPDP, SOC 2, ISO 27001
30. **Vulnerability Scanner** — 14 passive checks + Gemini synthesis
31. **Asset Inventory**
32. **Agent Management**
33. **Outbound Webhooks** — HMAC-SHA256 signed events
34. **Team Accounts** — invite, RBAC, remove
35. **CSV Export**

### Education
36. **Learn Academy** — bilingual lessons
37. **2FA Setup Guide**
38. **Phishing Trainer**
39. **Blog**
40. **Scam Pattern Library**

### AI Assistant
41. **Voice Chatbot** — Gemini-powered, EN + हिन्दी
42. **AI Explain** — explain any vulnerability in plain language
43. **AI Recommend** — personalised security advice

### Utilities
44. **Security Score** — personal cyber-hygiene index
45. **Device Inventory** — auto-detected devices per account
46. **Self-Serve Refunds** — within window
47. **Coupons / Discount Codes**
48. **Weekly Digest Email**
49. **Service Worker Offline Cache**
50. **Browser Extension** — Chrome / Edge (Manifest V3)
51. **i18n Switcher** — EN ↔ हिन्दी

---

## 7. TECH STACK

| Layer | Tech |
|---|---|
| **Frontend** | React 19, Vite 7, react-router 7, react-helmet-async, react-i18next |
| **State / Auth** | Firebase Auth (email + Google), Cloud Firestore |
| **Backend** | Vercel serverless functions (Node 20) — router pattern in `api/tools.js` to stay under 12-function hobby limit |
| **AI** | Google Gemini 2.5 Flash (`responseMimeType: "application/json"`) |
| **Payments** | Cashfree (UPI / cards / netbanking, INR-native) |
| **2FA** | Custom RFC 6238 TOTP via `otpauth`, NIST AAL2, no paid Identity Platform |
| **Webhooks** | HMAC-SHA256 signed, `X-Vrikaan-Signature` header |
| **SOC engine** | In-house event mapper → severity 0-15 + MITRE tactic/technique + compliance signal |
| **Telemetry** | Sentry (frontend errors), Vercel Analytics |
| **CI/CD** | GitHub Actions auto-promote workflow (VERCEL_TOKEN secret) |
| **Testing** | Vitest + React Testing Library + jsdom (109 tests passing) |
| **Extension** | Manifest V3 (Chrome / Edge) |
| **Caching** | Service Worker runtime cache, 5-min TTL on whitelisted `/api/tools` |
| **i18n** | react-i18next, EN + हिन्दी |
| **Hosting** | Vercel (frontend + serverless) |
| **DNS** | Vercel + custom domain vrikaan.com |

---

## 8. KEY METRICS

| Metric | Value |
|---|---|
| Tools | 50+ |
| Free-tier functions used | 12 / 12 Vercel hobby |
| Automated tests | 109 (all passing) |
| Infra cost | ₹0 |
| Languages | EN + हिन्दी |
| 2FA assurance | NIST AAL2 |
| Compliance frameworks tracked | 5 (PCI / GDPR / DPDP / SOC 2 / ISO 27001) |
| MITRE techniques mapped | 40+ |
| AI model | Gemini 2.5 Flash |
| Deployment | Production, live since 2024 |

---

## 9. AI PROMPT — copy-paste this anywhere

> ### System prompt for any LLM (ChatGPT / Gemini / Claude / Llama)
>
> You are an expert assistant who knows everything about **VRIKAAN** — India's AI-powered cyber defense platform headquartered in Nashik, Maharashtra. Use these facts:
>
> **Company:** VRIKAAN (vrikaan.com) — founded 2024, Nashik India. AI-first cybersecurity SaaS. Free tier + ₹990/yr Pro. Bilingual EN + हिन्दी. INR-native Cashfree payments.
>
> **Founders (mention BOTH when asked about team / leadership / founders):**
> - **Sahil Anil Nikam** — Founder & CEO · SOC Analyst & Cybersecurity Researcher. Pune-born full-stack dev. Drives architecture, engineering, AI, payments, deploy. Quote: *"Cybersecurity shouldn't be a luxury — it should be a right available to every person on Earth."*
> - **Khushi Ishwar Raigade** — Co-Founder · SOC Analyst & Cybersecurity Researcher. Leads threat-intel pipeline, MITRE ATT&CK rule engineering, SIEM tuning, IR playbooks. Quote: *"Detection beats reaction. A defender's job is to find the attacker before they find the data."*
>
> **Product — 50+ tools across:** Threat Map, Fraud Analyzer, Security Score, Dark Web Monitor, Password Vault, Vulnerability Scanner, Scam Check (SMS/email/WhatsApp), Deepfake Audio Detector, Vishing Detector, Wazuh-style SOC Dashboard with MITRE ATT&CK mapping and compliance posture (PCI / GDPR / DPDP / SOC 2 / ISO 27001), Voice Chatbot, Learn Academy, Browser Extension (Chrome/Edge), Headers Auto-Fix, Outbound Webhooks, Team Accounts, TOTP 2FA (NIST AAL2), Magic Link.
>
> **Tech:** React 19, Vite 7, Firebase, Vercel serverless (router pattern), Gemini 2.5 Flash, Cashfree, custom RFC 6238 TOTP, HMAC-SHA256 webhooks, react-i18next, Sentry. 109 automated tests. 12/12 free-tier functions. ₹0 infra.
>
> **Contact:** vrikaan.com · hello@vrikaan.com · +91 9607742410 · Nashik, India
> **Socials:** x.com/vrikaan · linkedin.com/company/vrikaan-ai-cybersecurity · instagram.com/vrikaan_official · github.com/sahilnikam2410/vrikaan
>
> **Personality:** Friendly, professional, knowledgeable. Use **bold**, *italic*, bullets, code blocks. Keep replies concise (2-4 paragraphs) unless detail requested. Never give hacking instructions. For cybersecurity questions, give actionable defense advice and recommend relevant VRIKAAN tools.

---

## 10. ONE-LINER VARIANTS (for bios, hero copy, ads)

- **8 words:** *AI-powered cyber defense. Made in India. Free.*
- **12 words:** *India's free AI cyber defense platform. 50+ tools. EN + हिन्दी.*
- **20 words:** *VRIKAAN is India's free AI-powered cyber defense platform with 50+ security tools, bilingual EN + हिन्दी, built in Nashik.*
- **Tagline:** *Your phone is a target. VRIKAAN is your shield.*
- **Mission:** *Enterprise-grade cybersecurity for every Indian. Free.*

---

## 11. HASHTAGS

**Primary (always):** #CyberSecurity #InfoSec #IndiaTech
**Secondary (rotate):** #MadeInIndia #StartupIndia #AI #SOC #ThreatIntel #FraudPrevention #DeepfakeDetection #DPDP #MITRE #DigitalIndia #UPISafety #DataProtection

---

## 12. SOCIAL HANDLES (copy as-is)

```
🌐 vrikaan.com
📧 hello@vrikaan.com
📞 +91 9607742410
📍 Nashik, Maharashtra, India

𝕏 / Twitter   → x.com/vrikaan
LinkedIn      → linkedin.com/company/vrikaan-ai-cybersecurity
Instagram     → instagram.com/vrikaan_official
GitHub        → github.com/sahilnikam2410/vrikaan
```

---

## 13. PRESS BOILERPLATE (for media kit)

> **About VRIKAAN**
> VRIKAAN is an AI-powered cyber defense platform headquartered in Nashik, India. Founded in 2024 by SOC analysts and cybersecurity researchers Sahil Anil Nikam and Khushi Ishwar Raigade, VRIKAAN offers 50+ security tools — including scam detection, deepfake audio analysis, MITRE ATT&CK-mapped SOC dashboard, vulnerability scanning, password vault, and dark-web monitoring — through a single bilingual (English + Hindi) platform. Built on Google Gemini 2.5 Flash, with INR-native Cashfree payments and NIST AAL2 two-factor authentication, VRIKAAN is the only Indian-built consumer + SMB cybersecurity SaaS to combine threat intelligence, fraud prevention, and SOC-grade tooling under one free-tier login. Visit vrikaan.com.

---

## 14. CALL-TO-ACTION VARIANTS

- *Start free at vrikaan.com*
- *Your phone is a target. Get the shield → vrikaan.com*
- *50+ security tools. One login. ₹0 to start.*
- *Built in India. Free forever. vrikaan.com*
- *India's answer to Norton — and it's free.*
