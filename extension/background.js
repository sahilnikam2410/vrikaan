// VRIKAAN Browser Extension — service worker (MV3)
// 1) Context menus: scan selected text / links via vrikaan.com.
// 2) Network check: queries the Scam DNA network for an identifier (host / UPI /
//    phone / link) and returns a risk verdict. Content script + popup call this
//    via chrome.runtime.sendMessage (service worker has the host permission).
// 3) Per-tab badge: flags the active tab red when its host is a known scam.

const API = "https://www.vrikaan.com/api/tools?tool=scam-dna";
const CACHE_TTL = 30 * 60 * 1000; // 30 min per identifier

// ── context menus ──
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "vrikaan-scan-text", title: "Scan with VRIKAAN", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "vrikaan-scan-link", title: "Check this link with VRIKAAN", contexts: ["link"] });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "vrikaan-scan-text" && info.selectionText) {
    chrome.tabs.create({ url: `https://vrikaan.com/scam-check?text=${encodeURIComponent(info.selectionText.slice(0, 1500))}` });
  } else if (info.menuItemId === "vrikaan-scan-link" && info.linkUrl) {
    chrome.tabs.create({ url: `https://vrikaan.com/scam-check?text=${encodeURIComponent(info.linkUrl)}` });
  }
});

// ── cached network lookup against Scam DNA ──
async function checkIdentifier(identifier) {
  const id = String(identifier || "").trim().toLowerCase();
  if (id.length < 4) return { known: false, riskScore: 0 };
  const key = `chk:${id}`;
  try {
    const cached = (await chrome.storage.session.get(key))[key];
    if (cached && Date.now() - cached.t < CACHE_TTL) return cached.v;
  } catch {}
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check", identifier: id }),
    });
    const v = await r.json();
    try { await chrome.storage.session.set({ [key]: { t: Date.now(), v } }); } catch {}
    return v;
  } catch {
    return { known: false, riskScore: 0, offline: true };
  }
}

// ── message bridge (content script + popup) ──
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "vrikaan-check") {
    checkIdentifier(msg.identifier).then(sendResponse);
    return true; // async
  }
  if (msg?.type === "vrikaan-report") {
    reportScam(msg.identifier, msg.category).then(sendResponse);
    return true; // async
  }
});

// Crowd-report a scam host/identifier into the Scam DNA network.
async function reportScam(identifier, category) {
  const id = String(identifier || "").trim().toLowerCase();
  if (id.length < 4) return { ok: false, error: "too short" };
  try {
    const r = await fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report", identifier: id, category: category || "phishing", tactic: "reported via browser extension" }),
    });
    return await r.json();
  } catch (e) { return { ok: false, error: String(e) }; }
}

// ── per-tab badge when active tab host is a known scam ──
async function badgeForTab(tabId, url) {
  if (!url || !/^https?:/i.test(url)) { clearBadge(tabId); return; }
  let host;
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { return; }
  // skip our own / common safe roots quickly
  if (host.endsWith("vrikaan.com")) { clearBadge(tabId); return; }
  const v = await checkIdentifier(host);
  if (v && v.known && v.riskScore >= 60) {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#ef4444" });
    chrome.action.setTitle({ tabId, title: `VRIKAAN: ${host} flagged as ${v.category || "scam"} (risk ${v.riskScore})` });
  } else {
    clearBadge(tabId);
  }
}
function clearBadge(tabId) {
  try { chrome.action.setBadgeText({ tabId, text: "" }); chrome.action.setTitle({ tabId, title: "VRIKAAN Scam Shield" }); } catch {}
}

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === "complete" && tab?.url) badgeForTab(tabId, tab.url);
});
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => { if (!chrome.runtime.lastError && tab?.url) badgeForTab(tabId, tab.url); });
});
