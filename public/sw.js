// Minimal service worker for installable PWA behavior.
// Ported from the prototype's inline registration. A real offline strategy
// (precache + runtime caching) can be layered on with Workbox in production.
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());
self.addEventListener("fetch", (e) => {
  // pass-through; placeholder for future caching strategy
});
