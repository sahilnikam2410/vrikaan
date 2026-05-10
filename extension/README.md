# VRIKAAN Browser Extension

Manifest V3 extension that adds VRIKAAN's AI cybersecurity tools to any tab in Chrome / Edge / Brave / Arc.

## Features

| Feature | Where | What it does |
|---------|-------|--------------|
| **Scan this URL** | Popup → Tab 1 | Sends current URL to `/api/tools?tool=scam-check`, returns AI verdict |
| **Check security headers** | Popup → Tab 1 | Calls `/api/tools?tool=security-headers`, shows grade |
| **Paste-text scam check** | Popup → Tab 2 | India-specific UPI/phishing/scam detector |
| **Email breach check** | Popup → Tab 3 | k-anonymity HIBP-style lookup |
| **Right-click context menu** | Any selected text or link | Opens vrikaan.com with the value pre-filled |
| **Auto-badge suspicious links** | Every page (content script) | Local-only heuristic flags shortened URLs, IDN spoofs, bank-impersonation hosts |
| **Keyboard shortcut** | `Alt+Shift+V` | Opens the popup from anywhere |

## Install (developer mode)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode** in the top-right.
3. Click **Load unpacked**.
4. Select the `extension/` folder of this repo.

The extension is now active. Click the VRIKAAN icon in the toolbar.

## Publish to Chrome Web Store (optional)

1. Generate the four icon sizes (16, 32, 48, 128 px) into `extension/icons/`. SVG → PNG via `scripts/build-icons.mjs` (TODO).
2. Zip the `extension/` folder.
3. Upload at https://chrome.google.com/webstore/devconsole.
4. One-time $5 developer fee. Review usually 1-3 days.

## Files

```
extension/
├── manifest.json     v3 manifest
├── popup.html        toolbar popup UI
├── popup.css         shared styles
├── popup.js          popup logic (calls /api/tools)
├── background.js     service worker (context-menu)
├── content.js        runs on every page (link badges)
├── options.html      settings page
├── options.js        settings logic (chrome.storage.sync)
├── icons/            16/32/48/128 PNGs (TODO)
└── README.md         this file
```

## Notes

- **No data leaves the user's device** unless they explicitly click a Scan button. Auto-badge runs locally.
- All network calls go through `https://vrikaan.com/api/tools` — same backend as the website.
- Storage uses `chrome.storage.sync` (settings sync across the user's devices when signed into Chrome).
- Permissions kept minimal: `storage`, `activeTab`, `scripting`, `tabs`, `contextMenus`, plus host-permission `https://vrikaan.com/*`.
