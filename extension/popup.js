// VRIKAAN Browser Extension — popup logic
// Talks to https://vrikaan.com/api/tools?tool=*

const API_BASE = "https://vrikaan.com/api/tools";

// ─── Tab switching ──────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

// ─── Helpers ────────────────────────────────────────────────────────
function setText(id, html) { document.getElementById(id).innerHTML = html; }
function loading(id) { setText(id, '<div class="loading">⏳ Analyzing…</div>'); }
function errorMsg(id, msg) { setText(id, `<div class="error">${escapeHtml(msg)}</div>`); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

const VERDICT_META = {
  safe:       { color: "#22c55e", emoji: "✅", label: "Looks safe" },
  suspicious: { color: "#fbbf24", emoji: "⚠️", label: "Suspicious" },
  dangerous:  { color: "#ef4444", emoji: "🚨", label: "Dangerous" },
};

function renderVerdict(containerId, data) {
  const meta = VERDICT_META[data.verdict] || VERDICT_META.suspicious;
  const flags = (data.redFlags || []).map((f) => `<li>${escapeHtml(f)}</li>`).join("");
  const advice = (data.advice || []).map((a) => `<li>${escapeHtml(a)}</li>`).join("");
  setText(containerId, `
    <div class="verdict-card" style="--vc:${meta.color}">
      <div class="verdict-head">
        <span class="verdict-emoji">${meta.emoji}</span>
        <span class="verdict-label">${meta.label}</span>
        <span class="verdict-score">${data.score || 0}/100</span>
      </div>
      <p class="verdict-reason">${escapeHtml(data.reasoning || "")}</p>
      ${flags ? `<ul class="verdict-list">${flags}</ul>` : ""}
      ${advice ? `<p class="label" style="margin-top:8px">What to do</p><ul class="verdict-list">${advice}</ul>` : ""}
    </div>
  `);
}

async function postJson(tool, body) {
  const r = await fetch(`${API_BASE}?tool=${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

// ─── Tab 1: current page ────────────────────────────────────────────
let currentTab = null;
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentTab = tabs[0];
  if (currentTab?.url) {
    document.getElementById("current-url").textContent = currentTab.url;
  }
});

document.getElementById("btn-scan-url").addEventListener("click", async () => {
  if (!currentTab?.url) return;
  loading("page-result");
  try {
    // Use scam-check on the URL string itself — Gemini analyzes domain, path, params for phishing patterns.
    const data = await postJson("scam-check", {
      text: `URL the user is about to interact with: ${currentTab.url}\nPage title: ${currentTab.title || ""}`,
      channel: "url",
    });
    renderVerdict("page-result", data);
  } catch (e) { errorMsg("page-result", e.message); }
});

document.getElementById("btn-headers").addEventListener("click", async () => {
  if (!currentTab?.url) return;
  loading("page-result");
  try {
    const r = await fetch(`${API_BASE}?tool=security-headers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentTab.url }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    const grade = data.grade || "?";
    const color = grade === "A" ? "#22c55e" : grade === "B" ? "#14e3c5" : grade === "C" ? "#fbbf24" : "#ef4444";
    setText("page-result", `
      <div class="verdict-card" style="--vc:${color}">
        <div class="verdict-head">
          <span class="verdict-emoji">🛡</span>
          <span class="verdict-label">Headers grade: ${grade}</span>
          <span class="verdict-score">${data.score || 0}/100</span>
        </div>
        <p class="verdict-reason">${data.summary?.present || 0} present · ${data.summary?.missing || 0} missing · ${data.summary?.misconfigured || 0} misconfigured</p>
      </div>
    `);
  } catch (e) { errorMsg("page-result", e.message); }
});

// ─── Report current site into Scam DNA ──────────────────────────────
document.getElementById("btn-report").addEventListener("click", () => {
  if (!currentTab?.url) return;
  let host;
  try { host = new URL(currentTab.url).hostname.replace(/^www\./, ""); } catch { return; }
  if (!host || host.endsWith("vrikaan.com")) { errorMsg("page-result", "Nothing to report here."); return; }
  loading("page-result");
  chrome.runtime.sendMessage({ type: "vrikaan-report", identifier: host, category: "phishing" }, (r) => {
    if (r && r.ok) setText("page-result", `<div class="verdict-card" style="--vc:#22c55e"><div class="verdict-head"><span class="verdict-emoji">🚩</span><span class="verdict-label">Reported — thank you</span></div><p class="verdict-reason">${escapeHtml(host)} added to VRIKAAN's Scam DNA network. Your report protects the next person.</p></div>`);
    else errorMsg("page-result", "Could not report. Try again.");
  });
});

// ─── Tab 2: paste-text scam check ───────────────────────────────────
document.getElementById("btn-scam").addEventListener("click", async () => {
  const text = document.getElementById("scam-text").value.trim();
  const channel = document.getElementById("scam-channel").value;
  if (text.length < 5) { errorMsg("scam-result", "Paste at least 5 characters."); return; }
  loading("scam-result");
  try {
    const data = await postJson("scam-check", { text, channel });
    renderVerdict("scam-result", data);
  } catch (e) { errorMsg("scam-result", e.message); }
});

// ─── Tab 3: breach check ────────────────────────────────────────────
document.getElementById("btn-breach").addEventListener("click", async () => {
  const email = document.getElementById("breach-email").value.trim();
  if (!email.includes("@")) { errorMsg("breach-result", "Enter a valid email."); return; }
  loading("breach-result");
  try {
    const data = await postJson("breach-check", { email });
    const breachCount = data.breaches?.length || 0;
    const color = breachCount === 0 ? "#22c55e" : breachCount > 4 ? "#ef4444" : "#fbbf24";
    const emoji = breachCount === 0 ? "✅" : "⚠️";
    const flags = (data.breaches || []).slice(0, 5).map((b) => `<li>${escapeHtml(b.name)} (${b.year}) — ${b.severity || "?"}</li>`).join("");
    setText("breach-result", `
      <div class="verdict-card" style="--vc:${color}">
        <div class="verdict-head">
          <span class="verdict-emoji">${emoji}</span>
          <span class="verdict-label">${breachCount === 0 ? "No breaches found" : `${breachCount} breach${breachCount === 1 ? "" : "es"} found`}</span>
        </div>
        <p class="verdict-reason">${breachCount === 0 ? "Your email was not found in any known data breach in our database." : "Change passwords on the affected services. Enable 2FA on every account that supports it."}</p>
        ${flags ? `<ul class="verdict-list">${flags}</ul>` : ""}
      </div>
    `);
  } catch (e) { errorMsg("breach-result", e.message); }
});
