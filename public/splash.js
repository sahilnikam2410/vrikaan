// Splash hide — externalized from index.html so the page needs no inline
// executable script (lets CSP drop script-src 'unsafe-inline').
// Hides as soon as React mounts (vrikaan:ready event), with a hard fallback.
// pointer-events is killed the instant we start fading so the splash never
// eats the user's first click during the fade.
(function () {
  var FALLBACK_MS = 2500; // safety net if the ready event never fires
  var hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    var splash = document.getElementById("splash");
    if (!splash) return;
    splash.style.pointerEvents = "none";   // stop intercepting clicks NOW
    splash.style.transition = "opacity 0.4s ease";
    splash.style.opacity = "0";
    setTimeout(function () { if (splash.parentNode) splash.remove(); }, 420);
  }
  window.addEventListener("vrikaan:ready", hide);
  setTimeout(hide, FALLBACK_MS);
})();
