# Master Services Agreement (Enterprise)

**VRIKAAN AI Cyber Defense Private Limited** (henceforth "VRIKAAN")
Registered office: _[Pune address]_  ·  CIN: _[CIN]_  ·  GSTIN: _[GST]_
And
**[Customer Name]**, having its registered office at _[Customer address]_

This Master Services Agreement ("**Agreement**") is entered into as of the **Effective Date** set out in the applicable Order Form.

---

## 1. Definitions

1.1 "**Services**" means the cybersecurity products and APIs made available by VRIKAAN under the subscription plan set out in the Order Form, including (without limitation) the AI scam-detection API, deepfake-audio detector, vulnerability scanner, dark-web monitor, and any other endpoints listed at vrikaan.com/api.

1.2 "**Customer Data**" means any data, content, or information submitted by Customer to the Services, including end-user records, log data, and API request payloads.

1.3 "**Authorized Users**" means employees or contractors of Customer who are permitted to use the Services on Customer's behalf.

1.4 "**Order Form**" means the document executed by both parties detailing the subscription tier, term, pricing, and any service-specific terms.

---

## 2. License & Use

2.1 Subject to the terms of this Agreement and payment of Fees, VRIKAAN grants Customer a non-exclusive, non-transferable, non-sublicensable license during the Term to access and use the Services solely for Customer's internal business purposes.

2.2 Customer shall not (a) resell, sublicense, or commercialise the Services as a stand-alone offering; (b) reverse engineer, decompile, or attempt to derive source code from the Services; (c) use the Services for any unlawful or fraudulent purpose; (d) exceed the rate limits or call quotas specified in the Order Form.

2.3 Customer is responsible for the acts and omissions of its Authorized Users.

---

## 3. Service Levels (SLA)

3.1 **Uptime.** VRIKAAN will use commercially reasonable efforts to maintain **99.9% monthly uptime** for the production API (`vrikaan.com/api/*`). Uptime excludes scheduled maintenance (announced 48h in advance) and force-majeure events.

3.2 **Latency.** Median (p50) response time for synchronous endpoints will not exceed **300ms** measured from the India region.

3.3 **Service credits.** If monthly uptime falls below the targets, Customer is entitled to service credits applied to the next billing cycle:

| Monthly Uptime | Service Credit |
|---|---|
| < 99.9% – ≥ 99.0% | 10% |
| < 99.0% – ≥ 95.0% | 25% |
| < 95.0% | 50% |

3.4 Service credits are Customer's sole and exclusive remedy for any uptime breach.

---

## 4. Fees & Payment

4.1 Fees and billing frequency are set out in the Order Form. Fees are payable in **Indian Rupees** and exclude GST and any other applicable taxes.

4.2 Invoices are payable within **30 days** of issue. Overdue amounts accrue interest at **18% per annum** or the maximum rate permitted by law, whichever is lower.

4.3 VRIKAAN may suspend the Services if any undisputed amount is overdue by more than 60 days, with 14 days' prior written notice to Customer.

4.4 Fees are non-refundable except as expressly stated in the 30-day money-back guarantee on first payment for Standard/Advanced/Family plans (does not apply to Enterprise).

---

## 5. Data, Privacy & Security

5.1 **Ownership.** Customer retains all right, title, and interest in Customer Data. VRIKAAN does not claim ownership of Customer Data.

5.2 **Processing.** VRIKAAN processes Customer Data only (a) to provide the Services, (b) to monitor, troubleshoot, and improve the Services, (c) as instructed by Customer, or (d) as required by law.

5.3 **Sub-processors.** VRIKAAN may engage third-party sub-processors (e.g. Vercel, Google Cloud, Firebase, OpenAI, Anthropic, Brevo) as listed at vrikaan.com/sub-processors. VRIKAAN will give 30 days' notice of new sub-processors via that page.

5.4 **Security.** VRIKAAN maintains commercially reasonable administrative, physical, and technical safeguards designed to protect Customer Data, including (without limitation): encryption in transit (TLS 1.2+) and at rest, role-based access controls, MFA on production systems, annual third-party penetration testing.

5.5 **Breach notification.** VRIKAAN will notify Customer without undue delay (and in any event within **72 hours**) of becoming aware of any unauthorised disclosure of Customer Data.

