// Minimal service worker for installable PWA behavior.
// Ported from the prototype's inline registration. A real offline strategy
// (precache + runtime caching) can be layered on with Workbox in production.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
self.addEventListener("fetch", () => {
  // pass-through; placeholder for future caching strategy
});
