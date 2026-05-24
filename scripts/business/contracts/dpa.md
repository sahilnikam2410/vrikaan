# Data Processing Addendum (DPA)

This Data Processing Addendum ("DPA") supplements the Master Services Agreement (MSA) between **VRIKAAN AI Cyber Defense Pvt. Ltd.** ("**Processor**" or "**VRIKAAN**") and **[Customer]** ("**Controller**" or "**Customer**"). It reflects the parties' agreement on processing Personal Data in connection with the Services.

## 1. Definitions

Terms not defined here have the meaning in the MSA. The following defined terms apply:

- **"Applicable Data Protection Law"** means the Digital Personal Data Protection Act, 2023 (India) ("DPDP Act"); and, to the extent applicable, the EU GDPR (2016/679), the UK GDPR, and the California Consumer Privacy Act (as amended).
- **"Personal Data"** means any data relating to an identified or identifiable natural person processed by VRIKAAN on Customer's behalf in the course of providing the Services.
- **"Processing"** has the meaning in Applicable Data Protection Law.
- **"Sub-processor"** means any third party engaged by VRIKAAN to process Personal Data on its behalf.
- **"Personal Data Breach"** means a confirmed breach of security leading to the accidental or unlawful destruction, loss, alteration, or unauthorised disclosure of Personal Data.

## 2. Roles & Scope

2.1 Customer is the **Data Fiduciary** (Controller). VRIKAAN is the **Data Processor**.

2.2 VRIKAAN processes Personal Data only:
   (a) to provide the Services per the MSA and Customer's documented instructions;
   (b) to fulfil contractual obligations to Customer;
   (c) as required by law (with prior notice to Customer where permitted).

2.3 **Categories of data subjects:** Customer's end-users, employees, and contractors whose data is submitted to the Services.

2.4 **Categories of Personal Data:** Identification data (name, email, phone), authentication data (hashed credentials, tokens), behaviour data (API logs, scan history), and any content data Customer chooses to submit (e.g., URLs, message bodies, audio files for analysis).

2.5 **Special categories** of Personal Data (health, religion, biometric, etc.) may be submitted only with prior written notice to VRIKAAN and require an Addendum to this DPA.

## 3. Customer Obligations

