# VRIKAAN Careers — Google Form build prompts

Two ways to build it: **(A)** paste the prompt into Google Forms' AI builder (Gemini), or **(B)** build manually using the section-by-section spec.

After publishing, copy the form URL and replace `https://forms.gle/your-google-form-id` in `src/assets/pages/Careers.jsx`.

---

## A — ONE-SHOT PROMPT (paste into Forms AI / Gemini)

> Build a job + internship application form for **VRIKAAN — India's AI-powered cyber defense platform**. Title: "Apply to VRIKAAN — Careers". Description: "Thanks for your interest. Fill this form in under 5 minutes. We respond to every application within 7 days, even with a no. Open roles → vrikaan.com/careers".
>
> Collect responses by email. Allow one response per Google account. Show progress bar. Shuffle nothing.
>
> Create **7 sections** with the following questions. Use the field type in **[brackets]** exactly. Mark questions as **required** where noted. Use the role-based conditional logic at the end.
>
> **Section 1 — Role you're applying for**
> 1. Which role? **[Dropdown · required]** — options: SOC Analyst Intern · Full-Stack Engineering Intern · AI / ML Intern · Content & Social Marketing Intern · Junior SOC Engineer · Other / speculative pitch
> 2. If "Other", briefly describe the role you want. **[Short answer]**
> 3. When can you start? **[Date · required]**
> 4. Duration you can commit (for internships). **[Multiple choice]** — 3 months · 6 months · Full-time
>
> **Section 2 — About you**
> 5. Full name **[Short answer · required]**
> 6. Email **[Short answer · required · email validation]**
> 7. Phone (with country code) **[Short answer · required]**
> 8. City, State **[Short answer · required]**
> 9. Languages you're fluent in **[Checkboxes]** — English · Hindi · Marathi · Tamil · Telugu · Kannada · Bengali · Gujarati · Other
> 10. LinkedIn profile URL **[Short answer]**
> 11. GitHub / portfolio URL **[Short answer]**
> 12. Twitter / X handle (optional) **[Short answer]**
>
> **Section 3 — Education & current status**
> 13. Highest qualification (current or completed) **[Dropdown · required]** — Class 12 · Diploma · B.E. / B.Tech · B.Sc. · BCA · M.E. / M.Tech · MCA · MBA · PhD · Other
> 14. Branch / specialization **[Short answer]**
> 15. College / university **[Short answer · required]**
> 16. Year of graduation **[Short answer · required]**
> 17. Are you currently working / interning anywhere? **[Multiple choice · required]** — Yes, full-time · Yes, part-time / internship · No
> 18. If yes, where? **[Short answer]**
>
> **Section 4 — Experience & skills**
> 19. Years of relevant experience (count internships + freelance) **[Multiple choice · required]** — 0 · <1 · 1–2 · 2–4 · 4+
> 20. Pick all that apply to you **[Checkboxes]** — React / JavaScript · Python · Node.js · Firebase / Firestore · Vercel / serverless · MITRE ATT&CK · Wazuh / Splunk / Elastic SIEM · Burp Suite / OWASP ZAP · Wireshark · Linux CLI · Git · CTF / TryHackMe / HackTheBox · Bug-bounty disclosure · Hindi content writing · Figma / Canva · Video editing
> 21. Top 3 skills you'd bring to VRIKAAN **[Paragraph · required]**
> 22. Best work you've shipped (link + 2-line description) **[Paragraph · required]**
> 23. Any CTF / leaderboard / hackathon / open-source rank to share? **[Paragraph]**
>
> **Section 5 — Why VRIKAAN**
> 24. Why VRIKAAN specifically? (3–5 lines) **[Paragraph · required]**
> 25. Which VRIKAAN tool excites you most and why? (try one at vrikaan.com before answering) **[Paragraph · required]**
> 26. If you had to ship one new feature in week 1, what would it be? **[Paragraph]**
>
> **Section 6 — Resume + work samples**
> 27. Resume / CV (PDF preferred, max 10 MB) **[File upload · required · PDF/DOC]**
> 28. Optional: portfolio deck, writing sample, code sample (max 10 MB) **[File upload]**
> 29. Are you open to a paid take-home task (4–8 hours of real-shape work)? **[Multiple choice · required]** — Yes · No
>
> **Section 7 — Logistics**
> 30. Expected stipend / salary range **[Short answer · required]**
> 31. Are you open to remote? **[Multiple choice · required]** — Yes, fully remote · Hybrid (occasional Nashik visits) · On-site Nashik only
> 32. Notice period (if currently employed) **[Short answer]**
> 33. How did you hear about VRIKAAN? **[Multiple choice]** — LinkedIn · X / Twitter · Instagram · Referral · Google search · GitHub · College · Other
> 34. If referral, name of the person who referred you **[Short answer]**
> 35. Anything else we should know? **[Paragraph]**
> 36. I confirm everything above is accurate and I have the right to work in India for the duration mentioned. **[Checkboxes · required]** — I confirm
>
> **Confirmation message after submit:**
> *"Got it. We read every application within 7 days. If we want to move forward, you'll get a 20-minute call invite from Sahil or Khushi. Either way, we respond — no ghosting. Meanwhile, follow @vrikaan on X for what we're shipping. — Sahil & Khushi"*
>
> **Theme:** dark mode if possible · accent colour **#14E3C5** (cyan) · header image: VRIKAAN logo on dark background.

