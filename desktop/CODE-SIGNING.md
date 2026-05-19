# VRIKAAN Desktop — Code Signing Setup

Without code signing:
- Windows shows "Unknown Publisher · Don't Run?" SmartScreen warning → 70% of users abandon install
- macOS shows "VRIKAAN can't be opened because Apple cannot check it for malicious software" → 90% abandon
- Linux works fine unsigned (community trust model)

This doc walks through one-time setup. Estimated cost year 1: **~₹50,000**. Recurring: **~₹30,000/yr**.

---

## 1️⃣ WINDOWS — Authenticode certificate

### Provider comparison (Mar 2026 pricing, India)

| Provider | Type | Price/yr | EV warning skip | Notes |
|---|---|---|---|---|
| **Sectigo (Comodo)** Code Signing OV | OV | ₹14,000 | ❌ slow rep build (~50 installs) | Cheapest, slow Microsoft SmartScreen reputation build |
| **Sectigo EV Code Signing** | EV | ₹28,000 | ✅ instant rep, hardware token | Recommended — no SmartScreen warning from day 1 |
| **DigiCert OV** | OV | ₹35,000 | ❌ slow | Premium brand, faster validation |
| **DigiCert EV** | EV | ₹52,000 | ✅ instant | Gold standard, costliest |
| **SSL.com EV** | EV | ₹25,000 | ✅ instant | Good middle option |

### Recommended: Sectigo EV Code Signing — ₹28,000/yr

**Why EV not OV?**
- OV cert = SmartScreen still shows warning until ~50 unique installs build "reputation"
- EV cert = no warning from day 1. Worth the extra ₹14k for a serious product launch.

### Buy path

1. Go to **certera.com** (Indian reseller, cheaper than direct) → Sectigo EV Code Signing
2. Order → submit business documents:
   - **GSTIN** (vrikaan must be registered — if not, register at gst.gov.in first, ₹2k via CA)
   - **Certificate of Incorporation** (if pvt ltd) OR **MSME / Udyam registration** (if proprietor)
   - **PAN card** of business
   - **Director/proprietor ID** (Aadhaar + PAN)
3. Validation call from Sectigo (~1 week) — confirms business is real, ask "do you sell software?"
4. They ship a **hardware USB token (YubiKey)** physically to your address (~5-7 working days India)
5. Insert token → install drivers → run windows-signtool against your `.exe`

### Configure in CI (GitHub Actions)

Once the token arrives:
1. Generate a Base64 export of the cert from the token (Sectigo provides utility)
2. GitHub repo → Settings → Secrets → Actions → add:
   - `WIN_CSC_LINK` = Base64-encoded `.pfx` content
   - `WIN_CSC_KEY_PASSWORD` = your cert password
3. Existing `.github/workflows/desktop-build.yml` will pick these up automatically

⚠ **EV token note:** True EV signing requires hardware token, can't be done in CI. Workaround:
- **Cloud HSM signing** via Azure Key Vault / DigiCert KeyLocker (~₹5k/yr extra) — lets CI sign
- OR: build unsigned in CI, sign locally on your laptop before publishing (manual step)

---

## 2️⃣ MACOS — Apple Developer + Notarization

### Cost: **$99/yr (~₹8,300)**

Single price, no separate signing/notarization cost.

### Setup

1. Go to **developer.apple.com/programs**
2. Sign in with Apple ID (or create one — must be a non-iCloud Apple ID for individual enrollment)
3. Pay $99 via credit card
4. Choose enrollment type:
   - **Individual** — easier, but app shows your personal name as publisher ("Sahil Anil Nikam")
   - **Organization** — needs D-U-N-S number (free, takes 1-2 weeks to obtain from Dun & Bradstreet) + Indian business proof. Shows "VRIKAAN" as publisher.
   - **Recommend Organization** if you want professional brand visibility
5. Wait for approval (1-3 days)

### Generate signing certificate

1. Login to **developer.apple.com/account**
2. Certificates, IDs & Profiles → Certificates → **+** → choose **Developer ID Application** (NOT App Store Distribution)
3. Generate CSR on your Mac: Keychain Access → Certificate Assistant → Request from CA → Save to disk
4. Upload CSR → download `.cer` → double-click to install in Keychain
5. Export from Keychain as **.p12** with password — this is what CI needs

### Configure in CI

