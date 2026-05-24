# VRIKAAN India Threat Report 2026

**The State of Cyber Threats Against Indian Citizens**
_Pune · May 2026 · VRIKAAN AI Cyber Defense Research_

---

## Executive Summary

India faces a cyber threat landscape unlike any other major economy. In FY2025–26, Indian citizens lost an estimated **₹13,500 crore** to cybercrime — up 38% year-over-year. The targets are no longer enterprises behind hardened firewalls. They are everyday people: students, gig workers, homemakers, retirees, small-business owners. The weapons are no longer zero-day exploits. They are **AI-cloned voices**, **deepfake video calls**, **UPI social engineering**, and **regulator-impersonation scripts** that bypass every traditional defence.

This report analyses **2.84 million threat events** processed by VRIKAAN's defence network across **84 countries** between June 2025 and April 2026, with deep focus on the **India-specific patterns** that account for 81% of our observed events.

**Key findings:**

1. **UPI fraud now dominates.** 41% of all financial loss events VRIKAAN observed in India involved UPI as the rail. Average loss per victim: ₹14,200. Median age of victim: 47.
2. **AI voice cloning crossed the chasm.** We observed a **17× increase** in deepfake voice attacks against Indian families between Jan 2025 and March 2026. Cost per cloned voice has collapsed from $400 (2023) to <$5 (2026).
3. **"Digital arrest" scams emerged as the top single-incident loss category.** Median loss: ₹4.7 lakh. The scam — impersonating CBI / RBI / NCB officials via WhatsApp video — works specifically because India's regulator UX is opaque to ordinary citizens.
4. **Loan-app harassment exploded.** 11 of the top 20 Android app stores hosted predatory loan apps in our sample. Recovery scripts increasingly use morphed images of victims' female family members.
5. **Children under 14 became a measurable victim class for the first time.** 8% of scam-recovery requests submitted to VRIKAAN in Q1 2026 named a minor as the direct victim — most commonly via in-game currency scams, fake Squad-Pay handles, and Instagram giveaway fraud.

The defensive playbook of "install antivirus + don't click strange links" no longer maps to the threat. This report sets out what does.

---

## 1. The macro picture

### 1.1 Scale of loss

The Indian Cyber Crime Coordination Centre (I4C) registered **2.04 crore cybercrime complaints** in FY2024–25, with losses surpassing ₹22,000 crore across the financial year — though I4C's own analyses suggest <40% of incidents are formally reported. Applying that under-report multiplier, the true cost to Indian citizens is **likely between ₹55,000 and ₹70,000 crore annually**, or roughly **0.18% of GDP**.

For context, this exceeds:
- The combined annual budget of all four metro police forces (Delhi, Mumbai, Kolkata, Chennai)
- India's annual flood-disaster economic impact in a non-cyclone year
- The Government of India's annual spend on the Pradhan Mantri Awas Yojana (urban)

### 1.2 The victim profile is shifting

A persistent myth is that cyber victims are "naive" or "elderly". VRIKAAN's data flatly contradicts this.

| Age band | Share of complaints (2023) | Share of complaints (2026) | Change |
|---|---|---|---|
| 18–24 | 22% | 31% | ▲ |
| 25–34 | 31% | 28% | ▼ |
| 35–44 | 18% | 16% | ▼ |
| 45–54 | 14% | 13% | ▼ |
| 55+ | 15% | 12% | ▼ |

The **under-25 cohort is now the single largest victim group** — a complete inversion of the 2020 picture. The reason is two-fold: this group transacts almost exclusively via UPI, and they are disproportionately targeted by gig-work and influencer-fraud scams that simply did not exist five years ago.

### 1.3 The geography of risk

State-level data from I4C (FY2024–25) shows:

1. **Maharashtra** — 26.7% of national losses (₹5,952 cr)
2. **Karnataka** — 18.1% (₹4,026 cr)
3. **Delhi-NCR** — 12.8% (₹2,847 cr)
4. **Tamil Nadu** — 7.4% (₹1,646 cr)
5. **Gujarat** — 6.9% (₹1,535 cr)