---

## B — MANUAL BUILD CHECKLIST (5-minute build)

1. Open **forms.google.com** → blank form.
2. **Title:** `Apply to VRIKAAN — Careers`
3. **Description:** `Thanks for your interest. Fill this form in under 5 minutes. We respond to every application within 7 days — even with a no. Open roles → vrikaan.com/careers`
4. Click **Settings (top)** → enable:
   - ☑️ Collect email addresses → **Verified**
   - ☑️ Limit to 1 response (requires Google sign-in)
   - ☑️ Show progress bar
   - ☑️ Confirmation message → paste the message from Section 7 above
5. Add **7 section breaks** (one per category above) so it feels like a focused interview, not one giant scroll.
6. Add the **36 questions** exactly as listed in prompt A.
7. **Conditional logic** (under question 1 "Which role?"):
   - If **SOC Analyst Intern** → jump to Section 4 after Section 3
   - If **Other / speculative pitch** → skip directly to Section 5
   - All other choices → linear flow
   (Optional — keep linear if too fiddly.)
8. **Theme** → top-right palette icon:
   - Header colour: `#14E3C5`
   - Background: dark
   - Font: Roboto
   - Upload header image: VRIKAAN wordmark on dark background (use `/og-image.png` from public folder)
9. Hit **Send** → **Link tab** → toggle **Shorten URL** → copy.
10. Replace `https://forms.gle/your-google-form-id` in `src/assets/pages/Careers.jsx` (line ~245) with the real `forms.gle/...` URL.
11. **Responses** tab → click the **green Sheets icon** → creates a linked Google Sheet that auto-fills with each submission. Pin that sheet.
12. (Optional) Add a **Forms add-on**: "Form Notifications" → emails `careers@vrikaan.com` instantly on each submission.

---

## C — POST-PUBLISH WIRING

### Replace in Careers.jsx
```jsx
// Find this line
href="https://forms.gle/your-google-form-id"
// Replace with
href="https://forms.gle/YOUR_REAL_ID"
```

### Alternatively pre-fill role per card
Google Forms supports URL pre-fill. After publishing, click **Send → 3-dot menu → Get pre-filled link**, fill only "Which role?", click **Get link**, copy the URL — it will look like:
```
https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456=SOC+Analyst+Intern
```
Use a different pre-filled URL per role in `OPENINGS[].applyUrl` to skip the dropdown for the applicant.

### Optional: email auto-reply
Install the **Email Notifications for Google Forms** add-on (free tier: 20/day). Configure:
- **To:** `{{Email}}` (the applicant)
- **Subject:** `Got your application — VRIKAAN Careers`
- **Body:**
> Hi {{Full name}}, this confirms we got your application for {{Which role?}}. We read every application within 7 days. If you're a match, Sahil or Khushi will email you a 20-minute call invite. Either way, you'll hear back — no ghosting. — Team VRIKAAN

### Optional: Sheet → Slack / Notion sync
- Use **Zapier** or **Make.com** to push each new row into a `#hiring` Slack channel or a Notion database.
- Free Zapier tier covers ~100 tasks/month — more than enough for early-stage hiring.

---

## D — SHORT URL TIPS

- Set up a custom subdomain redirect: `apply.vrikaan.com → forms.gle/...` via Vercel `_redirects` or DNS CNAME.
- Or use `vrikaan.com/apply` as a 302 redirect that lives in `vercel.json`:
  ```json
  { "redirects": [{ "source": "/apply", "destination": "https://forms.gle/YOUR_ID", "permanent": false }] }
  ```
- Print on business cards / Insta bio: **`vrikaan.com/apply`** instead of the long forms URL.
