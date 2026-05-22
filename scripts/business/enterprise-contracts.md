# VRIKAAN Enterprise Contracts — Templates

5 paste-ready templates for India enterprise SOC deals. ⚠ Run all final versions past a real Indian commercial lawyer before signing. These are starting points, NOT legal advice.

**Recommended legal cost:** ₹15-30k one-time to review + tune (a Bangalore / Mumbai SaaS lawyer like Vakil Search Pro, IndiaFilings Pro, or a tier-2 firm). Done once, reusable forever.

---

## DOCUMENT MAP

| Document | When used | Length | Reusability |
|---|---|---|---|
| 1. **NDA** | Before any technical or pricing discussion | 2 pages | Universal — same for all customers |
| 2. **MSA** (Master Services Agreement) | Once per customer relationship | 12-15 pages | Same for all customers in same tier |
| 3. **SOW** (Statement of Work) | Per engagement / per tier | 3-5 pages | Customized each deal |
| 4. **DPA** (Data Processing Addendum) | DPDP-required attachment to MSA | 4-6 pages | Universal |
| 5. **SLA** (Service Level Agreement) | Attachment to MSA, per tier | 2 pages | One per tier (Lite / Pro / Enterprise) |

**Flow:** NDA before demo · MSA + DPA + SLA + SOW bundle at signing.

---

## 1️⃣ MUTUAL NON-DISCLOSURE AGREEMENT (NDA)

```
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into on
[DATE] between:

VRIKAAN PRIVATE LIMITED ("VRIKAAN")
[Registered office address, Nashik, Maharashtra, India]
CIN: [CIN once incorporated]

AND

[CUSTOMER LEGAL NAME] ("Customer")
[Customer registered address]
CIN / GSTIN: [Customer entity ID]

Each a "Party" and together the "Parties".

1. PURPOSE
The Parties wish to evaluate a potential business relationship
("Purpose") and may exchange Confidential Information for that Purpose.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by one Party
(the "Disclosing Party") to the other (the "Receiving Party") in
connection with the Purpose, whether oral, written, or electronic,
that is marked confidential or that a reasonable person would
understand to be confidential, including but not limited to:
business plans, technical architecture, source code, customer data,
pricing, security findings, and personally identifiable information.

3. OBLIGATIONS
The Receiving Party shall:
(a) Use Confidential Information solely for the Purpose;
(b) Not disclose it to any third party except employees/contractors
    with a need-to-know and bound by similar confidentiality obligations;
(c) Protect it with at least the same degree of care it uses for its
    own confidential information, but no less than reasonable care;
(d) Return or destroy all Confidential Information within 30 days of
    written request.

4. EXCLUSIONS
Confidential Information does not include information that:
(a) Was lawfully in the Receiving Party's possession before disclosure;
(b) Is or becomes publicly known through no fault of the Receiving Party;
(c) Is lawfully obtained from a third party without obligation of
    confidentiality;
(d) Is independently developed without reference to the Confidential
    Information.

5. TERM
This Agreement remains in effect for two (2) years from the date above.
Confidentiality obligations survive termination for five (5) years.

6. GOVERNING LAW
This Agreement is governed by the laws of India. Disputes shall be
subject to the exclusive jurisdiction of courts in Nashik, Maharashtra.

7. NO LICENCE OR OBLIGATION
This Agreement does not grant any licence to any intellectual property
or oblige either Party to enter into a further commercial relationship.

8. ENTIRE AGREEMENT
This Agreement is the entire agreement between the Parties regarding
confidentiality and supersedes all prior agreements on the subject.

VRIKAAN PRIVATE LIMITED              [CUSTOMER LEGAL NAME]

By: ____________________             By: ____________________
Name: Sahil Anil Nikam               Name:
Title: Founder & CEO                  Title:
Date:                                 Date:
```

**Notes:**
- ⏱ Time to negotiate: 2-4 days max. Anything longer = bad-faith stalling.
- 💰 Cost to draft: free (above is paste-ready)
- 🔒 Have lawyer review once, then reuse for everyone

---

## 2️⃣ MASTER SERVICES AGREEMENT (MSA) — Skeleton

Full MSA is 12-15 pages — too long to embed here. Below is the **structure + critical clauses**. Hand the structure to a lawyer + ask for ₹15-25k full draft.