GitHub Secrets → add:
- `MAC_CSC_LINK` = Base64-encoded `.p12` (`base64 -i cert.p12 | pbcopy` on Mac)
- `MAC_CSC_KEY_PASSWORD` = your .p12 password
- `APPLE_ID` = your Apple Developer email
- `APPLE_ID_PASSWORD` = an **app-specific password**, NOT your main Apple ID password
  - Generate at: appleid.apple.com → Sign-In and Security → App-Specific Passwords
- `APPLE_TEAM_ID` = 10-char ID from developer.apple.com → Membership tab

### Notarization

electron-builder runs notarization automatically when these secrets are present. First notarization takes ~5-15 min. Subsequent ones ~2-3 min. Apple servers staple the notarization ticket to your .dmg.

---

## 3️⃣ LINUX — No signing needed for AppImage

AppImage is a portable container — runs without install. Users just `chmod +x VRIKAAN.AppImage && ./VRIKAAN.AppImage`.

For .deb / .rpm distribution to repositories:
- Generate GPG key (free, `gpg --gen-key`)
- `dpkg-sig --sign builder file.deb` before upload
- Submit to Debian / Ubuntu PPA via Launchpad (free, free)
- For Arch: AUR submission (free, community-maintained)

---

## 4️⃣ TIMELINE — first signed release

| Day | Action | Cost |
|---|---|---|
| Day 0 | Order Sectigo EV cert at certera.com | ₹28,000 |
| Day 0 | Enroll Apple Developer Program | ₹8,300 |
| Day 0 | Apply for D-U-N-S number (if Org enrollment for Mac) | Free |
| Day 1-3 | Apple approves enrollment |  |
| Day 7 | Sectigo validation call (be ready w/ business docs) |  |
| Day 12 | YubiKey arrives, install drivers + utility | ₹500 shipping |
| Day 13 | Generate .pfx + .p12 → upload to GitHub Secrets |  |
| Day 14 | Tag `desktop-v0.1.0` → CI builds signed installers for all 3 OS |  |
| Day 15 | Test installs on fresh Win10, macOS Sonoma, Ubuntu 22.04 |  |
| Day 16 | Publish to GitHub Releases → vrikaan.com/desktop landing page goes live |  |

**Total year-1 cost:** ₹28,000 (Win cert) + ₹8,300 (Apple) + ₹500 (shipping) = **₹36,800**

If you do Cloud HSM signing for EV-in-CI: +₹5,000 = ₹41,800

---

## 5️⃣ ANNUAL RENEWAL CALENDAR

| Month before expiry | Action |
|---|---|
| 60 days | Email reminder from Sectigo + Apple |
| 30 days | Re-order, complete validation if needed |
| 7 days | Generate new keys + update GitHub Secrets |
| Day of | Old cert expires at midnight UTC |

Set a Google Calendar event 60 days before each renewal — auto-expiry breaks all auto-updates for users.

---

## 6️⃣ IF YOU SKIP SIGNING (free path)

You can release unsigned and instruct users:

**Windows:** "When SmartScreen appears, click 'More info' → 'Run anyway'"
**macOS:** "Right-click VRIKAAN.app → Open → Confirm"
**Linux:** No issue, runs fine

Adoption hit: -60-80%. **Only OK for beta / TestFlight-style early access.** Get certs before public launch.

---

## 7️⃣ ALTERNATIVES TO BUYING

### A — Submit to Microsoft Store (free signing!)
- Microsoft Store handles all signing for you
- Free for individual developers (was $19 one-time, now zero for non-game apps as of 2024)
- Catch: Store review takes 3-7 days, must follow content guidelines, can't include certain native modules
- VRIKAAN qualifies easily

### B — Submit to Mac App Store
- Same free-signing benefit
- $99/yr Apple Developer (so not actually free overall — but if you're paying it anyway for Developer ID)
- Catch: sandbox restrictions limit file-system access — would BREAK the whole-disk scan feature
- Skip for VRIKAAN

### C — Use a notary service
- Some companies (e.g. SignPath.io) offer signing-as-a-service at lower cost
- $300/yr equivalent
- Good for early-stage indies, less reputable for established brand

---

## 8️⃣ DECISION

For VRIKAAN public launch:
1. ✅ Buy **Sectigo EV** for Windows (₹28k)
2. ✅ Enroll **Apple Developer Org** ($99)
3. ✅ Use AppImage unsigned for Linux
4. ⏳ Consider Microsoft Store **in parallel** (free signing + extra distribution channel) once main installer ships

Total Y1: ~₹37k. Pays for itself with 50 paid Pro signups (₹990 × 50 = ₹49,500).
