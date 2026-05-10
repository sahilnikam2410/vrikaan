// VRIKAAN Browser Extension — service worker (MV3)
// Adds a context menu for "Scan with VRIKAAN" on selected text and links.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "vrikaan-scan-text",
    title: "Scan with VRIKAAN",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "vrikaan-scan-link",
    title: "Check this link with VRIKAAN",
    contexts: ["link"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "vrikaan-scan-text" && info.selectionText) {
    const url = `https://vrikaan.com/scam-check?text=${encodeURIComponent(info.selectionText.slice(0, 1500))}`;
    chrome.tabs.create({ url });
  } else if (info.menuItemId === "vrikaan-scan-link" && info.linkUrl) {
    const url = `https://vrikaan.com/scam-check?text=${encodeURIComponent(info.linkUrl)}`;
    chrome.tabs.create({ url });
  }
});