### Required sections (in order)

```
1. DEFINITIONS
   - Services, SOW, Confidential Information, Effective Date, Term

2. SERVICES
   - Reference to attached SOWs
   - Right to modify SOWs by mutual written agreement
   - Performance standards

3. FEES & PAYMENT
   - As per SOW
   - INR, GST extra
   - Payment terms: Net 30 days
   - Late fee: 1.5%/month
   - Right to suspend service after 60-day overdue

4. TERM & TERMINATION
   - Initial term: 12 months
   - Auto-renewal: 12-month rolling
   - Termination for convenience: 60 days written notice
   - Termination for cause: 30 days to cure material breach
   - Effect: return of Customer Data within 30 days, final invoice

5. CONFIDENTIALITY
   - Mirrors NDA terms
   - Survives termination 5 years

6. DATA PROTECTION
   - References DPA (Exhibit B)
   - Compliance with DPDP Act 2023
   - Data residency: India (AWS Mumbai)

7. INTELLECTUAL PROPERTY
   - VRIKAAN owns Platform, Sigma rules, dashboards
   - Customer owns Customer Data
   - Licence to VRIKAAN to process Customer Data for Service delivery only
   - VRIKAAN may use aggregated, anonymized data for benchmarks / research

8. WARRANTIES & DISCLAIMERS
   - VRIKAAN warrants services performed with professional care
   - DISCLAIMS: cannot guarantee 100% threat detection
   - DISCLAIMS: not liable for damages caused by Customer's environment

9. INDEMNIFICATION
   - VRIKAAN indemnifies Customer for IP infringement claims (capped at 12 months fees)
   - Customer indemnifies VRIKAAN for misuse of Service

10. LIMITATION OF LIABILITY
    - Aggregate liability cap = 12 months fees paid
    - No consequential / indirect / special damages
    - Exceptions: gross negligence, willful misconduct, IP infringement
      (these exceptions are required by Indian law)

11. INSURANCE
    - VRIKAAN maintains:
      - Cyber liability: ₹5 Cr coverage
      - Professional indemnity: ₹2 Cr coverage
      - Both with reputable Indian insurers

12. ASSIGNMENT
    - No assignment without consent
    - Exception: assignment to affiliate or in M&A allowed with notice

13. FORCE MAJEURE
    - Standard clause (acts of God, war, regulation, internet outages)

14. NOTICES
    - Email to designated contact persons + courier to registered address

15. GOVERNING LAW & DISPUTE RESOLUTION
    - Indian law
    - Mediation in Mumbai first
    - Arbitration under Arbitration & Conciliation Act 1996
    - Sole arbitrator, Mumbai seat, English language

16. ENTIRE AGREEMENT / COUNTERPARTS / SEVERABILITY
    - Standard boilerplate

EXHIBITS:
A. Statement of Work (SOW)
B. Data Processing Addendum (DPA)
C. Service Level Agreement (SLA)
D. Pricing Schedule
```

### Critical clauses to NEGOTIATE

| Clause | Customer often pushes for | Your safe limit |
|---|---|---|
| Liability cap | 24-36 months fees OR uncapped | Max 12 months fees · accept up to 18 for SOC-Enterprise |
| Termination for convenience | 30 days | 60 days is fair · 90 days for Enterprise tier |
| Audit rights | Annual on-site audit | Yearly desk audit OK · on-site only if customer pays travel + 30 days notice |
| Source-code escrow | Required | Decline · offer SOC 2 report instead |
| Data residency exclusively India | Required by BFSI | Accept · already true |
| Custom SLA penalties | 20-30% of monthly fee per missed SLA | Cap at 100% of monthly fee total (any SLA, any month) |
| MFN clause ("never charge anyone less") | Required by big-cos | Decline · standard practice to refuse |
| Right to switch off in 24 hours | Required by banks | Accept w/ "for cause" trigger only |

---

## 3️⃣ STATEMENT OF WORK (SOW) — Per-customer template

