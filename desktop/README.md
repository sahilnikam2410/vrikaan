# VRIKAAN Desktop

Native cyber defense app for Windows / macOS / Linux. Wraps vrikaan.com web UI and adds:

- 🖥 Real whole-disk scan (Downloads folder, USB drives, any folder)
- 🔁 Real-time download watcher (auto-scans new downloads in background)
- 🛰 System tray + native notifications
- 🔒 Privacy: only file hashes leave device, never file contents
- 🔄 Auto-update via GitHub Releases

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Electron BrowserWindow                                 │
│  └─ loads https://www.vrikaan.com (renderer = web UI)   │
│                                                         │
│  preload.js — contextBridge exposes window.vrikaan API  │
│                                                         │
│  main.js — IPC handlers + tray + download watcher       │
│                                                         │
│  scan-engine.js — native fs walk + SHA-256 + API check  │
└─────────────────────────────────────────────────────────┘
            │
            ▼
   https://www.vrikaan.com/api/tools?tool=file-hash-check
            (only the 64-char SHA-256 crosses the network)
```

## Web app integration

The renderer (existing React app at vrikaan.com) can detect desktop mode and unlock extra UI:

```js
// In any React component
if (window.vrikaan?.isDesktop) {
  // Native scan available — show "Scan whole disk" button
  const folder = await window.vrikaan.chooseFolder();
  const result = await window.vrikaan.scanPath(folder, {
    onProgress: (p) => console.log(`${p.current}/${p.total}`)
  });
  // result: { total, scanned, threats, clean, suspicious, files: [...] }
}
```

DeviceScanner.jsx already has the scaffolding — add detection block to auto-enable native mode when running inside Electron.

## Development

```bash
cd desktop
npm install
npm run dev      # connects to localhost:5173 (run `npm run dev` in repo root too)
```

## Production build

```bash
npm run build         # builds for current OS
npm run build:win     # Windows .exe + portable
npm run build:mac     # macOS .dmg
npm run build:linux   # AppImage + .deb
```

Output goes to `desktop/dist/`. Signed builds need:
- **Windows:** code-signing certificate (DigiCert / Sectigo, ~₹30k/yr) → set `CSC_LINK` + `CSC_KEY_PASSWORD` env vars
- **macOS:** Apple Developer cert ($99/yr) + notarization → set `CSC_NAME` + `APPLE_ID` + `APPLE_ID_PASSWORD`
- **Linux:** no signing needed for AppImage; .deb can be signed w/ GPG key

## Distribution

1. Tag release: `git tag v0.1.0 && git push --tags`
2. GitHub Actions builds for all 3 OS (workflow not yet written — TODO)
3. Auto-updater pulls from GitHub Releases on app launch
4. Direct download links: `vrikaan.com/desktop` → static page w/ buttons per OS

## What's NOT included in v0.1

- ❌ Code-signing certs (must buy + configure separately)
- ❌ Real-time on-access scanning (requires kernel driver — needs paid Wazuh-style agent. Phase 3.)
- ❌ Self-quarantine / delete malicious files (user must manually delete; we only flag)
- ❌ Android/iOS apps (separate Capacitor / React Native projects — Phase 3)

## Assets needed before first build

Place these in `desktop/assets/`:
- `icon.ico` (Windows) — 256×256 multi-resolution ICO
- `icon.icns` (Mac) — 1024×1024 ICNS
- `icon.png` (Linux + tray base) — 512×512 PNG
- `tray.png` — 16×16 + 32×32 PNG (Win/Linux tray)
- `tray-mac.png` — 16×16 template (transparent + black) for Mac menubar

Generate from `/public/wolf-icon.png` using https://icoconvert.com or `electron-icon-builder`.

## File map

| File | Lines | Purpose |
|---|---|---|
| `package.json` | ~80 | Electron + electron-builder config |
| `main.js` | ~180 | Main process — window, tray, IPC handlers, lifecycle |
| `preload.js` | ~35 | Sandboxed contextBridge — exposes window.vrikaan API |
| `scan-engine.js` | ~200 | Native fs walk + SHA-256 streaming + API check + watch |
| `README.md` | this | Architecture + build + distribution guide |

## Roadmap

- **v0.1** (this) — scaffold, basic scan, download watcher, tray
- **v0.2** — UI updates in DeviceScanner.jsx to detect + use native mode
- **v0.3** — GitHub Actions multi-OS build workflow + signed installer pipeline
- **v0.4** — USB-drive auto-scan when mounted (Mac: `diskutil activity`, Win: `wmic`)
- **v0.5** — Schedule weekly full-disk scan (background, low CPU)
- **v1.0** — Code-signed installers, public release, vrikaan.com/desktop landing page
- **v2.0** — Optional kernel agent for real-time on-access scanning (huge engineering effort, partner w/ existing antivirus engine likely)

## Cost to ship v1.0

- Apple Developer: $99 one-time
- Windows code-sign cert: ₹30,000/yr (DigiCert) or ₹15k/yr (Sectigo)
- GitHub Actions: free for public repos
- GitHub Releases hosting: free
- DNS for vrikaan.com/desktop: already done
- **Total: ~₹50k year 1, ₹30k recurring**

## Why bother (vs just web app)?

Web app cannot:
- Auto-scan whole disk without user clicking each file
- Watch new downloads in background
- Run when browser closed
- Survive browser cache wipe / session loss
- Quarantine threats

Desktop wrapper unlocks all of these. Same code in DeviceScanner.jsx detects `window.vrikaan?.isDesktop` and switches modes.

## License

UNLICENSED · proprietary to VRIKAAN, Nashik. Contact hello@vrikaan.com for distribution rights.
