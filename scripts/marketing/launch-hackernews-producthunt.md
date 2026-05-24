# VRIKAAN — Hacker News + Product Hunt Launch Kit

Two launches, same week, different crowds:
- **Hacker News (Show HN)** — engineers / SOC analysts / open-source curious. Loves technical depth, hates marketing speak. First-comment matters more than title.
- **Product Hunt** — founders / makers / early adopters. Loves visuals + a clean tagline. Comments + upvotes peak in first 12 hours PST.

Stagger them. Post HN **Tuesday or Wednesday 7:30 AM PST** (early enough to catch SF wakeup), Product Hunt **same week Thursday 12:01 AM PST** (PH day rolls over at midnight Pacific).

---

# 1️⃣ HACKER NEWS — Show HN

## TITLE OPTIONS (pick one — A/B test offline first with co-founders)

Rules: max 80 chars, NO emojis, NO hype ("revolutionary", "world's first"), specific + curiosity-inducing.

```
A. Show HN: VRIKAAN – 50+ security tools on Vercel's 12-function free tier
B. Show HN: We shipped a Wazuh-style SOC dashboard on Vercel free tier
C. Show HN: VRIKAAN – AI cyber defense, EN+Hindi, free, MITRE ATT&CK mapped
D. Show HN: How we packed 18 backend actions into Vercel's 12-function limit
E. Show HN: Free Indian Norton alternative – Gemini AI + custom TOTP 2FA
```

**Recommend D** — most curiosity-driving for HN crowd (engineering puzzle). Body sells the rest.

---

## BODY (paste as URL = vrikaan.com, then immediately self-comment with this)

> Hacker News strips formatting heavily. Keep paragraphs short, code on its own line. No markdown headers, just blank lines. ≤ 1500 chars works best.

```
Hey HN,

I'm Sahil. Built VRIKAAN with my co-founder Khushi — we're both SOC analysts in Nashik, India. Site is live at vrikaan.com.

The constraint that drove the architecture: Vercel's hobby tier caps you at 12 serverless functions. We needed 18 backend actions (scam classifier, deepfake audio analyzer, vuln scanner, TOTP setup, webhook signer, SOC event mapper, MITRE rule engine, compliance evaluators for 5 frameworks, etc.).

Solution: single router pattern in api/tools.js. Every action keys on a `?action=<name>` param. 18 logical endpoints, 1 function count. Works for everything except cron + Cashfree webhook (which needed dedicated functions for fixed paths).

Other things engineers might find interesting:

— Custom RFC 6238 TOTP at NIST AAL2, written in ~150 lines using the `otpauth` lib. Skipped paying for Firebase Identity Platform.

— HMAC-SHA256 signed outbound webhooks. `X-Vrikaan-Signature: sha256=<hex>` header, replay protection via timestamp + nonce.

— Wazuh-style SOC dashboard with real MITRE ATT&CK tactic mapping. ~30 EVENT_RULES, severity 0-15 (Wazuh's scale), 12 tactics × 40+ techniques heatmap. 100% client-side from Firestore listeners.

— Bilingual EN + Hindi via react-i18next. INR-native payments via Cashfree.

— Gemini 2.5 Flash with `responseMimeType: "application/json"` for structured output. Cut parse failures from ~18% to <1%.

— 109 Vitest + RTL tests. ₹0 infra cost.

— Source: github.com/sahilnikam2410/vrikaan (it's not fully open but most marketing + scripts are public)

Built this because India lost ₹11k Cr to cyber scams last year and Norton is ₹2k/yr + English-only. Free tier covers all 50+ tools. ₹990/yr Pro adds unlimited AI scans.

Happy to answer anything — architecture, MITRE rule engineering, the router pattern, India payment quirks, why Gemini over Claude/GPT, anything.
```

**Character count: ~1,790** (slightly over — trim "Source: github..." paragraph if needed)

---

## PRE-LAUNCH CHECKLIST (24 hours before HN post)