```
STATEMENT OF WORK #[NUMBER]

SOW Date:         [DATE]
SOW Number:       [Year]-[Customer initials]-[NN]
Related MSA:      VRIKAAN-MSA dated [DATE]
Customer:         [CUSTOMER LEGAL NAME]
VRIKAAN entity:   VRIKAAN PRIVATE LIMITED

1. SERVICES SUMMARY
This SOW describes services VRIKAAN will provide to Customer under the
MSA referenced above. In case of conflict, MSA terms prevail.

2. SERVICE TIER
□ SOC-Lite      (₹50,000/mo base)
□ SOC-Pro       (₹2,00,000-8,00,000/mo)
□ SOC-Enterprise (₹10,00,000-50,00,000/mo)

3. SCOPE
3.1 Endpoints monitored:    [N] (limited to {{LIMIT}})
3.2 Log sources monitored:  [list: AWS CloudTrail, Azure AD, O365, etc]
3.3 Locations:              [N offices in India]
3.4 Compliance frameworks tracked: PCI DSS / GDPR / DPDP / SOC 2 / ISO 27001
                                    (delete those not applicable)

4. FEES
4.1 Monthly fee:           INR [AMOUNT] / month
4.2 One-time setup fee:    INR [AMOUNT] (waived if 24-month commit)
4.3 Add-on services:
    - Additional endpoint:   INR [AMOUNT] / endpoint / month
    - Incident response:     INR 50,000 / day, 1-day min
    - Forensics engagement:  INR 1,00,000+ per engagement (T&M)
    - Red team:              INR 3,00,000-8,00,000 per engagement
4.4 Annual total commit:    INR [AMOUNT × 12]

5. TERM
5.1 Effective date:         [DATE]
5.2 Initial term:           12 months
5.3 Renewal:                Auto-renew for successive 12-month terms

6. KEY PERSONNEL
6.1 Customer point of contact: [Name, title, email, phone]
6.2 VRIKAAN service lead:      [Name, title, email, phone]
6.3 24×7 hotline number:        [Number, included in SOC-Pro and above]

7. SLA
Per attached Service Level Agreement (Exhibit C of MSA).

8. SIGN-OFF
This SOW becomes effective when signed by both Parties.

For VRIKAAN PVT LTD          For [CUSTOMER]
Signature: ____________      Signature: ____________
Name: Sahil Anil Nikam       Name:
Title: Founder & CEO          Title:
Date:                         Date:
```

---

## 4️⃣ DATA PROCESSING ADDENDUM (DPA) — DPDP-compliant

⚠ This is the critical document for DPDP Act 2023 + GDPR (if EU customers).

