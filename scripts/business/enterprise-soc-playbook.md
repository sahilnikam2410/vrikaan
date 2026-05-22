# VRIKAAN Enterprise SOC-as-a-Service — Strategic Playbook

**Goal:** Layer enterprise SOC services on top of existing VRIKAAN platform → ₹50L-5Cr ARR within 18 months.

**Status:** Have B2C platform + SOC dashboard skeleton + 2 SOC-analyst founders. Need: enterprise-grade infra, certifications, sales motion, on-call team.

---

## 1️⃣ WHAT TO SELL — The 3 service tiers

### 🥉 SOC-Lite (₹50,000-1,50,000 / month)
**Target:** SMBs (50-200 employees) · single office · standard tech stack

What's included:
- 24×7 monitoring of customer's existing logs (AWS CloudTrail, Office 365, Azure AD)
- VRIKAAN dashboard customized w/ their MITRE ATT&CK heatmap + compliance posture (PCI/GDPR/DPDP/SOC 2/ISO 27001)
- Email + Slack alerts on Critical/High events (severity 12-15)
- 4-hour response SLA on Critical alerts
- Monthly threat report (PDF)
- 1 quarterly review call

What's NOT included:
- Custom detection-rule engineering
- Incident response on-site
- Forensics
- 24×7 phone hotline (email only)

**Operationally:** runs on existing VRIKAAN SOC dashboard + Firestore listeners + Gemini AI. Founder team handles. Can support 5-8 customers before burnout.

---

### 🥈 SOC-Pro (₹2-8 lakh / month)
**Target:** Mid-market (200-2,000 employees) · BFSI, fintech, healthtech, e-commerce

What's included:
- Everything in SOC-Lite, PLUS:
- Wazuh agent deployment on customer endpoints (free OSS, we deploy + tune)
- Custom Sigma rules + MITRE ATT&CK custom mappings for their industry
- DPDP Act compliance evidence collection + audit-ready reports
- 1-hour response SLA on Critical · 4-hour on High
- 24×7 phone hotline (rotating on-call from 2-person team)
- Monthly tabletop exercise (simulated phishing/ransomware drill)
- Weekly threat-intel briefing (custom to their sector)
- Quarterly red-team-lite (1-day external pentest)

**Operationally:** need 2 dedicated SOC analysts (on-call rotation) + 1 detection engineer. Can support 8-15 customers.

---

### 🥇 SOC-Enterprise (₹10-50 lakh / month + setup ₹5-25 lakh)
**Target:** Large enterprise (2,000+ employees) · banks · NBFC · insurance · IT services · government

What's included:
- Everything in SOC-Pro, PLUS:
- Co-located engineer 2-5 days/month on customer site
- Dedicated SIEM environment (we run isolated Wazuh/ELK cluster)
- Custom integrations (Splunk, QRadar, Sentinel, CrowdStrike if they have them)
- 15-min response SLA on Critical
- Quarterly full red-team (3-5 day engagement)
- DFIR (digital forensics + incident response) retainer
- CISO-level monthly review w/ board-ready slides
- Regulatory audit support (RBI, IRDAI, SEBI inspections)
- VAPT (vulnerability assessment + pen test) twice yearly

**Operationally:** need 1 senior engineer per customer + on-call rotation. Higher-touch. Cap at 3-5 customers per quarter.

---

## 2️⃣ POSITIONING — Why VRIKAAN over incumbents

| Competitor | Their weakness | VRIKAAN edge |
|---|---|---|
| **Quick Heal / Seqrite** | Antivirus-first, weak SOC | MITRE-first, modern stack |
| **TCS / Wipro / Infosys SOC** | ₹1Cr+ minimums, 6-month onboarding | ₹50k/mo entry, 2-week onboarding |
| **CrowdStrike / Sentinel** | USD pricing, no Hindi support, foreign data residency | INR pricing, bilingual, India data residency |
| **PaloAlto Cortex** | Vendor lock-in, paid TI feeds | Open-source-first (Wazuh + Sigma), bring-your-own threat intel |
| **Open-source DIY** | No expertise, no compliance evidence | Managed service + audit-ready reports |

**Tagline for sales deck:**
> *"India-built SOC-as-a-service. MITRE ATT&CK + DPDP-ready. ₹50k/mo entry, not ₹50 lakh. SOC analysts who actually answer your call."*

---

## 3️⃣ TECHNICAL ROADMAP — Next 6 months

