# VRIKAAN — Presenter Script & Q&A Guide

**For:** Sahil Anil Nikam · PRN 220105131264 · Sandip University Nashik
**Deck:** `vrikaan-presentation.pptx` (16 slides) · ~12–15 minutes
**Live demo:** https://vrikaan.com

---

## How to use this guide

- **Spoken script** — what to say, conversational. Don't read verbatim; use as memory aid.
- **Key numbers** — the stats that prove the work is real.
- **If asked** — common professor follow-ups + crisp answers.
- Practice 3 times. Aim for ~50 sec per slide. Total ~13 min + 2 min demo.

---

## SLIDE 1 — Title

> Good morning sir/ma'am. I'm Sahil Anil Nikam, PRN 220105131264, from
> the Computer Engineering department. My final-year project is **VRIKAAN**
> — an AI-powered cyber defense platform. It is **live in production** at
> **vrikaan.com**. Anyone in this room can open it on their phone right now.

**If asked**: "Why this name?" → "VRIKAAN means 'guardian wolf' in Sanskrit
— the brand identity is the alert wolf protecting your digital life."

---

## SLIDE 2 — Problem Statement

> India lost over **eleven thousand crore rupees** to cybercrime in 2024 alone,
> and that number is growing seventy percent year over year. The defense
> tools we have don't match the scale of the problem.
>
> They are **fragmented** — users juggle one app for VPN, another for
> passwords, another for breach checks. They are **costly** — premium suites
> are priced for enterprises, not students. They are **English-only**, **reactive**
> instead of proactive, and **opaque** about what they're scanning.

**Key numbers**: ₹11,000 Cr+ losses (I4C 2024), 70% YoY growth.

**If asked**: "Source?" → "Indian Cyber Crime Coordination Centre (I4C)
under MHA — National Cyber Crime Reporting Portal stats."

---

## SLIDE 3 — Literature Review

> I studied the existing solutions. Norton 360, McAfee, 1Password, NordVPN
> — each is excellent in its narrow scope, but they all share two problems:
> they don't talk to each other, and they're priced for foreign markets.
>
> The closest free option is HaveIBeenPwned, but that's just a single
> breach lookup with no UI suite. The gap I identified: **no all-in-one,
> bilingual, INR-priced cybersecurity SaaS for Indian students and SMBs.**
> That's the gap VRIKAAN fills.

**If asked**: "Why not just contribute to existing tools?" → "I wanted full
control over the architecture and an India-first product — pricing, language,
payment rails (Cashfree UPI), regional threat patterns. None of those would
land as a contribution."

---

## SLIDE 4 — Project Objectives

> I set six concrete objectives:
>
> 1. **Unify** — over fifty tools in one dashboard
> 2. **Educate** — every result includes a plain-English explanation; we have
>    a phishing trainer that gamifies learning
> 3. **Defend** — real-time scans, not just historical lookups
> 4. **Localize** — full Hindi support
> 5. **Monetize** — Cashfree handles UPI, cards, netbanking — INR native
> 6. **Scale** — serverless on Vercel + Firebase, so it costs me ₹0 until users arrive

**If asked**: "How many tools actually work?" → "Around fifty production-ready,
plus thirty-five SEO threat-detail pages. Demo any one — DNS leak test is the
flashiest."

---

## SLIDE 5 — Tech Stack

> I chose a modern, free-tier-friendly stack.
>
> **Frontend**: React 19 with Vite 7 — sub-second hot reload during dev,
> esbuild-minified for production. Recharts for analytics, Three.js for the
> 3D threat globe.
>
> **Backend**: Vercel serverless functions — I'm at the hobby tier limit
> of twelve, so I built a router pattern in `api/tools.js` that hosts
> eighteen actions inside one function slot. Firebase Auth handles OAuth,
> phone OTP, magic links, and my custom TOTP 2FA.
>
> **Integrations**: Cashfree for INR payments, EmailJS for transactional
> mail, Sentry for error telemetry, Cloudflare Turnstile for CAPTCHA.

