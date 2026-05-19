# VRIKAAN — Google Search Console Setup + Indexing Request

Goal: get all 100+ vrikaan.com pages indexed by Google within 7 days. Currently most new routes (Aadhaar Mask, Festival Fraud, Scam Recovery, etc.) are not surfacing in search.

Two phases:
- **Phase A** — verify ownership + submit sitemap (one-time, ~10 min)
- **Phase B** — manually request indexing for top 30 high-intent URLs (~20 min)

After this, Google typically indexes within 24-72 hours and starts ranking within 2-3 weeks.

---

## PHASE A — One-time setup (10 min)

### 1. Add property at Search Console

1. Open https://search.google.com/search-console
2. Sign in with `sahilnikam133@gmail.com` (or whichever Google account owns the domain)
3. Click **Add property** (top-left dropdown)
4. Choose **Domain** (not URL prefix) — single property covers vrikaan.com + www + http + https + subdomains
5. Enter `vrikaan.com`

### 2. Verify ownership (TXT record at GoDaddy)

Search Console will display a TXT record to add:
```
google-site-verification=<random-token-here>
```

At GoDaddy → Products → vrikaan.com → DNS → Add Record:
| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | `google-site-verification=<paste-token>` | 1 hr |

Save. Back at Search Console, click **Verify**. Usually instant; max 30 min wait.

✓ Already done in past — visible at top of your existing `vrikaan.com` TXT records: `google-site-verification=fKz2O4oSqO-QeM68xk8lYxqlGnn6Q7ubDaxN98oQwBE`. If that's still the active property, skip to step 3.

### 3. Submit sitemap

Once verified:

1. Left sidebar → **Sitemaps**
2. Enter `sitemap.xml`
3. Click **Submit**

Should show "Success" within seconds. Google now knows about all 122 prerendered URLs.

If you see "Couldn't fetch" — verify the URL works in browser:
```
https://www.vrikaan.com/sitemap.xml
```

### 4. Confirm sitemap coverage

After 1-2 hours, the Sitemaps panel will show:
- Discovered URLs: ~122
- Indexed URLs: starts at 0, grows over days

---

## PHASE B — Manual indexing requests (20 min)

Google's auto-indexer is slow. Manual requests fast-track top URLs.

**Quota:** ~10-12 manual requests per day per property. Use them on highest-value pages.

### Steps for each URL:

1. Search Console → **URL Inspection** (top search bar)
2. Paste full URL (e.g. `https://www.vrikaan.com/scam-recovery`)
3. Wait 10-30 sec for Google to fetch live
4. If status is "URL is not on Google":
   - Click **Request Indexing**
   - Wait ~30 sec for the test fetch
   - Click **Request Indexing** again to confirm
   - Google queues it (1-7 days to index)
5. If status is "URL is on Google" already → skip
6. Move to next URL

### Day 1 — Top 10 (emergency / high-intent)

Paste each into URL Inspection + Request Indexing:

1. `https://www.vrikaan.com/scam-recovery`
2. `https://www.vrikaan.com/otp-decay`
3. `https://www.vrikaan.com/stolen-phone`
4. `https://www.vrikaan.com/safe-word`
5. `https://www.vrikaan.com/aadhaar-mask`
6. `https://www.vrikaan.com/festival-fraud`
7. `https://www.vrikaan.com/device-scan`
8. `https://www.vrikaan.com/upi-lookup`
9. `https://www.vrikaan.com/loan-app-check`
10. `https://www.vrikaan.com/whatsapp-audit`

### Day 2 — Privacy + Pro tools

11. `https://www.vrikaan.com/receipt-audit`
12. `https://www.vrikaan.com/voiceprint`
13. `https://www.vrikaan.com/deepfake-audio`
14. `https://www.vrikaan.com/scam-check`
15. `https://www.vrikaan.com/dark-web-monitor`
16. `https://www.vrikaan.com/password-vault`
17. `https://www.vrikaan.com/vulnerability-scanner`
18. `https://www.vrikaan.com/identity-xray`
19. `https://www.vrikaan.com/security-audit`
20. `https://www.vrikaan.com/security-score`

### Day 3 — Brand + careers + desktop

21. `https://www.vrikaan.com/` (homepage)
22. `https://www.vrikaan.com/about`
23. `https://www.vrikaan.com/founder`
24. `https://www.vrikaan.com/careers`
25. `https://www.vrikaan.com/desktop`
26. `https://www.vrikaan.com/pricing`
27. `https://www.vrikaan.com/features`
28. `https://www.vrikaan.com/contact`
29. `https://www.vrikaan.com/press`
30. `https://www.vrikaan.com/blog`