3.1 Customer is responsible for:
   (a) the lawfulness of Personal Data submitted to the Services (including obtaining valid consents under DPDP Act and other Applicable Laws);
   (b) responding to data principal rights requests (with VRIKAAN's reasonable assistance per Section 6);
   (c) maintaining records of processing.

3.2 Customer instructs VRIKAAN to process Personal Data as set out in the MSA, the Order Form, and any documented instructions Customer provides in writing.

## 4. VRIKAAN Obligations

4.1 VRIKAAN shall:
   (a) process Personal Data only on documented Customer instructions;
   (b) ensure persons authorised to process Personal Data are under a duty of confidentiality;
   (c) implement the technical and organisational measures set out in **Annex A**;
   (d) assist Customer in responding to data principal rights requests (per Section 6);
   (e) notify Customer of any Personal Data Breach without undue delay and in any event within **72 hours** of becoming aware (per Section 7);
   (f) make available to Customer information necessary to demonstrate compliance with this DPA;
   (g) on Customer's request, undertake or contribute to data protection impact assessments and prior consultations with regulators;
   (h) delete or return Personal Data at the end of the Services per Section 8.

## 5. Sub-processors

5.1 Customer provides **general written authorisation** for VRIKAAN to engage sub-processors. The current list of sub-processors is published at **vrikaan.com/sub-processors** (and updated as material changes occur).

5.2 VRIKAAN will give Customer **30 days' advance notice** of any new sub-processor (via the page above and/or email). Customer may object on reasonable data-protection grounds; the parties will work together to find a resolution.

5.3 VRIKAAN remains liable to Customer for sub-processors' compliance with this DPA.

5.4 **Initial sub-processor list:**

| Sub-processor | Purpose | Region |
|---|---|---|
| Vercel Inc. | Hosting + edge serverless | US (primary), India (edge) |
| Google LLC (Firebase) | Database, auth, storage | India / US |
| Anthropic PBC | LLM inference (AI analysis) | US |
| OpenAI LP | LLM inference (fallback) | US |
| Google LLC (Gemini API) | LLM inference (Hindi) | India / US |
| Cashfree Payments | Payments processing | India |
| Brevo SAS | Transactional email | EU (France) |
| Cloudflare Inc. | CDN, DDoS protection | Global |

## 6. Data Principal Rights

6.1 Where Customer is required to respond to a data principal's request (access, correction, erasure, portability, withdrawal of consent, grievance), VRIKAAN will provide reasonable assistance, considering the nature of processing.

6.2 If VRIKAAN receives a data principal request directly, it will (a) not respond except to acknowledge or as required by law, and (b) forward the request to Customer within **5 business days**.

## 7. Personal Data Breach

7.1 VRIKAAN will notify Customer at the technical-contact address in the Order Form within **72 hours** of becoming aware of a Personal Data Breach affecting Customer Data.

7.2 The notice will include (to the extent then known):
   (a) nature of the breach, including categories and approximate number of data subjects and records affected;
   (b) likely consequences;
   (c) measures taken or proposed to address the breach.

7.3 VRIKAAN will provide updates as material information becomes available and will cooperate with Customer's notification obligations under DPDP Act §8(6) and other Applicable Laws.

## 8. Deletion & Return of Personal Data

8.1 Upon termination of the Services, VRIKAAN will, at Customer's election:
   (a) return Personal Data to Customer in a commonly used format within **30 days**; OR
   (b) delete Personal Data and confirm deletion within **90 days**.

8.2 VRIKAAN may retain Personal Data to the extent required by law (e.g., financial records under Indian tax law), subject to the protections of this DPA.

## 9. International Data Transfers

9.1 Where VRIKAAN transfers Personal Data outside India (e.g., to US-based sub-processors for LLM inference), it will implement appropriate safeguards including:
   (a) sub-processor commitments to security and confidentiality at least equivalent to this DPA;
   (b) where required by Applicable Law, Standard Contractual Clauses or equivalent transfer mechanisms.

9.2 The Indian Government may by notification restrict transfer of Personal Data to certain countries (DPDP Act §16). VRIKAAN will comply with any such restrictions.

## 10. Audit

10.1 VRIKAAN will make available to Customer (on request, no more than once per year, and at Customer's expense) information reasonably necessary to demonstrate compliance with this DPA, including (where applicable) SOC 2 Type II reports, ISO 27001 certificates, and penetration test summaries.

10.2 On-site audits require **45 days' prior written notice**, must be conducted during business hours, must not unreasonably disrupt operations, and the auditor must execute confidentiality undertakings acceptable to VRIKAAN.

## 11. Liability

11.1 Each party's liability under this DPA is subject to the limitations in the MSA.

## 12. Order of Precedence

12.1 In case of conflict between the MSA and this DPA on data protection matters, **this DPA prevails**.

---

## Annex A — Technical & Organisational Measures (TOMs)

### A.1 Encryption
- **In transit:** TLS 1.2 or higher for all Services traffic and inter-service communication.
- **At rest:** AES-256 for primary stores (Firestore, GCS).

### A.2 Access controls
- Role-based access control (RBAC) on production systems.
- Multi-factor authentication (MFA) mandatory for all VRIKAAN personnel with production access.
- Least-privilege provisioning; access reviewed quarterly.
- Audit logging of all production access events; logs retained 12 months.

### A.3 Network security
- Production environments isolated by VPC.
- DDoS protection via Cloudflare and Vercel edge.
- Web Application Firewall (WAF) rules on public endpoints.
- Outbound network egress restricted to approved sub-processor endpoints.

### A.4 Application security
- Secure development lifecycle (SDLC) practices, including code review, secrets scanning, dependency vulnerability scanning (Dependabot / Snyk).
- Annual third-party penetration test; remediation tracked in private issue tracker.
- Content Security Policy (CSP), HSTS, X-Frame-Options, and related headers enforced.

### A.5 Personnel security
- Background checks on all personnel with production access.
- Confidentiality undertakings in all employment / contractor agreements.
- Annual security & privacy training mandatory.
- Access revoked on the same business day as role change / departure.

### A.6 Incident response
- Documented incident response plan, exercised at least annually.
- 24/7 on-call rotation for critical incidents.
- Customer notification within 72 hours of a confirmed Personal Data Breach.

### A.7 Business continuity
- Daily encrypted backups; backup retention 30 days.
- Recovery Point Objective (RPO): 24 hours.
- Recovery Time Objective (RTO): 12 hours for primary Services.
- Cross-region failover capability for production database.

### A.8 Vendor security
- Sub-processors are contractually bound to security and confidentiality terms at least equivalent to this DPA.
- New sub-processors are reviewed for security posture, data location, and applicable certifications before onboarding.

### A.9 Compliance & certifications (current or roadmap)
- DPDP Act 2023 (India) — compliant
- ISO 27001 — roadmap (target 2027)
- SOC 2 Type II — roadmap (target 2027)
- CERT-In empanelment — applied