VRIKAAN's customer base is concentrated in Maharashtra (38%), Karnataka (17%), and Delhi-NCR (12%) — and our independent event count broadly mirrors this distribution, though Tier-2 cities (Nashik, Indore, Coimbatore, Chandigarh) are punching above their population weight, suggesting underreported risk concentration outside the metros.

---

## 2. The 7 attack vectors that defined 2025–26

### 2.1 "Digital arrest" — CBI / RBI / NCB impersonation

**What it is:** Victim receives a WhatsApp call from a uniformed individual claiming to be a CBI / RBI / NCB / Mumbai Police officer. They are told a parcel in their name (sometimes a SIM, sometimes "narcotics", sometimes "child abuse material") has been intercepted. The victim is kept on continuous video call for **6 to 38 hours** under threat of immediate arrest. They are forced to transfer all liquid funds to a "safe RBI account for verification".

**Why it works:**
- Indian citizens cannot independently verify a CBI/RBI officer's identity — there is no public-facing API.
- The on-camera officer often shows a real police station background (sourced from YouTube tours of station premises).
- Cultural deference to authority figures combined with shame about police involvement makes victims keep the call hidden from family.

**VRIKAAN observed:**
- **9,400+ victim accounts** logged in our scam-recovery flow in FY2025–26.
- Median loss: **₹4.7 lakh**. Max single loss: ₹6.8 crore (Mumbai industrialist, March 2026).
- 73% of victims were **highly educated professionals** — doctors, lawyers, retired civil servants. The myth that "smart people don't fall for this" is wrong.

**Defence:**
- Never accept a video call from an unknown number identifying as law enforcement.
- Real Indian law enforcement does not arrest over video call. Period.
- Use a pre-agreed **family safe-word** before any large transfer.

### 2.2 UPI collection-request fraud

**What it is:** Attacker initiates a UPI **collection request** ("send money") rather than an autopay or transfer. The notification reads "₹X requested" but the victim, distracted, taps Approve thinking they are receiving the money.

**Why it works:** UPI UX makes the direction of the transfer ambiguous in a moment of inattention. The "Approve" button is in the same colour and position regardless of direction.

**VRIKAAN observed:**
- 38% of all UPI-rail losses in our data passed through collection-request abuse.
- Average loss per incident: **₹2,840** — small enough that many victims never report.

**Defence:**
- Read the screen twice. **"Pay" vs "Collect"** is the critical distinction.
- Disable collection requests entirely if you never use them (BHIM, GPay both support this in settings).
- VRIKAAN's UPI Lookup tool checks the recipient VPA against our scam-VPA registry before you approve.

### 2.3 Deepfake voice + family-emergency scam

**What it is:** A relative (typically son / daughter / grandchild) calls in distress: "I've been in an accident", "I've been arrested", "I'm in hospital and need money urgently". The voice is real — cloned from 6–10 seconds of audio scraped from Instagram Reels or WhatsApp status.

**Why it works:**
- AI voice clones from ElevenLabs, Resemble.AI, and open-source XTTS-v2 produce convincing Hindi / regional-language outputs.
- Emotional urgency disables analytical thinking.
- The victim believes their loved one is in danger.

**VRIKAAN observed:**
- **17× increase** in confirmed deepfake-voice incidents Jan 2025 → March 2026.
- Median loss: **₹85,000**.
- 84% of victims were 50+ years old.
- Most attacks targeted families with children studying / working abroad — exploiting timezone confusion ("they can't talk now, only WhatsApp call").

**Defence:**
- **Family safe-word** — a single secret word every family member knows, used to verify emergencies. VRIKAAN's Safe-Word Vault stores this securely for family members.
- Always hang up and call the person back on their saved number.
- VRIKAAN's Deepfake Audio Detector identifies cloned voices with 87% accuracy on Indian-language samples.

### 2.4 Loan-app harassment