After day 3, remaining 90 URLs will be auto-indexed by Google's crawler within 2-4 weeks (slower but free).

---

## PHASE C — Monitor + iterate (weekly, 5 min)

### Each Monday morning, check:

1. **Performance tab** → "Total clicks" + "Total impressions" trend
   - Week 1: 0-50 impressions normal (freshly indexed)
   - Week 4: 500-2000 impressions/wk if SEO is working
   - Week 12: 5k+ impressions/wk for India-specific queries

2. **Queries that drove clicks** — sort by clicks descending
   - Note India-specific queries Google ranks you for
   - Use these queries in future blog post titles

3. **Coverage** → see indexed vs not-indexed status
   - Pages "Discovered – currently not indexed" → low-priority, ignore unless many
   - Pages "Crawled – currently not indexed" → may need better content/links
   - Pages "Indexed" → 🎉

4. **Mobile usability** — should be 0 issues (your site is fully responsive)
5. **Core Web Vitals** — target green for LCP, FID, CLS
   - Web app uses Vite + lazy loading, should pass naturally

### Backlinks to acquire (weekly task)

- Submit `vrikaan.com` to:
  - https://www.crunchbase.com/add-new (free company listing)
  - https://www.producthunt.com (when launched)
  - https://news.ycombinator.com (Show HN — when launched)
  - https://www.reddit.com/r/india (organic posts only, no spam — see reddit-quora-seeding.md)
  - https://en.wikipedia.org (only after media coverage exists)
  - https://www.angellist.com (free startup listing)
  - https://yourstory.com / inc42.com / entrackr.com (cold pitch — see press-release-launch.md)

Each external backlink boosts Search Console rankings within 2-3 weeks.

---

## TROUBLESHOOTING

### "Sitemap couldn't fetch"
- Confirm URL works: `curl https://www.vrikaan.com/sitemap.xml`
- Check Vercel rewrite rules haven't accidentally captured `/sitemap.xml`
- Re-submit after fix

### "URL is not on Google" for >7 days after request
- Check for `noindex` meta tag accidentally added (use View Source)
- Check robots.txt isn't blocking: `https://www.vrikaan.com/robots.txt`
- Check `<link rel="canonical">` points to itself, not a different URL
- Re-request indexing once

### Pages indexed but 0 impressions
- Page content is too thin (< 300 words of real text)
- No external sites linking to you yet — keep doing reddit/quora seeding
- Wait — SEO compounds slowly over 3-6 months

### Wrong page showing in search results
- Each route's `<title>` and meta description in `SEO.jsx` are unique — confirm
- Google sometimes picks H1 over <title> — make sure both match intent

---

## VOICE SEARCH OPTIMIZATION (bonus)

Google's voice search ranks long-tail Q&A queries highly. Each of your tool pages can win these:

| Voice query | Target page |
|---|---|
| "how to file FIR for cyber fraud India" | /scam-recovery |
| "I shared OTP what to do" | /otp-decay |
| "my phone got stolen what to do" | /stolen-phone |
| "is this UPI ID safe" | /upi-lookup |
| "is KreditBee RBI registered" | /loan-app-check |
| "how to mask Aadhaar before sharing" | /aadhaar-mask |
| "Diwali scam alerts 2026" | /festival-fraud |

Each page ALREADY has these phrases in its content. Google will pick up over weeks.

---

## EXPECTED TIMELINE

| Week | Result |
|---|---|
| 1 | All 30 priority URLs indexed |
| 2 | First few impressions from long-tail queries |
| 4 | 200-500 weekly impressions, 5-20 clicks |
| 8 | 1-3k weekly impressions, 50-200 clicks |
| 12 | 5k+ impressions, 200-500 clicks → real signups |
| 26 | Top-10 ranking on "scam recovery India", "stolen phone India", "free Indian antivirus" |

SEO is slow but compounds. Stick with the weekly review.

---

## ALSO DO — Bing Webmaster Tools (5 min, free)

Same flow at https://www.bing.com/webmasters/. Bing has 5% market share in India but commands the Edge browser default — worth the 5 min setup.

1. Add site
2. Submit same sitemap
3. Done

---

## DONE

After 10 + 20 + 5 = 35 minutes of one-time work, you have:
- ✅ All 122 URLs queued for indexing
- ✅ Top 30 URLs fast-tracked (live within 7 days)
- ✅ Weekly performance monitoring dashboard
- ✅ Bing coverage as bonus

Estimated organic traffic by month 3: **2-5k visits/month** if you also do the reddit-quora seeding from the marketing pack.
