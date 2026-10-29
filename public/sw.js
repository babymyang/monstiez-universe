/* MONSTIEZ Universe service worker — minimal, safe caching.
 * Strategy:
 *  - navigation requests: network-first, fall back to cached shell/offline page
 *  - static assets (fonts, icons, illustrations): cache-first
 *  - never cache non-GET, never cache cross-origin media (YouTube/Spotify)
 */
const VERSION = "monstiez-v1";
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
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
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
  // only handle same-origin — never intercept YouTube/Spotify media
  if (url.origin !== self.location.origin) return;

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
          return cached || caches.match("/offline") || new Response("Offline", { status: 503 });
        }),
    );
    return;
  }

  if (url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/illustrations/")) {
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
  }
});