5.6 **Data location.** Customer Data submitted to Indian endpoints is processed in India (Mumbai region) and backed up to a secondary Indian region. Cross-border processing requires Customer's prior written consent.

5.7 **DPDP Act 2023 compliance.** Both parties shall comply with the Digital Personal Data Protection Act, 2023 of India, including Customer's obligations as a Data Fiduciary in respect of end-user personal data submitted to the Services.

5.8 **Deletion.** Upon termination, VRIKAAN will delete Customer Data within **90 days**, except where retention is required by law.

---

## 6. Confidentiality

6.1 Each party may receive Confidential Information of the other (including business plans, technical information, pricing, customer lists). The receiving party shall (a) use it only to perform under this Agreement, (b) protect it with the same care as its own confidential information (not less than reasonable care), and (c) not disclose it to third parties without prior written consent, except as required by law.

6.2 Confidentiality obligations survive termination for **3 years**.

---

## 7. Intellectual Property

7.1 VRIKAAN retains all right, title, and interest in the Services, including all software, models, datasets, documentation, and improvements. No rights are granted other than the limited license in Section 2.

7.2 Feedback provided by Customer about the Services may be used by VRIKAAN without restriction or compensation.

---

## 8. Warranties & Disclaimers

8.1 Each party warrants that it has the corporate authority to enter into this Agreement and that performance does not violate any other agreement.

8.2 VRIKAAN warrants that the Services will perform materially in accordance with the documentation at vrikaan.com/api during the Term.

8.3 **EXCEPT AS EXPRESSLY STATED, THE SERVICES ARE PROVIDED "AS IS" AND VRIKAAN DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.**

8.4 The Services are decision-support tools, not regulated cybersecurity audits. Customer is responsible for its own security posture.

---

## 9. Indemnification

9.1 **VRIKAAN indemnifies Customer** against third-party claims that Customer's use of the Services (within the scope of the license) infringes a third party's intellectual property right, provided Customer (a) promptly notifies VRIKAAN, (b) gives VRIKAAN sole control of the defense, and (c) reasonably cooperates.

9.2 **Customer indemnifies VRIKAAN** against third-party claims arising from (a) Customer Data, (b) Customer's breach of this Agreement, or (c) Customer's misuse of the Services.

---

## 10. Limitation of Liability

10.1 **EXCEPT FOR (A) BREACHES OF CONFIDENTIALITY, (B) INDEMNIFICATION OBLIGATIONS, (C) BREACHES OF SECTION 2.2, OR (D) GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST REVENUE, OR LOSS OF DATA.**

10.2 EACH PARTY'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED **THE FEES PAID OR PAYABLE BY CUSTOMER TO VRIKAAN IN THE 12 MONTHS PRECEDING THE CLAIM**.

---

## 11. Term & Termination

11.1 The initial term is set out in the Order Form. Thereafter the Agreement auto-renews for successive **12-month** periods unless either party gives **60 days' written notice** of non-renewal.

11.2 Either party may terminate for material breach if the breach is not cured within **30 days** of written notice.

11.3 On termination: (a) all licenses cease; (b) Customer pays all accrued fees; (c) each party returns or destroys the other's Confidential Information.

---

## 12. General

12.1 **Governing law.** This Agreement is governed by the laws of India.

12.2 **Disputes.** All disputes shall be resolved by arbitration under the **Arbitration and Conciliation Act, 1996**, seated in **Pune, India**, before a sole arbitrator mutually appointed. Language: English.

12.3 **Force majeure.** Neither party is liable for failure to perform due to causes beyond reasonable control (natural disasters, war, terrorism, government action, internet backbone outages).

12.4 **Assignment.** Neither party may assign without the other's prior written consent, except in connection with a merger, acquisition, or sale of substantially all assets.

12.5 **Notices.** Notices must be in writing to the addresses in the Order Form (with copy by email to hello.vrikaan@gmail.com for VRIKAAN).

12.6 **Entire agreement.** This Agreement, together with the Order Form, constitutes the entire agreement and supersedes all prior agreements on the subject matter.

---

**Signed by the parties' authorised signatories:**

For **VRIKAAN AI Cyber Defense Pvt. Ltd.**
Name: __________________
Title: __________________
Date: __________________
Signature: __________________

For **[Customer Name]**
Name: __________________
Title: __________________
Date: __________________
Signature: __________________