```
DATA PROCESSING ADDENDUM
(Exhibit B to MSA between VRIKAAN PRIVATE LIMITED and [CUSTOMER])

This DPA forms part of the MSA. In case of conflict regarding personal
data handling, this DPA prevails over the MSA.

1. DEFINITIONS
   - "Personal Data" as defined under the Digital Personal Data
     Protection Act 2023 (DPDP Act) of India
   - "Data Principal", "Data Fiduciary", "Data Processor" per DPDP Act
   - "Processing" means any operation performed on Personal Data

2. ROLES
   2.1 Customer is the Data Fiduciary for Personal Data shared with VRIKAAN
   2.2 VRIKAAN is the Data Processor acting on Customer's documented
       instructions for the duration of the MSA

3. INSTRUCTIONS
   VRIKAAN processes Personal Data only as needed to deliver the Services
   per the MSA + SOWs, and per Customer's documented written instructions.

4. CATEGORIES OF DATA
   4.1 Personal Data: log timestamps, source IPs, usernames, emails of
       employees / users associated with the Customer's systems
   4.2 NO sensitive personal data (financial, health) processed by default
       unless explicitly listed in SOW
   4.3 NO categories of special Data Principals (children, etc.) unless
       explicitly noted in SOW

5. DATA RESIDENCY
   5.1 All Personal Data stored within India (AWS Mumbai region, ap-south-1)
   5.2 No transfer outside India without prior written consent
   5.3 Backups remain within India

6. SECURITY MEASURES
   VRIKAAN implements appropriate technical + organizational measures:
   - Encryption at rest (AES-256) and in transit (TLS 1.3)
   - Access control: role-based, multi-factor authentication mandatory
   - Logging of all access to Personal Data
   - Annual penetration test
   - Employee background checks + signed confidentiality agreements
   - Documented incident response plan

7. SUB-PROCESSORS
   7.1 VRIKAAN may use the following sub-processors:
       - AWS (cloud infrastructure, Mumbai region)
       - Google Cloud Firestore (audit logs)
       - Sentry (error monitoring)
       - Brevo (email delivery if applicable)
   7.2 Adding new sub-processors: 30-day prior notice to Customer
   7.3 Customer may object within 14 days with reasonable grounds
   7.4 All sub-processors bound by terms substantially similar to this DPA

8. DATA PRINCIPAL RIGHTS
   8.1 Customer (Data Fiduciary) is responsible for handling Data
       Principal requests (access, correction, erasure, etc.)
   8.2 VRIKAAN will assist Customer in responding within 5 business days
       of Customer's written request

9. BREACH NOTIFICATION
   9.1 VRIKAAN notifies Customer within 24 hours of becoming aware of
       a Personal Data Breach
   9.2 Notification includes: nature of breach, categories of data
       affected, estimated number of records, mitigation steps
   9.3 VRIKAAN does NOT notify Data Principals directly — Customer
       handles that obligation under DPDP Act §8(6)
   9.4 VRIKAAN cooperates with any Data Protection Board investigation

10. DELETION ON TERMINATION
    10.1 Within 30 days of MSA termination, VRIKAAN returns or deletes
         all Customer Personal Data
    10.2 Backups containing Personal Data deleted within 90 days
    10.3 Written certificate of deletion provided to Customer

11. AUDIT
    11.1 Customer may audit VRIKAAN's compliance once per year with
         30 days written notice
    11.2 Audit done by Customer's auditors or independent third-party
         (under NDA)
    11.3 Customer pays for audit; VRIKAAN pays only if material
         non-compliance found

12. LIABILITY
    Liability for Personal Data Breach not capped by MSA liability cap.
    However, total liability under DPA limited to actual damages
    suffered + statutory penalties under DPDP Act, max INR [AMOUNT]
    (typically 2x annual fee).

Signed (mirror MSA signatures).
```

---

## 5️⃣ SERVICE LEVEL AGREEMENT (SLA) — per tier

### SOC-Lite SLA

```
SERVICE LEVEL AGREEMENT — SOC-LITE TIER
Exhibit C to MSA between VRIKAAN PVT LTD and [CUSTOMER]

1. AVAILABILITY
   VRIKAAN's monitoring platform: 99.5% monthly uptime
   Excludes: scheduled maintenance (announced 7 days in advance, max 4 hours/month)

2. ALERT RESPONSE
   - Critical severity (severity 12-15): acknowledged within 4 hours, 24×7
   - High severity (severity 8-11):       acknowledged within 8 business hours
   - Medium / Low:                         next business day
   "Acknowledged" = VRIKAAN analyst confirms receipt + begins triage,
   not full resolution.

3. CHANNELS
   Email + Slack notifications. No phone hotline at this tier.

4. MAINTENANCE
   Notification: 7 days in advance via email
   Window: typically Sundays 02:00-06:00 IST

5. REPORTING
   Monthly PDF threat report delivered within 5 business days of month-end

6. CREDITS
   If SLA missed in a given month, Customer credit = 10% of that month's fee
   per missed Critical / High SLA, max 50% of that month's fee per month.

7. EXCLUSIONS
   No credits for: customer-side network outages, force majeure,
   maintenance windows, false-positive triage time.
```

### SOC-Pro SLA

```
SERVICE LEVEL AGREEMENT — SOC-PRO TIER

1. AVAILABILITY: 99.9% monthly uptime
2. ALERT RESPONSE:
   - Critical (sev 12-15): 1 hour, 24×7, phone + email + Slack
   - High (sev 8-11):       4 hours, 24×7
   - Medium:                next business day
3. CHANNELS: 24×7 phone hotline + email + Slack + customer portal
4. MAINTENANCE: 14 days notice, max 2 hours/month outside business hours
5. MONTHLY REPORT: within 3 business days of month-end + 30-min review call
6. QUARTERLY TABLETOP: 1 simulated exercise per quarter
7. CREDITS:
   - SLA miss: 15% of monthly fee per Critical SLA missed
   - Cap: 50% of that month's fee
8. RESPONSE-TIME PENALTIES:
   - Critical response > 1 hour: 5% credit
   - Critical response > 4 hours: 15% credit
   - Critical response > 24 hours: 25% credit + escalation to CEO

This SLA replaces the SOC-Lite SLA when Customer upgrades.
```

