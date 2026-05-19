/**
 * VRIKAAN Desktop — preload script.
 *
 * Exposes a sandboxed `window.vrikaan` API to the renderer (the web app)
 * so the React code at vrikaan.com can detect native capabilities and call
 * disk-scan / hash / system-info via IPC.
 *
 * Renderer detects via: `if (window.vrikaan?.isDesktop) { ... }`
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vrikaan", {
  isDesktop: true,
  version: "0.1.0",

  // Scan a file or folder (recursively for folders). Returns:
  //   { total, scanned, threats, clean, suspicious, files: [{ path, hash, status, signature }] }
  scanPath: (targetPath, opts) => ipcRenderer.invoke("vrikaan:scan-path", targetPath, opts),

  // Compute SHA-256 of a file. Returns hex string.
  hashFile: (filePath) => ipcRenderer.invoke("vrikaan:hash-file", filePath),

  // Open a native folder picker. Returns path or null on cancel.
  chooseFolder: () => ipcRenderer.invoke("vrikaan:choose-folder"),

  // Get system info — platform, arch, mem, version, common paths.
  systemInfo: () => ipcRenderer.invoke("vrikaan:system-info"),

  // Subscribe to scan-trigger events from tray menu.
  onStartScan: (callback) => {
    const handler = (_e, payload) => callback(payload);
    ipcRenderer.on("vrikaan:start-scan", handler);
    return () => ipcRenderer.off("vrikaan:start-scan", handler);
  },
});
