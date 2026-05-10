// VRIKAAN extension — settings page
const els = {
  autoBadge: document.getElementById("auto-badge"),
  ctxMenu: document.getElementById("ctx-menu"),
  apiBase: document.getElementById("api-base"),
  save: document.getElementById("save"),
  saved: document.getElementById("saved"),
};

const DEFAULTS = {
  autoBadge: true,
  ctxMenu: true,
  apiBase: "https://vrikaan.com/api/tools",
};

chrome.storage.sync.get(DEFAULTS, (data) => {
  els.autoBadge.checked = !!data.autoBadge;
  els.ctxMenu.checked = !!data.ctxMenu;
  els.apiBase.value = data.apiBase || DEFAULTS.apiBase;
});

els.save.addEventListener("click", () => {
  const apiBase = els.apiBase.value.trim() || DEFAULTS.apiBase;
  chrome.storage.sync.set({
    autoBadge: els.autoBadge.checked,
    ctxMenu: els.ctxMenu.checked,
    apiBase,
  }, () => {
    els.saved.style.display = "block";
    setTimeout(() => { els.saved.style.display = "none"; }, 1800);
  });
});