**If asked**: "Why React, not Vue/Svelte?" → "Largest hiring market and
the strongest TypeScript / hooks ecosystem. Also React 19's concurrent
rendering keeps the threat-map smooth."

**If asked**: "Why serverless instead of a Node server?" → "Zero cold-start
maintenance, automatic SSL, free CDN, and Vercel auto-scales without my
intervention. For an indie product this is the right tradeoff."

---

## SLIDE 6 — Methodology

> I followed an **iterative Agile workflow**: plan, build, test, ship, observe
> — repeated daily.
>
> Every change goes through Git. Every push triggers Vercel build, then a
> GitHub Action auto-promotes the latest Ready deploy to vrikaan.com.
> Vitest catches regressions, Sentry catches runtime errors I missed in
> testing, and the loop closes back to the next sprint.
>
> Result: in a single sprint I shipped sixteen feature commits with **zero
> production rollbacks**.

**If asked**: "What about waterfall / SDLC documentation?" → "I have a
README, this slide deck, the GitHub commit log, and inline JSDoc — that's
the documentation. Agile values working software over comprehensive docs,
and this is a one-person team."

---

## SLIDE 7 — System Architecture

> Three layers, top to bottom.
>
> The **client layer** is a React single-page app with a service worker that
> caches the shell offline and the API responses for five minutes.
>
> The **API layer** lives on Vercel — twelve serverless function files,
> with `tools.js` acting as a router for eighteen related actions.
>
> The **data layer** is Firestore for documents and Firebase Auth for
> identity. Third-party integrations like Cashfree and ipinfo are called
> server-side so secrets never touch the browser.

**If asked**: "Why Firestore over PostgreSQL?" → "Real-time listeners out
of the box, no schema migrations, generous free tier (50k reads/day), and
the security rules engine enforces ownership at the database level — no
ORM-level bugs can leak data."

---

## SLIDE 8 — Database Design

> I designed six core Firestore collections.
>
> `users/{uid}` holds the profile, plan tier, and the encrypted MFA secret.
> Beneath each user are `devices`, `payments`, `toolHistory`, `activity`,
> and `apikeys` subcollections — owner-scoped by Firestore security rules.
>
> `teams` and `teamInvites` support the multi-user workspace feature.
> `coupons` is admin-managed but publicly readable by document ID so
> checkout can validate codes without enumerating the collection.
>
> All write paths for teams, coupons, and payments go through the server
> using the Firebase Admin SDK — clients literally cannot create those
> documents directly. This eliminates a whole class of privilege-escalation
> bugs.

**If asked**: "What if Firestore goes down?" → "Firebase has 99.95% SLA. I
also do nightly backups via a GitHub Actions workflow that exports every
collection to JSON."

---

## SLIDE 9 — Core Features (Tools)

> Quick tour of what users actually use day-to-day. **Twelve highlights**
> from over fifty tools:
>
> - **DNS & WebRTC Leak Test** — checks whether your VPN is leaking your
>   real IP. We proxy through our server to bypass CORS.
> - **IP Lookup / WHOIS** — geo-location and ownership of any IP or domain.
> - **Security Headers Scan** — audits CSP, HSTS, X-Frame-Options on any URL.
> - **Breach Check** — k-anonymity hash check against haveibeenpwned.
> - **Password Vault** — local-only zero-knowledge store; we never see plaintext.
> - **Phishing Trainer** — interactive quiz with red-flag explanations.
> - Plus dark-web monitor, identity x-ray, file hash scan, QR scan,
>   email/fraud analyzer, bulk URL scan.

**Demo plan**: Open the live site, click DNS leak test, run scan in 5
seconds. Most impressive single demo.

---

## SLIDE 10 — Core Features (Platform)