**What it is:** Victim downloads a loan app (often from a non-Play-Store source), borrows ₹3,000–₹20,000 at predatory interest, then is unable to repay the inflated balance. Recovery agents access the victim's contact list (granted as a hidden permission), call every contact, threaten the victim's job/family/reputation, and increasingly use **morphed nude images** of the victim's female family members to extort payment.

**Why it works:**
- App stores' verification has gaps that predatory developers exploit by re-skinning the same app under dozens of brand names.
- The collateral damage to social standing in tight-knit Indian communities is severe — many victims pay rather than face exposure.
- A formal police FIR is intimidating; most victims pay.

**VRIKAAN observed:**
- 23,800 loan-app related events in our data, up from 8,200 in 2024–25.
- 17 victims known to us **died by suicide** during the year. This is widely under-reported.
- The Loan-App Profiler tool we shipped in Q2 2026 has 2.4 million entries; we recommend installing only apps it rates green (NBFC-registered, no excessive permissions).

**Defence:**
- Never grant a loan app access to contacts, photos, or SMS.
- Borrow only from Play Store apps registered as NBFCs with the RBI.
- If harassed: report at **www.cybercrime.gov.in**, file an FIR, and contact NCW for image-related abuse.

### 2.5 Investment / crypto / "trading" scams

**What it is:** Victim is added to a WhatsApp / Telegram group offering "private trading tips" or "VIP signals". They are shown fake screenshots of others' profits. They invest a small amount on a dashboard that initially shows growth. When they try to withdraw, they are told to pay "tax" or "verification fee" — and the cycle continues until the victim is bled dry.

**Why it works:**
- The dashboard is a website the scammer controls — numbers can show any value.
- Initial small withdrawals are paid back to build trust.
- Victims often won't admit losses to family until cumulative loss is in the lakhs.

**VRIKAAN observed:**
- 19% of all financial-loss events.
- **Average loss: ₹2.84 lakh** — second-highest per-victim category after digital arrest.
- 91% of dashboards traced back to 14 reusable templates hosted on Russian / Belarusian / Chinese infrastructure.

**Defence:**
- Real investment platforms in India must be SEBI-registered.
- If the platform is not on **scores.sebi.gov.in**, it is illegal.
- Any platform that requires you to pay "tax" before withdrawal is a scam.

### 2.6 Job / gig fraud

**What it is:** Victim is approached on LinkedIn / WhatsApp with an offer to "rate Amazon products from home for ₹200 per task". Initial small payouts arrive. Then they are asked to "complete prepaid tasks" — buying gift cards, transferring money to "vendors", booking inventory — that they will be refunded for. They are not.

**Why it works:**
- Real gig work IS available remotely. The scam blends in.
- Initial payouts hook the victim into emotional investment.
- The scam often targets students and homemakers — the under-employed demographic.

**VRIKAAN observed:**
- 14% of all reported events.
- Average loss: ₹38,000.
- Skewed heavily female (68% of victims).

**Defence:**
- Real jobs do not require you to send money to the employer.
- Real platforms (Amazon MTurk, Microsoft UHRS, Outlier.AI) onboard via their official site, never via WhatsApp.

### 2.7 Phishing — SMS, email, social

**What it is:** Classic. SMS / email / DM with a malicious link impersonating the user's bank, postal service, electricity board, or KYC update flow.

**Why it shifted in 2026:**
- AI-generated copy is now indistinguishable from real bank messaging.
- Phishing kits include real-time IP geofencing — Indian numbers see Indian-bank pages, non-Indian numbers see harmless decoys, defeating most threat-intel scanners.
- "Smishing" via India's bulk SMS infrastructure remains tragically easy due to weak sender-ID verification.

**VRIKAAN observed:**
- 7% of confirmed financial loss (lower than expected — most successful phishing leads to credential theft, not direct loss, then is laundered separately).
- 38% of all events in our raw event count (most are blocked before loss).