- [ ] `vrikaan.com` returns < 500ms TTFB (HN front page = ~50k visitors in 6 hrs)
- [ ] Vercel function count visible at vercel.com → project → **Usage** tab (HNers will check)
- [ ] `/api/tools` router accepts unknown action gracefully (returns 400 not 500)
- [ ] **Sign-up flow works without account** for top 5 tools (no login wall on first impression)
- [ ] Mobile layout doesn't break on 375px (a third of HN visitors are mobile)
- [ ] Open `vrikaan.com/admin/soc` demo screenshot in /press folder — link it in replies
- [ ] Status page (`/status`) shows green
- [ ] Pre-warm Cloudflare cache by hitting top 20 routes once
- [ ] Both founders signed-in on HN accounts (not the brand account — looks astroturfed)
- [ ] Set up Plausible or Vercel Analytics alert at >500 concurrent users

---

## POSTING MECHANICS

**Best time:** Tuesday or Wednesday, **7:30 AM PST / 9:00 AM EST / 8:00 PM IST**. Avoids Monday inbox storm + Friday dead-zone.

**Sequence:**
1. Submit at hackernews.ycombinator.com/submit
   - Title: from the 5 options above
   - URL: `https://vrikaan.com` (NOT `/careers`, NOT a deep link — HN dislikes redirects)
2. Within 60 seconds, post the BODY above as a self-reply
3. Pin browser tab on the thread
4. Reply to every top-level comment within 15 min for the first 4 hours
5. Stay online for 6 hrs — momentum dies if author goes dark

**Do NOT:**
- ❌ Ask friends to upvote (HN detects vote rings, kills the post)
- ❌ Edit the title after posting (resets ranking algorithm)
- ❌ Argue with critics — answer the technical question, move on
- ❌ Mention "growth", "traction", "users" — HN despises marketing language
- ❌ Use emojis in body
- ❌ Submit on Sundays or Fridays

**Do:**
- ✅ Engage with skeptics — they upvote when you answer well
- ✅ Share code snippets if asked ("Here's the router pattern: <pastebin>")
- ✅ Admit limitations ("Yeah, the LinkedIn API is rate-limited, we work around it by ...")
- ✅ If someone asks "why not Cloudflare Workers?" — give the honest reason (cold starts on free tier, no Firestore native client)

---

## EXPECTED HN COMMENTS (prep your replies)

| Comment type | Pre-baked reply |
|---|---|
| **"Show me the router code"** | "Here's the full router: <link to gist>. Each action is a function in a single Map. Auth check + rate-limit run before the switch." |
| **"What if Gemini hallucinates a scam verdict?"** | "We force `responseMimeType: application/json` + a strict schema. ~1% parse failures vs ~18% before. We also surface confidence score and never auto-block — verdict is advisory only." |
| **"Why not Cloudflare Workers?"** | "Honest answer: Firestore doesn't have a native Workers client, and Workers KV doesn't replace document store semantics. Vercel + Firebase let us ship faster. Will consider if/when traffic justifies." |
| **"Is this open source?"** | "Mostly closed-source product, but marketing scripts + PPTX builders + a few utilities are public at github.com/sahilnikam2410/vrikaan. Happy to open more if there's interest." |
| **"Why Cashfree over Stripe?"** | "Stripe doesn't take INR from Indian businesses without a US entity. Cashfree is INR-native, supports UPI, cards, netbanking. Net cost ~2% per txn, settles next day." |
| **"How is your stuff better than Wazuh / Splunk?"** | "It's not — at SOC scale, Wazuh wins. We're targeting the user who can't afford to set up Wazuh: a freelancer, a small clinic, a student. SOC features + scam check + password vault in one free login." |
| **"How do you make money?"** | "₹990/yr Pro tier (unlimited scans, AI-powered analysis, priority support). Free tier is fully featured but rate-limited. ~6% free→paid is the goal." |
| **"What's stopping AWS / Microsoft from killing you?"** | "Nothing. We're betting that Hindi UI + ₹990 pricing + India-specific scam patterns is enough niche that they won't bother. If we're wrong, we pivot." |

---

## POST-PUBLISH WORKFLOW (first 6 hours)