> Beyond the tools, it's a complete SaaS:
>
> - **User Dashboard** with security score, device list, payment history,
>   and live charts using Recharts.
> - **Cashfree Payments** — UPI, cards, netbanking. Server-verified, with
>   self-serve refunds inside a 7-day window.
> - **Team Accounts** — invite teammates by email, role-based access.
> - **AI Chatbot** powered by Google Gemini, plan-gated and rate-limited.
> - **Push Notifications** — browser push (VAPID), in-app drawer, and
>   weekly EmailJS digests.
> - **Gamification** — badges and streaks to drive retention.
> - **Admin Console** with step-up authentication.
> - **PWA** — installable offline.

**If asked**: "Cashfree integration — how secure?" → "All three layers:
client opens checkout via Cashfree SDK, server verifies the order via
Cashfree's API after redirect, and webhook posts are HMAC-signed."

---

## SLIDE 11 — Security Hardening

> The product itself is built to its own standards. Eight measures:
>
> **TOTP 2FA** — I built a custom TOTP system using the otpauth library, so
> we don't need Firebase's paid Identity Platform tier. Users scan a QR
> with Google Authenticator and get ten one-time backup codes.
>
> **Magic-link login** for users who forget passwords.
>
> **Outbound webhooks signed with HMAC-SHA256** — the receiver verifies
> the `X-Vrikaan-Signature` header.
>
> **Strict Content-Security-Policy** — default-deny with explicit
> per-domain allowlists.
>
> **Rate limiting** in four tiers based on plan.
>
> **Firestore rules** that block client elevation.
>
> **Self-serve refunds** with a server-side 7-day window.
>
> **Email verification gate** before tools work — kills spam signups.

**If asked**: "Was there a security incident?" → "Not on production. During
testing I caught a TDZ bug in the login page that crashed the route — fix
went out within ten minutes. That's the value of having Sentry wired up
from day one."

---

## SLIDE 12 — Quality, Testing, Operations

> I treat this like a production product, not a college submission.
>
> **Thirty-three Vitest tests pass** — covering pure logic for the billing
> math, CSV escaping, plan-tier gating, and the React component for the
> upgrade overlay.
>
> **Twelve out of twelve Vercel functions** used — I had to consolidate
> aggressively to fit within the hobby tier limit.
>
> **Production builds finish in under two minutes**.
>
> **GitHub Actions** auto-promote successful builds to vrikaan.com.
>
> **Sentry** catches anything that escapes testing.
>
> **rollup-plugin-visualizer** shows me a treemap of bundle sizes so I can
> spot bloat early.
>
> **Activity-log cleanup cron** keeps Firestore lean by deleting entries
> older than 90 days.

**If asked**: "Why not 100% test coverage?" → "Pragmatic — I tested the
high-value pure logic and the critical UI path. Adding more tests for boilerplate
React would slow shipping without catching real bugs. Tests should pay for
themselves."

---

## SLIDE 13 — Live Demo & URLs

> This is the demo slide. I'd like to switch to my browser briefly.
>
> **Open vrikaan.com → /login** — show email + Google + magic-link options.
>
> **Sign in → Dashboard** — point out the security score, device card,
> activity log, push-notification toggle.
>
> **Click DNS Leak Test → Run Scan** — show real IP, ISP, location,
> WebRTC IPs all populated within 2 seconds.
>
> **Click Pricing** — show the coupon code field. (If you have a test
> coupon seeded, type it.)
>
> **Click Team** — show the invite-by-email flow.
>
> Back to slides.

**If demo fails / no internet**: pivot to slide 14 screenshot.

---

## SLIDE 14 — Admin Dashboard Screenshot

> This is the admin console. It's gated behind step-up authentication —
> only admin emails can reach it, and they must re-verify even after login.
>
> **Live stats** — total users, online now (last 5 minutes), 7-day actives,
> total revenue, ARPU.
>
> **User Growth chart** — area chart of cumulative signups over the last
> three months.
>
> **Plan Distribution donut** — current free vs starter vs enterprise mix.
>
> The sidebar gives the admin one-click access to user management, payment
> audit, broadcast notifications, audit log, and settings.

