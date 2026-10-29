/* MONSTIEZ Universe service worker — minimal, safe caching. v2
 * Strategy:
 *  - navigation requests: network-first → cache → /offline fallback
 *  - hashed static assets (/_next/static/*, fonts, icons): cache-first (immutable)
 *  - other same-origin GET: network-first → cache
 *  - never cache non-GET, never intercept cross-origin media (YouTube/Spotify)
 */
const VERSION = "monstiez-v2";
const SHELL = [
  "/",
  "/home",
  "/stats",
  "/members/ahyeon",
  "/discover",
  "/events",
  "/my-baemon",
  "/offline",
  "/manifest.webmanifest",
  "/fonts/NunitoSans-400.woff2",
  "/fonts/Baloo2-700.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await cache.addAll(SHELL);
      // precache all hashed build assets so the FIRST visit enables offline
      try {
        const res = await fetch("/sw-precache.json");
        if (res.ok) {
          const assets = await res.json();
          if (Array.isArray(assets) && assets.length > 0) {
            await cache.addAll(assets);
          }
        }
      } catch {
        /* precache list unavailable — runtime caching still applies */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Immutable hashed assets — cache-first, populate as they are fetched
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/illustrations/")
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return (
            cached ||
            caches.match("/offline") ||
            new Response("<h1>Offline</h1>", {
              status: 503,
              headers: { "Content-Type": "text/html" },
            })
          );
        }),
    );
    return;
  }

  // other same-origin GETs — network-first with cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || Response.error())),
  );
});