### Month 1 (this month) — Foundation
- [ ] Spin up isolated Wazuh manager on AWS (Mumbai region) — `soc.vrikaan.com`
- [ ] Configure agent auto-enroll, certificate-based mTLS
- [ ] Build customer-tenancy layer (each customer = isolated index in Elasticsearch)
- [ ] CERT-In **incident reporting integration** (mandatory per Apr 2022 directive)

### Month 2 — Detection
- [ ] Author 50 Sigma rules (mapped to MITRE ATT&CK) covering top India threats:
  - UPI fraud patterns in payment-app logs
  - Phishing-as-a-service C2 callbacks
  - Lazarus / APT38 financial sector targeting
  - Cobalt Strike beacon detection
  - Living-off-the-land binaries (LOLBins)
- [ ] Compliance-evidence collectors for PCI DSS · DPDP · ISO 27001 (extend existing complianceData.js)

### Month 3 — Customer onboarding tooling
- [ ] Self-serve onboarding portal: `enterprise.vrikaan.com`
  - Customer adds endpoints → auto-installs Wazuh agent
  - Connects log sources (AWS, Azure, Office 365, Google Workspace)
  - Compliance baseline scan
  - Generates onboarding report (we read + tune over week 1)
- [ ] White-label dashboard option (customer's logo + colors)

### Month 4 — Compliance certifications start
- [ ] Begin **CERT-In empanelment** application (12-week process)
- [ ] Begin **ISO 27001 audit** (4-month process, ₹3-5 lakh)
- [ ] Begin **SOC 2 Type I** report (8-week, ₹6-10 lakh — via auditor)

### Month 5 — Sales enablement
- [ ] Build 25-slide enterprise sales deck (PPTX) — VRIKAAN positioning, case studies, pricing
- [ ] Customer-facing one-pagers per industry (BFSI · IT services · healthcare · e-commerce)
- [ ] Demo environment w/ synthetic attacks running for prospect walkthroughs
- [ ] Reference architecture diagrams for compliance auditors

### Month 6 — First paid customer + scale
- [ ] Convert first paying SOC-Lite customer (₹50k MRR)
- [ ] Hire 2nd SOC analyst (on-call partner for Khushi)
- [ ] Hire 1 detection engineer (rule authoring + tuning)
- [ ] Build customer portal for ticket triage + monthly reports

---

## 4️⃣ COMPLIANCE & CERTIFICATIONS — Mandatory for enterprise sales

Enterprise procurement WILL ask for these. Without them, you don't close.

| Cert | Why mandatory | Cost | Timeline |
|---|---|---|---|
| **CERT-In Empanelment** | Govt + PSU + regulated industries require it. India-specific. | ₹50k application fee | 12 weeks |
| **ISO 27001:2022** | Banks + IT services demand it. International standard. | ₹3-5 lakh first year (auditor + internal docs) | 4 months |
| **SOC 2 Type II** | US-headquartered Indian fintechs require it. | ₹6-10 lakh + ₹3-5 lakh/yr renewal | 8 weeks Type I → 12 months Type II |
| **PCI DSS QSA cert** | Only if you handle card data directly. | ₹2-4 lakh | 6 weeks |
| **CISA / OSCP** for founders | Personal credentials reduce buyer FUD. | ₹50k-80k per cert per person | 3-6 weeks study + exam |
| **DPDP Act compliance attestation** | India-specific data law. Self-attestable for now. | Free | 1 week documentation |

**Sequence to start:**
1. **DPDP self-attestation** (now, free, 1 week) — table-stakes
2. **CERT-In application** (now, 12 weeks pending) — required for govt/BFSI
3. **ISO 27001** (Month 4, 4 months) — required for ₹2L+ customers
4. **SOC 2 Type I** (Month 4, parallel, 8 weeks) — required for US-facing customers
5. **OSCP** for Sahil + Khushi (parallel, 3 months each) — personal credential

Total Y1 cert investment: **~₹15-20 lakh**.

---

## 5️⃣ TEAM SCALING — When to hire whom

### Now (founder team only)
- Sahil — product + engineering + sales
- Khushi — SOC analyst + on-call + customer success

**Capacity:** 3-5 SOC-Lite customers max before burnout (24×7 on-call w/ 2 people = exhausting)

### Month 3 — First hire
**Hire #1: SOC Analyst L2 (₹6-12 LPA · Bengaluru/Hyderabad remote-friendly)**
- Takes over Tier-1 alert triage from Khushi
- On-call rotation w/ Khushi → both get sleep
- Profile: BTL1 cert OR 1-2 yrs SOC experience OR sharp self-taught HackTheBox player
- **Unlocks:** 8-12 SOC-Lite OR 4-6 SOC-Pro customers

### Month 6 — Two more hires
**Hire #2: Detection Engineer (₹10-18 LPA)**
- Authors custom Sigma + Wazuh rules per customer industry
- Tunes detection logic to reduce false positives
- Maintains MITRE ATT&CK rule library
- Profile: Python + ELK + Sigma experience

**Hire #3: Sales / BD (₹6-10 LPA + 5% commission)**
- Cold outreach to mid-market CISOs
- Demo presentations
- Contract negotiation
- Profile: 2-4 yrs B2B SaaS sales (cybersec experience preferred but not required)

### Month 9 — DFIR specialist
**Hire #4: Senior DFIR / IR (₹15-25 LPA)**
- Leads incident response engagements for SOC-Enterprise customers
- Forensics, malware reversing, IR playbook authoring
- Profile: GCIH or GCFA cert · 4+ years experience
- **Required to close SOC-Enterprise tier** — no DFIR = no enterprise deals

### Month 12 — CISO advisor
**Hire #5: Fractional CISO (₹2-4 lakh/month, part-time)**
- 1-2 days/week for SOC-Enterprise customer reviews
- Board-level briefings
- Helps land first ₹1Cr+ deal
- Profile: ex-bank CISO, ex-Infosys SOC head, recognizable LinkedIn name

**Year-1 team:** 7 people (2 founders + 5 hires). Burn rate ~₹15-20 lakh/month from hire #4 onward.

---

## 6️⃣ GO-TO-MARKET — How to actually sell

### Lead source priorities (rank by ROI)

| Source | Effort | Lead quality | Close rate | Recommend? |
|---|---|---|---|---|
| **CISO LinkedIn outreach** | High (5 hrs/wk) | Very high | 5-10% | ✅ Start week 1 |
| **CERT-In empanelment list** | Low (passive) | High (gov RFPs) | 3-5% | ✅ Apply now |
| **Speaking at conferences** (Nullcon, c0c0n, BSides) | Medium | High | 10-15% | ✅ Q2 onwards |
| **Inbound from B2C audience upsell** | Low | Medium | 2-5% | ✅ Now (free funnel) |
| **Cold email** | Medium | Low (mostly junk) | <1% | ❌ Skip |
| **Google Ads** | Money | Low | <2% | ❌ Wait for product-market fit |
| **PR / Inc42 articles** | Medium | Low (brand only) | <1% direct | ⚠ Brand-only, not direct leads |
| **Partner channel** (Tata Comm, Airtel Cybersec) | Very high (6 mo to land) | Very high | 20-30% | ⚠ Year 2 |

### LinkedIn outreach script (the workhorse)

Send to CISOs of Indian companies w/ 200-2,000 employees:

```
Hi [Name],

Saw you joined [Company] as CISO 8 months ago. Congrats on the [recent
news item — e.g. funding round, acquisition, compliance win].

Quick note — we run a SOC service built for Indian mid-market. India-tuned
Sigma rules, DPDP compliance evidence baked in, ₹50k/month entry (not ₹50
lakh). Currently helping [3-4 similar-stage companies] reduce MTTR + close
audit gaps.

If your team is ever evaluating SOC options or struggling with [specific
DPDP/RBI/PCI thing in their industry], happy to share a 20-min walkthrough
of how we'd approach it for [Company].

No pitch deck — just a sandbox demo + your team can grade us.

Sahil
Founder · VRIKAAN · ex-SOC analyst
vrikaan.com
```

Aim for: **30 personalized DMs/week** · 5-8% reply rate · 1-2 demos/week · 1 close/quarter at start.

### First-customer pricing strategy

**Don't anchor on ₹50k MRR for first 3 customers.** Offer aggressive deals to build case studies + testimonials + reference customers:

1. **First customer:** Free for 3 months · then ₹25k/mo for year 1 (50% off) — in exchange for: testimonial, case study, LinkedIn post, conference reference
2. **Customers 2-3:** ₹35k/mo for year 1 (30% off) — same terms
3. **Customers 4+:** Full ₹50k/mo · use first 3 as social proof

Get 3 logos before raising prices. Logos = sales accelerant.

---

## 7️⃣ TARGET CUSTOMER PROFILES — Who to chase first

### Profile A — Growth-stage Indian fintech (BEST FIT)
- Series A/B ($5-30M raised)
- 50-300 employees
- Handle KYC + payments → PCI DSS pain
- Tech-savvy CTO/CISO who'd appreciate Wazuh-based stack
- Examples to research: NoBroker, Razorpay alternatives, regional NBFCs, insurtechs

**Why they buy:**
- Quick Heal feels old · Splunk costs ₹2Cr · we're ₹1L/mo + sharp
- They need DPDP + PCI ready FAST (audit incoming)
- Their existing security team is 1-2 people, can't run 24×7

**Win condition:** 2-week pilot · they SEE alerts come in · they convert.

### Profile B — Regional bank / cooperative bank
- 100-1,000 employees
- ₹100Cr-5,000Cr AUM
- RBI-regulated, audit pressure constant
- Currently using TCS/Wipro at 10x our price OR nothing at all

**Why they buy:**
- RBI inspection report flagged "inadequate SOC capability"
- Existing vendor is unresponsive, expensive
- Compliance pressure > technology preference

**Win condition:** Bring an RBI Sachet report w/ their domain showing vulns · they realize they're exposed · close in 60-90 days.

### Profile C — Mid-size IT services company
- 500-3,000 employees · client-services model
- Need SOC for their clients' projects (sub-contracted)
- Currently selling "we use Wipro's SOC" → low margin

**Why they buy:**
- Want to white-label our SOC as their own offering
- Get to keep 60-70% of customer payment
- We do the work, they do the customer relationship

**Win condition:** Channel partnership · 30% of MRR to us forever · they sell.

### Skip these in Year 1
- ❌ Major banks (HDFC/ICICI/SBI) — 18-month sales cycle, need 50+ ref customers
- ❌ Government (besides CERT-In empanelment) — needs Net Worth Certificate ₹10Cr+
- ❌ MNCs (Infosys, TCS, etc.) — already have internal SOCs
- ❌ Startups <50 employees — can't afford ₹50k MRR, churn fast

---

## 8️⃣ INFRASTRUCTURE — What to build

### Customer-isolated SOC stack

```
                  ┌─────────────────────┐
                  │  enterprise.vrikaan │  (customer onboarding portal)
                  └──────────┬──────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌─────▼─────┐         ┌────▼────┐
   │ Wazuh   │         │ Wazuh     │         │ Wazuh   │
   │ Manager │         │ Manager   │         │ Manager │
   │ (Cust A)│         │ (Cust B)  │         │ (Cust C)│
   └────┬────┘         └─────┬─────┘         └────┬────┘
        │                    │                    │
   ┌────▼─────────────────────▼─────────────────────▼────┐
   │  Elasticsearch cluster (multi-tenant indices)        │
   │  index pattern: cust-{tenant_id}-{date}              │
   │  RBAC: each tenant sees own data only                │
   └─────────────────────────┬────────────────────────────┘
                             │
                  ┌──────────▼──────────┐
                  │  VRIKAAN SOC UI     │
                  │  (existing React)   │
                  │  scoped to tenant   │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Alert delivery     │
                  │  - Email/Slack/SMS  │
                  │  - PagerDuty (opt)  │
                  │  - Phone (Twilio)   │
                  └─────────────────────┘
```

**Hosting:** AWS Mumbai (ap-south-1) for data-residency compliance.

**Cost estimate (first 5 customers):**
- 5× t3.large Wazuh managers: ₹15k/mo
- 1× m5.xlarge Elasticsearch cluster: ₹25k/mo
- Network egress + S3 backups: ₹5k/mo
- **Total infra:** ~₹45k/mo until 20+ customers

### What customers see (no engineering needed on their side)

1. They get an email: "Welcome to VRIKAAN SOC. Click here to install agent."
2. Install script auto-runs (1-line bash for Linux, 1 MSI for Windows)
3. Agent enrolls with mTLS cert → starts streaming events
4. 48-hour baseline collection → custom rules tuned for their environment
5. They see alerts in the VRIKAAN SOC dashboard (same UI as B2C product, scoped to their tenant)

---

## 9️⃣ PRICING DETAILS — How to quote

### Standard quote structure

```
ANNUAL CONTRACT — VRIKAAN SOC-as-a-Service

Customer:              [Company Pvt Ltd]
Contract length:       12 months (auto-renew)
Tier:                  SOC-Pro
Monthly fee:           ₹2,50,000
Setup fee (one-time):  ₹1,00,000 (waived if 24-mo commit)
Annual TCV:            ₹31,00,000

Inclusions:
- 24×7 monitoring of [N] endpoints + [N] log sources
- 50 custom Sigma rules tuned for [industry]
- Compliance evidence: DPDP + ISO 27001 + PCI DSS
- 1-hour Critical SLA · 4-hour High SLA
- 24×7 phone hotline (rotating on-call)
- Monthly threat report (PDF + 30-min review call)
- Quarterly tabletop exercise

Excludes (available at extra cost):
- Incident response (post-breach) — ₹50,000 / day
- Forensics (DFIR) — ₹1,00,000 / engagement min
- Red team — ₹3-8 lakh per engagement

Payment: Net 30, INR, GST extra
Term: 12 months, 60-day notice to cancel post-year-1
```

### Negotiation levers

| Customer ask | What to give |
|---|---|
| "We want 25% off" | Match price if 24-month contract |
| "Can you do free pilot?" | 30-day pilot, capped at 50 endpoints, then convert |
| "We need same-day onboarding" | ₹50k expedite fee, dedicated engineer for 3 days |
| "Can you sign DPA / MSA?" | Yes, use our standard template (have lawyer draft once) |
| "We use Splunk, can you integrate?" | Yes, ₹2L one-time integration fee + ₹15k/mo for connector maintenance |
| "We need 15-min SLA, not 1 hour" | Bump to SOC-Enterprise tier (5-10x price) |

---

## 🔟 LEGAL + OPERATIONAL — Setup checklist

### Entity + paperwork
- [ ] Convert VRIKAAN proprietorship → Pvt Ltd (₹10-15k via ClearTax/Vakil) — enterprises won't sign w/ proprietorship
- [ ] GST registration (free, mandatory) — if not done
- [ ] MSME registration (free, gives ₹2-3 lakh tax benefit)
- [ ] Trademark "VRIKAAN" (₹4-9k via filer) — protect brand
- [ ] DPDP Data Protection Officer (Sahil to be designated DPO)

### Contracts to draft (one-time, then reuse)
- [ ] Master Services Agreement (MSA) — 12-15 pages, ₹15-25k via lawyer
- [ ] Data Processing Addendum (DPA) — required under DPDP Act
- [ ] Non-Disclosure Agreement (NDA) — mutual, 2 pages, free template
- [ ] Statement of Work (SOW) template — per-customer customization
- [ ] Service Level Agreement (SLA) — defines uptime + response times
- [ ] Incident Response Retainer agreement

### Insurance (required by some customers)
- [ ] Cyber liability insurance: ~₹50k-1.5L/yr for ₹5Cr coverage (HDFC Ergo, ICICI Lombard)
- [ ] Professional indemnity: ~₹30-80k/yr
- [ ] Errors & Omissions: included in pro indemnity usually

---

## 1️⃣1️⃣ MILESTONES & METRICS — How you'll know it's working

| Month | Target |
|---|---|
| Month 1 | DPDP self-attestation done · CERT-In app submitted · Wazuh prod cluster live |
| Month 2 | 50 Sigma rules authored · ISO 27001 + SOC 2 audits started |
| Month 3 | 1 paying customer (₹25-50k MRR) · first SOC analyst hired |
| Month 4 | 2 paying customers · enterprise.vrikaan.com self-serve portal live |
| Month 6 | 5 paying customers · ₹3-5L MRR · 3 hires (analyst + detection eng + sales) |
| Month 9 | 10 paying customers · ₹10-15L MRR · ISO 27001 cert in hand · DFIR hire |
| Month 12 | 20 customers · ₹25-35L MRR · break-even on burn |
| Month 18 | 35 customers · ₹50L-1Cr MRR · profitable · first ₹1Cr/year deal |

**Vanity metrics to ignore:** "leads generated", "demos done", "Twitter followers". Track only MRR + churn + CAC payback.

---

## 1️⃣2️⃣ RISKS + MITIGATIONS

| Risk | Mitigation |
|---|---|
| **Burnout from on-call w/ 2-person team** | Hire SOC analyst Month 3 (no later). Build runbooks before Day 1 customer. |
| **First customer disaster (false-positive flood, missed real attack)** | Pilot 30 days w/ careful tuning. Be honest in week 1 — "expect false positives, we'll tune." |
| **Compliance cert gets delayed (ISO 27001 slips)** | Start auditor selection NOW. Pick smaller firm w/ faster turnaround over BSI/TÜV. |
| **Sales cycle is 6+ months → no MRR for half year** | Run 3 pilots in parallel. Don't depend on single deal. |
| **Existing B2C work distracts from enterprise build** | Block 60% of week for enterprise. Khushi takes lead on B2C ops while Sahil drives enterprise. |
| **Pricing race-to-bottom from competitors** | Don't compete on price below ₹40k/mo. Add value (compliance evidence, training, on-call) instead. |
| **Customer breach happens despite SOC** | Have insurance + clear SLA carve-outs. Pre-agreed IR playbook. Honest disclosure. |

---

## 1️⃣3️⃣ FIRST 90 DAYS — Concrete action items

### Week 1
- [ ] Convert to Pvt Ltd (file w/ MCA)
- [ ] Apply CERT-In empanelment
- [ ] AWS Mumbai account setup w/ multi-account org for tenancy
- [ ] Wazuh manager prod install
- [ ] Build 10 sample Sigma rules
- [ ] Draft MSA + DPA + SLA (engage lawyer)

### Week 2-4
- [ ] 30 LinkedIn DMs/week to fintech CISOs
- [ ] Speak at 1 cybersec meetup (Bengaluru or Mumbai) for visibility
- [ ] Build enterprise sales deck (25 slides)
- [ ] Sandbox demo environment running synthetic attacks
- [ ] Self-attest DPDP compliance + publish at vrikaan.com/dpdp-compliance
- [ ] OSCP study plan (Sahil + Khushi parallel, 90-day target)

### Month 2
- [ ] Engage ISO 27001 auditor (recommend BSI or BCert India)
- [ ] Engage SOC 2 auditor (Sensiba, Schellman, or A-LIGN)
- [ ] 50 Sigma rules total (top India threats covered)
- [ ] Self-serve onboarding portal MVP (enterprise.vrikaan.com)
- [ ] First pilot customer signed (free for 3 months)

### Month 3
- [ ] First paying SOC-Lite customer onboarded
- [ ] Hire SOC analyst #1 (post on naukri, LinkedIn, /r/cybersecurity)
- [ ] White-label dashboard option live
- [ ] CERT-In empanelment received (if applied Week 1)

---

## 1️⃣4️⃣ FUNDING — Should you raise?

### Option A — Bootstrap (recommended for first 6 mo)
- Burn rate: ₹50k-1L/month (founders + AWS + tools)
- Funded by: B2C ₹990/yr Pro subscriptions + first SOC-Lite customer revenue
- Pro: keep equity + control
- Con: slow ramp, can't hire fast

### Option B — Angel round (₹50L-1.5Cr, give 8-15% equity)
- Use case: hire faster (3 people by Month 4)
- Best angels for India cybersec: ex-CISOs, IIT/IIM alumni who've sold to enterprise
- Where: AngelList India, LetsVenture, ChennaiAngels, IndianAngelNetwork
- Pitch when: 1-2 paying customers + clear pipeline

### Option C — Seed VC (₹3-8Cr, 18-25% equity)
- Best fit when: 5+ customers, ₹5-10L MRR, growing 15-25%/mo
- Approach: Blume Ventures, Kalaari, Stellaris, Together Fund (cybersec-friendly)
- Don't do this in Month 1 — bad valuation, distracts from selling

**Recommendation:** Bootstrap → Angel @ Month 6 → VC @ Month 18.

---

## 1️⃣5️⃣ SUCCESS CASE — What "winning" looks like at Year 2

- 50 paying enterprise customers
- ₹2-4 Cr ARR (₹17-33 lakh MRR)
- Team of 12-18 people (50% engineering, 30% SOC ops, 20% sales/ops)
- ISO 27001 + SOC 2 + CERT-In empanelment all green
- 2 case studies w/ named logos publicly cited
- Featured in YourStory · Inc42 · The Ken (tier-1 India tech press)
- Series A pitched to 5 VCs, term sheet in hand

That's the realistic 24-month outcome if you execute the playbook. Faster if you find product-market fit early.

---

## QUICK START — Pick ONE thing to do tomorrow

If only one move: **send 5 personalized LinkedIn DMs to fintech CISOs in your network.**

Pre-product, pre-cert, pre-team. The market signal you get from 5 conversations w/ real CISOs is worth more than 6 months of building.

Templates above. Don't pitch. Ask: *"What's your biggest SOC pain right now? Curious what mid-market is buying these days."* Listen. Take notes. Adjust this playbook.