**If asked**: "How is admin role assigned?" → "Hardcoded email allowlist
in `AuthContext.jsx` and mirrored in Firestore security rules so neither
side can be bypassed. For a single-admin project this is simpler and safer
than a full RBAC schema."

---

## SLIDE 15 — Future Scope

> Eight directions for V2.
>
> **Full i18n** — extend Hindi to all fifty pages, add Marathi and Tamil.
> **Mobile app** — React Native wrapper with native push and biometric
> unlock. **ML threat scoring** — train a classifier on user-reported
> scams to auto-score new URLs. **Firebase Identity Platform MFA** for
> SMS and WebAuthn alongside TOTP. **Webhook event expansion** — scan
> complete, breach detected, invoice paid. **Enterprise tier** with SSO,
> SCIM, dedicated SOC dashboards. **Threat intelligence feed** subscribing
> to OSINT sources. And eventually a **personal AI agent** that scans new
> emails and SMS proactively.

**If asked**: "Which one would you build first?" → "Mobile app. Eighty
percent of Indian users browse on mobile, and the PWA is good but native
push and biometric unlock would meaningfully change the product."

---

## SLIDE 16 — Thank You

> To recap: eighteen major features shipped, thirty-three automated tests,
> sixteen-plus commits this sprint, twelve out of twelve serverless
> functions used, all live in production at vrikaan.com.
>
> Connect with VRIKAAN on X, LinkedIn, Instagram, and the open-source
> repo on GitHub — links on the slide.
>
> Thank you, sir/ma'am. I'm happy to take questions.

---

## Likely Q&A — be ready

| Question | Crisp answer |
|----------|--------------|
| Is this just a clone of an existing site? | No. Source on GitHub. Architecture, schema, API design, payment integration — all original. |
| How long did this take? | Roughly four months part-time. Last sprint shipped 18 features in one week. |
| What was the hardest part? | Working under Vercel's 12-function hobby cap — forced me to design the router pattern in `tools.js` that turned out cleaner than separate files would have been. |
| Did you use AI to write code? | Yes — I used Claude as a pair-programmer for boilerplate. Architecture, debugging, business logic decisions are mine. The TOTP design, refund flow, and Firestore rules were all my decisions. |
| Why is there no proper backend / database server? | Firestore IS the database. Serverless functions ARE the backend. This is a modern Jamstack architecture — no Tomcat/Express server to maintain, scales automatically. |
| Cost to run? | ₹0 currently — entire stack on free tiers. Breaks even at ~50 paying users on Cashfree alone. |
| What if Firebase shuts down? | Nightly Firestore backups to JSON. Auth migration is harder but standard OAuth providers (Google, GitHub) carry over. |
| How do you handle GDPR / DPDP Act? | Account deletion endpoint wipes user doc + all subcollections. Privacy policy page lists data collected. |
| Did you write tests after the code or before (TDD)? | Mixed. Pure utilities (billing math, CSV) — tests written first. UI tests came after the components stabilized. |
| What's the most secure thing about it? | Firestore rules combined with server-only writes for sensitive collections. Even if someone bypasses my client code, they can't write to teams, coupons, or other users' data. |
| What would you change if starting over? | TypeScript from day one (currently JavaScript). And I'd pick Next.js over plain Vite for built-in route-based code splitting and image optimization. |
| Will it scale to 1 million users? | Vercel + Firebase comfortably handle that. The bottleneck would be Firestore costs (~₹15k/month at that scale) — well within what 1M users would generate in revenue. |

---

## Demo backup plan

If the internet fails during the live demo:
1. Switch to slide 14 (admin screenshot)
2. Open `dist/index.html` from a local production build
3. Or pre-record a 60-second screencast as a fallback `.mp4`

---

## Closing line

> "VRIKAAN proves that one student in Nashik can ship a production-grade
> SaaS that competes with Norton and McAfee on tools, beats them on price,
> and ships in Hindi. Thank you."
