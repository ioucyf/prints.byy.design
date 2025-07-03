const OWNER = 'ioucyf'; // GitHub username or org
const REPO = 'prints.byy.design';     // Your repo name
const BRANCH = 'main';
const ASSETS = [
  '/', // adjust if your HTML is not served at root
  '/css/reset.css',
  '/css/global.css',
  '/css/main.css',
  '/css/print.css',
  '/css/button.css',
  '/js/main.js',
  '/js/sw.installer.js',

  '/assets/icon-1024.png',
  '/manifest.json',
  // add all assets you want cached
];

const getCurrentCacheName = async () => {
  const keys = await caches.keys();
  const cacheKey = keys.find(k => k.startsWith('cache-'));
  return cacheKey || null;
};

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// ð Listen for 'update' request from page
self.addEventListener('message', event => {
  if (event.data === 'check-for-update') {
    handleUpdate(event);
  }
});

async function handleUpdate(event) {
  const currentCache = await getCurrentCacheName();
  const currentSHA = currentCache?.replace('cache-', '');

  if (currentSHA !== '__BUILD_SHA__') {

    if (currentCache) {
      await caches.delete(currentCache);
    }

    const newCache = await caches.open(CACHE_NAME);
    await newCache.addAll(ASSETS);

    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== CACHE_NAME) await caches.delete(key);
    }

    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage('reload');
    }
  } else {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage('no-update');
    }
  }
}

const CACHE_NAME = 'cache-__BUILD_SHA__';