### SOC-Enterprise SLA

```
SERVICE LEVEL AGREEMENT — SOC-ENTERPRISE TIER

1. AVAILABILITY: 99.95% monthly uptime
2. ALERT RESPONSE:
   - Critical: 15 minutes, 24×7
   - High:      30 minutes, 24×7
   - Medium:    2 hours, 24×7
   - Low:       8 hours
3. CHANNELS: Dedicated phone bridge + Slack + email + on-site engineer
4. ON-SITE PRESENCE: 2-5 days per month per SOW
5. INCIDENT RESPONSE (covered): up to 5 incidents per year, T&M after
6. MONTHLY: CISO-level briefing call with VRIKAAN founder
7. QUARTERLY: Full red-team engagement OR external pentest (Customer choice)
8. ANNUAL: Full PCI DSS / SOC 2 readiness assessment
9. CREDITS: 25% of monthly fee per Critical SLA missed, max 100%/month
10. MUTUAL ESCALATION:
    - Critical issue → VRIKAAN CEO notified within 30 min
    - Customer escalation contact named in SOW
```

---

## SIGNING WORKFLOW — 12-step process

Use this checklist for every new deal:

1. ✅ NDA signed before any technical demo
2. ✅ 20-min discovery call (founder-led)
3. ✅ Sandbox demo (live alerts firing)
4. ✅ Pricing call (Customer picks tier)
5. ✅ Draft MSA + DPA + tier-specific SLA + SOW → email
6. ✅ Customer legal review (1-3 weeks typical)
7. ✅ Redlining session (1-2 calls)
8. ✅ Final document version locked
9. ✅ E-sign via DocuSign / Zoho Sign / NameSign
10. ✅ Onboarding kickoff scheduled within 5 days of signature
11. ✅ First invoice raised within 7 days
12. ✅ Wazuh agent deployed in Customer environment within 14 days

---

## RECOMMENDED LEGAL PARTNERS (India)

| Firm | Type | Cost for MSA review | Notes |
|---|---|---|---|
| **Spice Route Legal (Bangalore)** | Boutique SaaS-focused | ₹20-40k | Specialty: SaaS + privacy law |
| **AZB & Partners** | Big-4 | ₹1-3 lakh | Overkill for early-stage |
| **NDA Legal (Mumbai)** | Mid-tier | ₹15-30k | Fast turnaround |
| **Vakil Search Pro** | Online platform | ₹10-20k | Cheapest, decent quality |
| **IndiaFilings Pro** | Online platform | ₹12-25k | Fast |

**Recommendation:** Start w/ Vakil Search Pro for MVP MSA · upgrade to Spice Route once you have ₹50L+ ARR.

---

## RED FLAGS — Customer behavior that signals trouble

| Behavior | What it means | Action |
|---|---|---|
| Multiple rounds of red-lining on liability cap | They expect breaches | Limit cap to 12 mo fees max · walk away if they push for unlimited |
| Insistence on uncapped indemnification | They want to pin breach costs on you | Decline · industry standard is 12-mo cap |
| "Show source code escrow" | Don't trust your continuity | Offer SOC 2 report instead · escrow rarely used |
| Demand for daily reporting | Will be a high-maintenance customer | Set expectation: weekly digest, on-demand dashboard |
| "We need this in 1 week, no MSA" | Will fight every invoice | Decline · MSA must be signed first |
| Wants to negotiate price after MSA signed | Bad faith | Hold price · they signed |
| 90+ day payment terms | Cashflow problem | Demand monthly billing · invoice first business day |

---

## TLDR

1. Get NDA template signed before any technical conversation
2. Get MSA + DPA + SLA + SOW drafted ONCE by lawyer (~₹20-25k)
3. Reuse those templates for every customer w/ minimal changes
4. Don't let lawyers slow down deals — most customers will accept your standard terms if explained clearly
5. Sign electronically — DocuSign or Zoho Sign, ~₹500/document
6. First deal hardest, every subsequent deal 3-5× faster
