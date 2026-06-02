const CACHE_NAME = "vrikaan-v45";
const STATIC_CACHE = "vrikaan-static-v45";
const API_CACHE = "vrikaan-api-v45";
// "/" left in for offline-first first-paint; "/index.html" removed because
// the precache version of it pinned old chunk hashes → ChunkLoadError after
// deploy. The fetch handler's network-first HTML strategy refreshes "/" on
// every visit anyway.
const PRECACHE_URLS = ["/", "/favicon.svg", "/manifest.json", "/offline.html", "/wolf-mark.png", "/wolf-icon.png"];

// Idempotent /api/tools queries safe to cache (GET-only, public-data tools).
// Anything not in this set bypasses the runtime cache.
const API_CACHEABLE_TOOLS = new Set(["ip", "leak-check"]);
const API_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Install: precache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  const allowedCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !allowedCaches.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: smart caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests + Vercel vitals beacons
  if (url.hostname.includes("vercel") && url.pathname.includes("vitals")) return;
  if (url.hostname !== self.location.hostname) return;

  // /api/tools — runtime cache for whitelisted GET tools (network-first, 5min TTL).
  // Tools not in API_CACHEABLE_TOOLS pass through untouched (no caching).
  if (url.pathname === "/api/tools" && url.searchParams.get("tool") && API_CACHEABLE_TOOLS.has(url.searchParams.get("tool"))) {
    event.respondWith(handleToolRequest(request));
    return;
  }
  if (url.pathname.startsWith("/api/")) return;

  // Static assets (JS, CSS, images) — Cache First
  if (url.pathname.startsWith("/assets/") || url.pathname.match(/\.(svg|png|jpg|jpeg|webp|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages — Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline.html")))
  );
});

// Network-first with TTL fallback for /api/tools whitelist.
// On hit: serve fresh, store with sw-cached-at header. On miss/fail: serve cached if < TTL.
async function handleToolRequest(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      // Re-build response so we can stamp the cache time without losing the body.
      const body = await fresh.clone().text();
      const stamped = new Response(body, {
        status: fresh.status,
        statusText: fresh.statusText,
        headers: { ...Object.fromEntries(fresh.headers), "sw-cached-at": String(Date.now()) },
      });
      cache.put(request, stamped.clone());
      return stamped;
    }
    // Non-2xx falls through to cached fallback below.
  } catch {
    /* offline — fall through */
  }
  const cached = await cache.match(request);
  if (cached) {
    const cachedAt = parseInt(cached.headers.get("sw-cached-at") || "0", 10);
    if (Date.now() - cachedAt < API_TTL_MS) return cached;
    // Stale: still serve it (better than nothing) but mark for the client.
    return new Response(await cached.text(), {
      status: cached.status,
      headers: { ...Object.fromEntries(cached.headers), "sw-stale": "1" },
    });
  }
  return new Response(JSON.stringify({ error: "offline and no cache" }), {
    status: 503, headers: { "Content-Type": "application/json" },
  });
}
