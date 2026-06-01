// Splash hide — externalized from index.html so the page needs no inline
// executable script, which lets the CSP drop script-src 'unsafe-inline'.
// Splash shows ~5s, then fades; React mounts behind it regardless.
(function () {
  var SPLASH_MS = 5000;
  setTimeout(function () {
    var splash = document.getElementById("splash");
    if (splash) {
      splash.style.transition = "opacity 0.5s ease";
      splash.style.opacity = "0";
      setTimeout(function () { splash.remove(); }, 500);
    }
  }, SPLASH_MS);
})();