| Hour | Action |
|---|---|
| 0:00 | Submit, self-comment with body |
| 0:05 | Reply to first 3 comments fast (proves you're present) |
| 0:30 | Check rank on /newest. If on front page (~30 upvotes), share thread on X + LinkedIn |
| 1:00 | If above #20 on front page, post tech-deep-dive in r/IndiaSpeaks + r/cybersecurity |
| 2:00 | Continue replying. Refresh /show every 5 min |
| 4:00 | Post a "thanks HN" reply summarizing top requests as a roadmap |
| 6:00 | Compile metrics (signups, screenshots of front-page rank) for next-day "what HN taught us" tweet |

---

## EXPECTED METRICS (realistic for first Show HN)

- **Front-page chance:** ~30% for technically interesting solo/team submissions
- **If front-page:** 15k–80k page views in 12 hrs, 100-400 signups, 30-80 comments
- **If not front-page:** 1k–4k views, 10-30 signups, useful feedback still
- **Domain authority bump:** large — HN backlinks index instantly on Google

---

---

# 2️⃣ PRODUCT HUNT — Launch Day Kit

## TAGLINE (60 chars max — picked from these)

```
A. AI-powered cyber defense for India · Free · 50+ tools
B. 50+ cybersecurity tools. One login. Free. Built in India.
C. Norton for India: free, AI-powered, English + Hindi
D. The free, AI cyber defense platform built for India
```

**Recommend A** (60 chars, says "India" early, leads with AI).

---

## NAME

```
VRIKAAN
```

PH allows subtitle in parentheses if needed — skip it, brand stands alone.

---

## DESCRIPTION (260 chars — sweet spot)

```
50+ AI-powered cybersecurity tools in one free login. Scam SMS detector, deepfake audio AI, MITRE ATT&CK SOC dashboard, vulnerability scanner, password vault. Bilingual EN + Hindi. Built in India by 2 SOC analysts. INR-native, ₹0 to start.
```

**260 chars exact** — fills the field, leaves no awkward whitespace.

---

## TOPICS (PH lets you pick up to 3 — pick wisely)

1. **Security** (primary — must-have, this is the main category)
2. **SaaS** (secondary — helps discovery)
3. **Developer Tools** (tertiary — captures the SOC/MITRE crowd)

❌ Skip: "AI" topic (too generic, gets buried) and "India" (limits global views).

---

## LINKS (fill all of these)

| Field | Value |
|---|---|
| Website | https://vrikaan.com |
| Apple Store | (leave blank — web-only for now) |
| Google Play | (leave blank) |
| GitHub | https://github.com/sahilnikam2410/vrikaan |
| Twitter / X | https://x.com/vrikaan |
| Instagram | https://www.instagram.com/vrikaan_official/ |
| LinkedIn | https://www.linkedin.com/company/vrikaan-ai-cybersecurity |
| Email | hello.vrikaan@gmail.com |

---

## GALLERY IMAGES (5 required, 1270×760 each)

Build these in Figma/Canva. Brand colors: bg #030712, indigo #6366F1, cyan #14E3C5, ink #F1F5F9.

| # | What it shows | Headline overlay |
|---|---|---|
| 1 | Homepage hero with VRIKAAN logo + "Your phone is a target. We're your shield." | "AI cyber defense, free." |
| 2 | SOC dashboard screenshot (admin/soc) — MITRE heatmap + event list + 4 stat tiles | "Wazuh-style SOC. Free tier." |
| 3 | Scam Check tool — phone screenshot showing SMS + AI verdict ("SCAM · 96%") | "Paste SMS. AI tells you if it's a scam." |
| 4 | Tools grid — 12 cards visible | "50+ tools in one login." |
| 5 | Bilingual UI side-by-side — same dashboard in English and हिन्दी | "Built for India. EN + हिन्दी." |

**Optional 6th (extra credit):** Founders photo + quote card — Sahil + Khushi w/ quote *"Cybersecurity shouldn't be a luxury."*

### Tip — first image (gallery cover) drives the click-through
Use big readable text, clear product UI, single bold color accent. PH viewers swipe in 0.4s — if the first image is muddy, they're gone.

---

## MAKER FIRST COMMENT (post within 5 min of going live)

```
👋 Hi PH! Sahil here — co-founder of VRIKAAN, along with Khushi Raigade (Co-Founder & SOC Analyst).

We built VRIKAAN because India lost ₹11,000 crore to cyber scams last year, and the existing tools (Norton, McAfee) cost ₹2,000+/yr, only speak English, and don't understand India-specific threats like UPI fraud, vishing calls, or AI voice-clone scams targeting grandparents.

What's in the free tier:
🛡 50+ tools — scam-SMS / WhatsApp / email AI, deepfake audio detector, password vault, dark-web monitor, vulnerability scanner
🛰 Wazuh-style SOC dashboard w/ MITRE ATT&CK tactic mapping + compliance posture (PCI / GDPR / DPDP / SOC 2 / ISO 27001)
🤖 Powered by Google Gemini 2.5 Flash for AI scans
🇮🇳 Bilingual EN + हिन्दी UI
🔐 Custom RFC 6238 TOTP at NIST AAL2 (no paid Firebase Identity Platform)
💸 INR-native via Cashfree, ₹0 free tier, ₹990/yr Pro

What we'd love feedback on:
1. **Onboarding flow** — does the dashboard tell you what to scan first?
2. **AI confidence display** — is "SCAM · 96%" clear, or should we explain how we got there?
3. **Which tool to build next** — there are 8 in our backlog; which would you want?

Built bootstrapped from Nashik. No outside funding to date. AMA in the comments — Khushi and I are answering live for the next 12 hours. 🙏
```

---

## HUNTER OUTREACH DM TEMPLATES

If a "hunter" with > 500 followers submits your product, it gets a 2-3x boost vs self-hunt. Reach out 5-7 days before launch.

### Template H1 — DM to a top India hunter (Chris Messina-style approach)
**Send via:** PH DM, X DM, or warm intro via Twitter mutual

```
Hey [Name],

I'm Sahil, co-founder of VRIKAAN — India-built AI cyber defense platform, launching on PH next [day].

We solve a specific Indian problem: foreign cybersecurity (Norton, McAfee) is ₹2k/yr + English-only, while India lost ₹11k Cr to scams last year. Our free tier ships scam-SMS AI, deepfake audio detector, Wazuh-style SOC, MITRE ATT&CK heatmap — all in EN + हिन्दी.

Live preview: vrikaan.com
SOC demo (the unusual feature): vrikaan.com/admin/soc

Would you be open to hunting us? We're targeting a Tuesday launch. We've got a clean gallery, ready maker comment, supporter list of ~250 we'll mobilize.

Happy to give you first look at the metrics / press kit / founder Zoom if useful.

Cheers,
Sahil  ·  hello.vrikaan@gmail.com
```

### Template H2 — DM to PH community hunters w/ tech focus
**Tone:** more technical, less "please hunt me"

```
Hey [Name],

Saw your hunt of [their recent hunt]. Genuinely cool product — the way you wrote up [specific feature] convinced me to sign up.

I'm Sahil — co-founder of VRIKAAN, a cybersecurity platform I think might fit your taste. We packed 50+ tools (scam AI, SOC dashboard w/ MITRE ATT&CK, vuln scanner, password vault) under Vercel's 12-function free tier limit via a router pattern. Bilingual EN + Hindi. India-first.

vrikaan.com — happy to share the engineering breakdown if you're curious.

Launching on PH next [day]. If you've got bandwidth to hunt, I'd be honored. Either way, would love your reaction to the SOC dashboard at vrikaan.com/admin/soc (it's free).

Sahil
```

### Recommended hunters to approach (research first — confirm they're active in 2026)

| Hunter | Specialty | Outreach via |
|---|---|---|
| **Chris Messina** | Mass appeal, top hunter | @chrismessina on X — DM rarely answers, comment on his hunts first |
| **Bram Kanstein** | Solo founders, B2C | @bramk on PH + X |
| **Kevin William David** | India / SaaS specialist | @KevinWiD on X, PH legend, especially helpful to Indian makers |
| **Hiten Shah** | Product-led-growth crowd | @hnshah |
| **Sahil Lavingia** | Solo founders, indie | @shl on X |

**India-specific hunters who actively boost Indian launches:**
- @rrhoover (PH founder) — long shot but worth a polite DM
- @KevinWiD — already noted
- Any 5-10 active makers from the YourStory ecosystem

---

## SUPPORTER MOBILIZATION (the 24 hrs before launch)

PH ranks by **upvote velocity in first 12 hrs PST**, not raw count. A trickle of upvotes throughout the day beats a spike from friends in hour 1.

**Build a launch-day list:**
1. Export your X followers, LinkedIn connections, WhatsApp group members
2. Slack-DM or WhatsApp 200-400 people 24 hrs before launch w/ template H3 below
3. Tell them: do NOT mass-vote in hour 1 — natural-feeling spread > spike
4. Provide direct PH URL once launched

### Template H3 — DM to your network (24 hrs before)
```
Hey! Quick favor 🙏

I'm launching VRIKAAN on Product Hunt tomorrow (Tuesday 12:01 AM PST = ~12:30 PM IST).

If you have 30 sec, would mean a lot if you could upvote + drop a comment. URL drops to you tomorrow morning.

Even 1-line feedback like "love the bilingual UI" counts more than a silent upvote — comments rank highest in PH's algo.

No pressure if busy. Either way, I'll share what we ship.

Sahil  ·  vrikaan.com
```

**Day-of:**
1. Post URL to your supporter list at 12:30 PM IST (PH go-live moment)
2. Pin URL on X bio + at top of your X profile
3. Post a thread on X explaining the build (link the X scam-education thread you already have)
4. Post on LinkedIn (rewrite top of maker comment as the LinkedIn caption)
5. Drop URL in 3-5 relevant Slack communities (Indian Hackers, Indie Hackers, IndieMaker, Maker.co)
6. Reply to **every** comment on PH within 15 min for first 4 hours
7. At hour 6, post a "We're #4 right now, thanks!" thank-you tweet (creates social proof for late-day visitors)

---

## EXPECTED OUTCOMES

**Top 3 Product of the Day:** realistic if you have ~80+ upvotes in first 6 hrs + comments engagement. Drives ~1,500-4,000 site visits.

**Top 10:** very achievable with mobilization above. ~500-1,200 visits.

**Featured on PH newsletter (1-day delay):** if you hit top 3, automatic. 200-500 extra visits over next 3 days.

**Long tail (30 days):** PH page acts as SEO backlink, drives 50-200 visits/month indefinitely.

---

## DON'T DO THESE

- ❌ Submit during US holidays (Thanksgiving week dead, Christmas-NYE dead)
- ❌ Submit on Mondays (Sunday hangover) or Saturdays (low engagement)
- ❌ Buy upvotes — PH auto-detects, removes upvotes + can ban
- ❌ Have all upvoters from same IP range (use your real distributed network)
- ❌ Use words "AI", "revolutionary", "game-changing" in tagline — PH crowd has fatigue
- ❌ Reply to critics defensively — say "fair point, here's our thinking, what would you change?" and move on
- ❌ Forget to add the **OG image** for shares — set vrikaan.com/api/og?title=VRIKAAN... as og:image (already wired via SEO component)
- ❌ Update the listing after launch — PH locks it after submission anyway, but don't try

---

# 3️⃣ COMBINED WEEK PLAN

| Day | Time (PST / IST) | Action |
|---|---|---|
| Monday | — | Final QA: vrikaan.com mobile + load tests + status page |
| Monday | — | DM supporters w/ template H3 + hunter outreach H1/H2 |
| **Tuesday** | **7:30 AM PST / 8 PM IST** | **POST: Show HN** (title D recommended) |
| Tuesday | 8 hrs after HN | Compile HN takeaways; cross-post to r/cybersecurity + r/IndiaSpeaks |
| Wednesday | — | Rest. Reply to lingering HN comments. Compile PH gallery final cut. |
| **Thursday** | **12:01 AM PST / 12:30 PM IST** | **POST: Product Hunt** |
| Thursday | 0:05 PST | Maker first comment posted |
| Thursday | First 12 hrs | Reply within 15 min to every PH comment. Mobilize supporters in waves of 50, not 400 at once. |
| Friday | — | "Thanks PH + HN" tweet w/ metrics screenshot. Submit to AppSumo if numbers were strong. |
| Following week | — | Reach out to journalists w/ "VRIKAAN was #X on PH, top Y on HN" hook (uses press-release-launch.md templates) |

---

## METRICS TO TRACK

Set up a Notion/Sheet w/ columns: Source · UV · Signups · Pro-tier conversions · Cost. Pull from:
- **Vercel Analytics** — real-time visits
- **Plausible** (if installed) — geo + referrer
- **Firestore signup counter** — actual conversions
- **Cashfree dashboard** — paid conversions

After 7 days, you'll know which channel (HN vs PH vs press) deserves more invest next time. Most likely answer: HN drives ~3x more "quality" devs (signup quality + Pro conversion), PH drives ~5x more "volume" sign-ups but lower conversion.
