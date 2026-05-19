#!/usr/bin/env node
/**
 * VRIKAAN Desktop — icon generator.
 *
 * Reads /public/wolf-icon.png (the canonical brand icon, 512×512) and
 * generates all platform-specific icon formats needed by electron-builder.
 *
 * Outputs to desktop/assets/:
 *   icon.ico       — Windows installer + window icon (multi-resolution)
 *   icon.icns      — macOS app bundle (multi-resolution)
 *   icon.png       — Linux + tray base (512×512)
 *   tray.png       — Win/Linux tray (16×16 + 32×32 combined)
 *   tray-mac.png   — macOS menu bar (16×16 template black/transparent)
 *
 * Dependencies (auto-installed if missing):
 *   - electron-icon-builder (generates .ico + .icns from PNG)
 *   - sharp (PNG resize + format conversion)
 *
 * Usage:
 *   cd desktop && node scripts/generate-icons.cjs
 */

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const SOURCE = path.resolve(ROOT, "..", "public", "wolf-icon.png");

if (!fs.existsSync(SOURCE)) {
  console.error(`✗ Source icon not found at: ${SOURCE}`);
  console.error("  Place a 512x512 PNG at public/wolf-icon.png first.");
  process.exit(1);
}

if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS, { recursive: true });

console.log("→ Source:", SOURCE);
console.log("→ Output:", ASSETS);

// Check for sharp
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.log("→ Installing sharp (one-time)…");
  execSync("npm install --no-save sharp", { stdio: "inherit", cwd: ROOT });
  sharp = require("sharp");
}

// Check for electron-icon-builder
let hasIconBuilder = false;
try {
  require.resolve("electron-icon-builder");
  hasIconBuilder = true;
} catch {
  console.log("→ Installing electron-icon-builder (one-time)…");
  execSync("npm install --no-save electron-icon-builder", { stdio: "inherit", cwd: ROOT });
  hasIconBuilder = true;
}

(async () => {
  // 1. Base 512×512 PNG (Linux + tray base)
  console.log("→ Generating icon.png (512×512)…");
  await sharp(SOURCE).resize(512, 512, { fit: "contain", background: { r: 3, g: 7, b: 18, alpha: 0 } }).png().toFile(path.join(ASSETS, "icon.png"));

  // 2. .ico + .icns via electron-icon-builder
  console.log("→ Generating icon.ico + icon.icns via electron-icon-builder…");
  const tmpOut = path.join(ASSETS, ".tmp-icons");
  try {
    execSync(
      `npx electron-icon-builder --input="${SOURCE}" --output="${tmpOut}" --flatten`,
      { stdio: "inherit", cwd: ROOT }
    );
    // Move generated files up
    const icoSrc = path.join(tmpOut, "icon.ico");
    const icnsSrc = path.join(tmpOut, "icon.icns");
    if (fs.existsSync(icoSrc)) fs.copyFileSync(icoSrc, path.join(ASSETS, "icon.ico"));
    if (fs.existsSync(icnsSrc)) fs.copyFileSync(icnsSrc, path.join(ASSETS, "icon.icns"));
    // Cleanup
    fs.rmSync(tmpOut, { recursive: true, force: true });
  } catch (e) {
    console.warn("⚠ electron-icon-builder failed:", e.message);
    console.warn("  Skipping .ico/.icns — generate manually at https://icoconvert.com");
  }

  // 3. Tray icons (Win/Linux)
  console.log("→ Generating tray.png (32×32)…");
  await sharp(SOURCE).resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(ASSETS, "tray.png"));

  // 4. Mac menu-bar tray (template = black + transparent)
  console.log("→ Generating tray-mac.png (16×16 monochrome template)…");
  await sharp(SOURCE)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .greyscale()
    .threshold(128)
    .negate({ alpha: false })
    .png()
    .toFile(path.join(ASSETS, "tray-mac.png"));

  console.log("\n✓ All icons generated:");
  for (const f of fs.readdirSync(ASSETS)) {
    const stat = fs.statSync(path.join(ASSETS, f));
    if (stat.isFile()) {
      console.log(`   ${f.padEnd(20)} ${(stat.size / 1024).toFixed(1)} KB`);
    }
  }
  console.log("\n→ Now run: npm run build:win  (or :mac / :linux)\n");
})();
