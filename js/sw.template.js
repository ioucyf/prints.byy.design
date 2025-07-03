const CACHE_NAME = 'cache-abc123'; // Inject SHA here at build time

const ASSETS = [
  '/',
  '/css/reset.css',
  '/css/global.css',
  '/css/main.css',
  '/css/print.css',
  '/css/button.css',
  '/js/main.js',
  '/js/sw.installer.js',
  '/assets/icon-1024.png',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// Handle update messages
self.addEventListener('message', async event => {
  if (event.data === 'check-for-update') {
    const keys = await caches.keys();
    const current = keys.find(k => k.startsWith('cache-'));
    if (current !== CACHE_NAME) {
      await caches.delete(current);
      const newCache = await caches.open(CACHE_NAME);
      await newCache.addAll(ASSETS);
      const clients = await self.clients.matchAll();
      clients.forEach(c => c.postMessage('reload'));
    } else {
      const clients = await self.clients.matchAll();
      clients.forEach(c => c.postMessage('no-update'));
    }
  }
});