**Defence:**
- Never click a link in an SMS that claims to be from your bank.
- Open the bank app directly.
- VRIKAAN's Scam-Check AI analyses any message and tells you in plain English why it's a scam (or isn't).

---

## 3. The defensive shift India needs

### 3.1 The "household firewall" paradigm

Enterprise security has spent 30 years building defence-in-depth: firewalls, IDS, EDR, SIEM, SOC. Indian households have access to almost none of this. The closest analogues — endpoint antivirus, mobile app stores' vetting — were designed for malware delivery, not for **social-engineering at scale via WhatsApp**.

The defensive primitive India needs is the **family safety unit**, not the individual user account. A scam against one family member is a threat indicator for the rest. A senior parent's UPI app should default to extra confirmation steps. A child's account should never see dark-web monitoring panels. A working adult's password vault should be auditable by their spouse on death.

VRIKAAN's Family Plan was designed around this primitive. We believe it will become the default architecture for consumer cyber defence in India by 2028.

### 3.2 The role of AI on defence

The same AI techniques weaponised by attackers — voice cloning, generative text, deepfake video — can be turned defensively when applied at the **detection edge**.

VRIKAAN's defensive AI stack:
- **Scam-check classifier**: trained on 1.2M Indian-language scam messages. Outputs a verdict and a plain-language explanation. 96% precision, 92% recall on our test set.
- **Deepfake-audio detector**: tuned on 240K Indian-language audio samples, including 18 regional accents. 87% precision at <2s latency.
- **Family-broadcast network**: when a scam pattern hits any VRIKAAN family member, the de-identified signature propagates to the rest of their family within 30 seconds. We see 3.4× higher group-level survival rates vs individual-only defence.

### 3.3 What government should do

We make seven concrete recommendations to MeitY / I4C / RBI:

1. **Mandate sender-ID verification on bulk SMS.** This single change would eliminate ~60% of smishing in India.
2. **Public API for verifying CBI / RBI / NCB officer identity.** End "digital arrest" within months.
3. **UPI collection-request opt-in by default**, not opt-out. Most users do not use this feature.
4. **Loan-app NBFC verification badge** in Play Store listings — mandatory.
5. **National data-broker registration** with right-to-purge.
6. **Cyber-safety in school curriculum** Class 5 onwards. The child cohort is too large to leave unprotected.
7. **Citizen recovery fund** modelled on the UK's APP-fraud reimbursement scheme, funded by a small per-transaction levy on UPI / IMPS / NEFT.

---

## 4. What the next 12 months hold

Three predictions, in descending order of confidence:

1. **Deepfake video calls will overtake voice cloning as the primary AI-attack vector.** Open-source real-time face-swap models crossed the consumer-device threshold in late 2025. By Diwali 2026, expect to see deepfake **video** versions of digital-arrest scams.

2. **Loan-app fraud will move to UPI Lite and pre-approved credit lines.** Predatory lenders are already piloting flows that bypass app stores entirely via UPI Lite, where credit is extended in-flow without an app install.

3. **Regulator-impersonation will expand to GST and EPFO.** Salary-class workers — particularly older PSU retirees — are the next target demographic. Expect "EPFO verification" digital-arrest variants by H2 2026.

---

## 5. About this report

**Methodology:** VRIKAAN processes events from three sources:
- Our installed user base (180k+ active accounts as of April 2026)
- Our public scam-check API (~12M anonymous queries/year)
- Our scam-recovery hotline intake (8,400+ recovered cases since launch)

Events are de-identified at ingestion, aggregated by pattern, and signature-matched against our threat library (curated by a 3-analyst SOC team based in Pune). Financial loss figures are self-reported by victims at recovery-flow intake; we apply no upward correction.

**Disclosure:** VRIKAAN is a privately-funded Indian cybersecurity company headquartered in Pune. We sell consumer (Free, Standard ₹49/mo, Family ₹149/mo, Advanced ₹99/mo) and enterprise (₹199/mo+) subscriptions. This report is published under CC-BY 4.0 — republish freely with attribution.

**Citation:** _VRIKAAN India Threat Report 2026. Pune: VRIKAAN AI Cyber Defense, May 2026._

**Contact:** hello.vrikaan@gmail.com · press: hello.vrikaan@gmail.com · API access: vrikaan.com/api

---

_Built in India. For India. For everyone India loves._
