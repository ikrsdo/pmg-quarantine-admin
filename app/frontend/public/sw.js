// Deliberately does no offline caching - this app always needs the network
// (it proxies live PMG data). Its only job is to stop installed iOS/Android
// PWAs from serving a stale app shell: it forces every navigation (page
// load) to bypass the HTTP cache, and takes over from any previous version
// of itself immediately instead of waiting for all tabs to close.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => fetch(event.request)),
    );
  }
});
