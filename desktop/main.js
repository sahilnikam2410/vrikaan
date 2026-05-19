/**
 * VRIKAAN Desktop — main process.
 *
 * Boots an Electron BrowserWindow that loads vrikaan.com (or local dev
 * server in dev mode) and exposes native scan APIs via preload-based
 * contextBridge. Adds system-tray icon for background ops.
 *
 * Distributed as signed .exe (Win) / .dmg (Mac) / .AppImage (Linux).
 * Auto-updater pulls from GitHub Releases.
 */

const { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog, Notification } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { scanPath, watchDownloads, computeHash } = require("./scan-engine");

const isDev = process.env.NODE_ENV === "development";
const PROD_URL = "https://www.vrikaan.com/?vrikaan_app=desktop";
const DEV_URL = "http://localhost:5173/?vrikaan_app=desktop";

let mainWindow = null;
let tray = null;
let downloadWatcher = null;

// ── Single-instance lock ────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#030712",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: isDev,
    },
    title: "VRIKAAN — AI Cyber Defense",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(isDev ? DEV_URL : PROD_URL);
  if (isDev) mainWindow.webContents.openDevTools({ mode: "right" });

  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      if (process.platform === "darwin") app.dock?.hide();
    }
  });

  // Open external links in real browser, not in-app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("https://www.vrikaan.com") && !url.startsWith("https://vrikaan.com")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, "assets", process.platform === "darwin" ? "tray-mac.png" : "tray.png"));
  tray.setToolTip("VRIKAAN — Always-on cyber defense");

  const menu = Menu.buildFromTemplate([
    { label: "Open VRIKAAN", click: () => { mainWindow?.show(); mainWindow?.focus(); if (process.platform === "darwin") app.dock?.show(); } },
    { type: "separator" },
    { label: "Scan Downloads folder", click: () => triggerScan(path.join(os.homedir(), "Downloads")) },
    { label: "Scan a folder...", click: chooseFolderAndScan },
    { type: "separator" },
    { label: "Status: monitoring", enabled: false },
    { type: "separator" },
    { label: "Quit VRIKAAN", click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on("click", () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ── IPC: scan APIs called from renderer (web app) ────────────────────
ipcMain.handle("vrikaan:scan-path", async (_e, pathToScan, opts = {}) => {
  return scanPath(pathToScan, opts);
});

ipcMain.handle("vrikaan:hash-file", async (_e, filePath) => {
  return computeHash(filePath);
});

ipcMain.handle("vrikaan:choose-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
    title: "Select folder to scan",
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("vrikaan:system-info", () => ({
  platform: process.platform,
  arch: process.arch,
  release: os.release(),
  totalMem: os.totalmem(),
  freeMem: os.freemem(),
  homedir: os.homedir(),
  desktopDir: path.join(os.homedir(), "Desktop"),
  downloadsDir: path.join(os.homedir(), "Downloads"),
  appVersion: app.getVersion(),
}));

// ── Background download watcher ──────────────────────────────────────
function startDownloadWatcher() {
  if (downloadWatcher) return;
  const dir = path.join(os.homedir(), "Downloads");
  if (!fs.existsSync(dir)) return;

  downloadWatcher = watchDownloads(dir, (newFilePath) => {
    new Notification({
      title: "VRIKAAN scanning new download",
      body: path.basename(newFilePath),
      silent: true,
    }).show();

    scanPath(newFilePath).then((result) => {
      if (result?.threats > 0) {
        new Notification({
          title: "⚠ Possible threat in download",
          body: `${path.basename(newFilePath)} flagged. Click to review.`,
        }).show();
      }
    });
  });
}

async function chooseFolderAndScan() {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"] });
  if (result.canceled) return;
  triggerScan(result.filePaths[0]);
}

function triggerScan(targetPath) {
  mainWindow?.show();
  mainWindow?.focus();
  mainWindow?.webContents.send("vrikaan:start-scan", { path: targetPath });
}

// ── Lifecycle ────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  startDownloadWatcher();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Auto-update (production only)
  if (!isDev) {
    try {
      const { autoUpdater } = require("electron-updater");
      autoUpdater.checkForUpdatesAndNotify();
      setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 6 * 60 * 60 * 1000); // every 6h
    } catch (e) {
      console.warn("Auto-updater not available:", e.message);
    }
  }
});

app.on("window-all-closed", () => {
  // Keep app running in tray. Only quit explicitly via tray menu.
});

app.on("before-quit", () => { app.isQuitting = true; });
